import React, { useEffect, useState } from "react";
import { QueryProps } from "./types";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { polygonMumbai } from "viem/chains";
import {
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
  ECDSAOwnershipValidationModule,
} from "@biconomy/modules";
import { BigNumber, ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ChainId } from "@biconomy/core-types";
import { Bundler, IBundler } from "@biconomy/bundler";
import {
  BiconomyPaymaster,
  IHybridPaymaster,
  IPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
} from "@biconomy/paymaster";
import { CONTRACT_ADDRESS, NFT_ADDRESS, PAYMASTER_URL } from "@/constants";
import { handleEncryptandPin } from "./utils/lit";
import contracts from "@/contracts.json";
import { FETCH_TREE_CID, getMerkleHashes, hashQueryData } from "./utils/hash";
import { FETCH_TREE_CID_QUERY } from "@/graphql/query/fetchTreeCid";
import MerkleTree from "merkletreejs";
import bundler from "./AccountAbstraction/bundler";
import ViewTickets from "./components/viewTickets";
import NoClaim from "./components/NoClaim";
import paymaster from "./AccountAbstraction/paymaster";

type Props = {
  query: QueryProps;
  noClaim?: boolean;
};

const Web3AuthOptions: Web3AuthOptions = {
  clientId: `${process.env.NEXT_PUBLIC_WEB3AUTH_ID}`,
  web3AuthNetwork: "sapphire_devnet",
  authMode: "DAPP",
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x13881",
    rpcTarget: "https://rpc-mumbai.maticvigil.com/",
    blockExplorer: "https://mumbai.polygonscan.com/",
    displayName: "Polygon Mumbai",
    ticker: "MATIC",
    tickerName: "Matic",
  },
};

const web3auth = new Web3Auth(Web3AuthOptions);

const MINT_STEPS = {
  INITIAL: 0,
  MINTING: 1,
  MINTED: 2,
};

