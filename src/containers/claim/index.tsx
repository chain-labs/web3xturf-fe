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
import { CONTRACT_ADDRESS, PAYMASTER_URL } from "@/constants";
import { handleEncryptandPin } from "./utils/lit";
import contracts from "@/contracts.json";
import { FETCH_TREE_CID, getMerkleHashes, hashQueryData } from "./utils/hash";
import { FETCH_TREE_CID_QUERY } from "@/graphql/query/fetchTreeCid";
import MerkleTree from "merkletreejs";
import bundler from "./AccountAbstraction/bundler";

type Props = {
  query: QueryProps;
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

const ClaimContainer = ({ query }: Props) => {
  const [proofs, setProofs] = useState(null);

  useEffect(() => {
    if (query?.batchid) {
      console.log({ batchId: query.batchid });

      FETCH_TREE_CID(query?.batchid).then((data) => {
        const hashCID = data?.batches?.[0]?.cid;
        getMerkleHashes(hashCID).then((hashes) => {
          const leafs = hashes.map((entry) => ethers.utils.keccak256(entry));
          const tree = new MerkleTree(leafs, ethers.utils.keccak256, {
            sortPairs: true,
          });
          const leaf = ethers.utils.keccak256(hashQueryData(query));
          const proofs = tree.getHexProof(leaf);
          setProofs(proofs);
        });
      });
    }
  }, [query]);

  useEffect(() => {
    console.log({ query });
    web3auth.initModal();
  }, [query]);

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: PAYMASTER_URL,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Click");

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
    const accounts = await provider.listAccounts();

    const secretHash = await handleEncryptandPin(address, query, provider);

    const abi = [
      contracts?.["80001"][0]?.contracts?.["SimplrEvents"]?.["abi"].find(
        (el) => el.name === "mintTicket"
      ),
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    try {
      const toast1 = toast.info("Wrapping up your Gift....", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const minTx = await contract.populateTransaction.mintTicket(
        address,
        BigNumber.from(query?.batchid),
        hashQueryData(query),
        secretHash,
        proofs
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
        address,
      });

      const userOp = await biconomySmartAccount.buildUserOp([tx1], {
        overrides: {
          maxFeePerGas: ethers.utils.parseUnits("0.1"),
          maxPriorityFeePerGas: ethers.utils.parseUnits("0.1"),
        },
      });
      console.log("Hey Man User Op is this", { userOp, biconomySmartAccount });

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

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      console.log({ biconomySmartAccount, paymasterAndDataResponse, userOp });
      const userOpResponse = await biconomySmartAccount.sendUserOp(userOp);
      console.log({ userOpResponse });
      const { receipt } = await userOpResponse.wait(1);
      toast.success(
        `🪔✨ Your gift has sparked joy! 🎁 May it light up your loved one's Diwali. ✨`,
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
      address,
      accounts,
      biconomySmartAccount,
      secretHash,
    });

    console.log("📮done deal", { secretHash });
  };

  return (
    <div className="border border-black flex flex-col items-center mt-10 p-6 rounded-lg mx-16 bg-slate-100">
      <ToastContainer />
      <h1 className="text-5xl bg-transparent">
        {process.env.NEXT_PUBLIC_EVENT_NAME}
      </h1>
      <button
        className="bg-blue-500 px-4 py-2 rounded-md text-white mt-16"
        onClick={handleLogin}
      >
        Login & Claim
      </button>
    </div>
  );
};

export default ClaimContainer;