const ClaimContainer = ({ query, noClaim }: Props) => {
  const [proofs, setProofs] = useState([]);
  const [mintStep, setMintStep] = useState(MINT_STEPS.INITIAL);
  const [viewTickets, setViewTickets] = useState(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2>();

  useEffect(() => {
    if (query?.batchid) {
      console.log({ batchId: query.batchid, NFT_ADDRESS });

      FETCH_TREE_CID(query?.batchid, NFT_ADDRESS.toLowerCase()).then((data) => {
        const hashCID = data?.batches?.[0]?.cid;
        getMerkleHashes(hashCID).then((hashes) => {
          const leafs = hashes.map((entry) => ethers.utils.keccak256(entry));
          const tree = new MerkleTree(leafs, ethers.utils.keccak256, {
            sortPairs: true,
          });
          const leaf = ethers.utils.keccak256(hashQueryData(query));
          const proofs = tree.getHexProof(leaf);
          console.log("proofs sire", { proofs });

          setProofs(proofs);
        });
      });
    }
  }, [query]);

  useEffect(() => {
    console.log({ query });
    web3auth.initModal();
  }, [query]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMintStep(MINT_STEPS.MINTING);

    const web3AuthProvider = await web3auth.connect();

    const user = await web3auth.getUserInfo();

    const provider = new ethers.providers.Web3Provider(web3AuthProvider);

    const signer = provider.getSigner();

    const address = await signer.getAddress();

    const module_var = await ECDSAOwnershipValidationModule.create({
      signer: signer,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
    });

    const biconomySmartAccount = await BiconomySmartAccountV2.create({
      chainId: ChainId.POLYGON_MUMBAI,
      bundler: bundler,
      paymaster: paymaster,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      defaultValidationModule: module_var,
      activeValidationModule: module_var,
    });

    setSmartAccount(biconomySmartAccount);
    const accounts = await provider.listAccounts();

    const smartAccountAddress = (
      await biconomySmartAccount._getAccountContract()
    ).address;

    const toast1 = toast.info("Wrapping up your Gift....", {
      position: "top-right",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

    const secretHash = await handleEncryptandPin(address, query, provider);

    const abi = [
      contracts?.["80001"][0]?.contracts?.["SimplrEvents"]?.["abi"].find(
        (el) => el.name === "mintTicket"
      ),
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    try {
      const hash = hashQueryData(query);

      console.log("It's here", {
        b: query?.batchid,
        smartAccountAddress,
        hash,
        secretHash,
        proofs,
      });

      const minTx = await contract.populateTransaction.mintTicket(
        smartAccountAddress,
        BigNumber.from(query?.batchid),
        hash,
        secretHash,
        proofs,
        { value: 0 }
      );

      const tx1 = {
        to: CONTRACT_ADDRESS,
        data: minTx.data,
      };
      console.log({
        tx1,
        minTx,
        batchId: BigNumber.from(query?.batchid),
        hash: hashQueryData(query),
        secretHash,
        proofs,
        smartAccountAddress,
      });

      const userOp = await biconomySmartAccount.buildUserOp([tx1]);

      const biconomyPaymaster =
        biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
      console.log({ biconomyPaymaster });

      const paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
        smartAccountInfo: {
          name: "BICONOMY",
          version: "2.0.0",
        },
      };
      console.log({ paymasterServiceData });

      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );
      console.log({ paymasterAndDataResponse });
      if (
        paymasterAndDataResponse.callGasLimit &&
        paymasterAndDataResponse.verificationGasLimit &&
        paymasterAndDataResponse.preVerificationGas
      ) {
        // Returned gas limits must be replaced in your op as you update paymasterAndData.
        // Because these are the limits paymaster service signed on to generate paymasterAndData
        // If you receive AA34 error check here..

        userOp.callGasLimit = paymasterAndDataResponse.callGasLimit;
        userOp.verificationGasLimit =
          paymasterAndDataResponse.verificationGasLimit;
        userOp.preVerificationGas = paymasterAndDataResponse.preVerificationGas;
      }

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      console.log("hehe", {
        biconomySmartAccount,
        paymasterAndDataResponse,
        userOp,
      });
      const userOpResponse = await biconomySmartAccount.sendUserOp(userOp);
      console.log({ userOpResponse });
      const { receipt } = await userOpResponse.wait(1);
      toast.success(
        `✨ Congratulations! You have claimed your NFT Ticket! 🎁  ✨`,
        {
          position: "top-right",
          autoClose: 18000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      setMintStep(MINT_STEPS.MINTED);
      console.log("", { txHash: receipt.transactionHash });
    } catch (err) {
      console.error({ err });
      toast.clearWaitingQueue({ containerId: "toaster" });
      toast.error(`Something Went Wrong!`, {
        position: "top-right",
        autoClose: 18000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }

    console.log({
      module_var: module_var.signer,
      smartAccountAddress,
      accounts,
      biconomySmartAccount,
      secretHash,
    });

    console.log("📮done deal", { secretHash });
  };

  const getButtonText = (state) => {
    switch (state) {
      case MINT_STEPS.INITIAL:
        return "Claim Ticket via Email";
      case MINT_STEPS.MINTING:
        return "Claiming....";
      case MINT_STEPS.MINTED:
        return "View Tickets";
    }
  };

  if (noClaim) {
    return <NoClaim web3Auth={web3auth} />;
  }

  const handleView = () => {
    setViewTickets(true);
  };

  return (
    <div className=" min-h-[100vh] bg-url-bg bg-cover md:bg-bottom bg-center md:bg-contain bg-no-repeat">
      <ToastContainer />
      <div className="flex flex-col items-center pt-36 md:pt-0 ">
        <h2 className="text-xs md:text-2xl mt-4">Dunder Mifflin presents</h2>
        <h1 className="text-4xl md:text-8xl mt-2">A Nutcracker Christmas</h1>
        <h3 className="text-xs md:text-xl mt-2">
          Dec 24th, 2023 | 7PM |{" "}
          <span>
            <a
              href={process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL}
              className="underline"
              target="_blank"
            >
              {`Google Maps`}
              <span>{"->"}</span>
            </a>
          </span>
        </h3>
        <button
          className="bg-rose-500 px-4 py-2 shadow-xl text-white mt-4"
          onClick={mintStep === MINT_STEPS.MINTED ? handleView : handleLogin}
        >
          {getButtonText(mintStep)}
        </button>

        {viewTickets && mintStep === MINT_STEPS.MINTED ? (
          <ViewTickets smartAccount={smartAccount} />
        ) : null}
      </div>
    </div>
  );
};

export default ClaimContainer;
