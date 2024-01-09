import { BiconomySmartAccountV2 } from "@biconomy/account";
import { ChainId } from "@biconomy/core-types";
import {
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
  DEFAULT_ENTRYPOINT_ADDRESS,
  ECDSAOwnershipValidationModule,
} from "@biconomy/modules";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import React, { useState } from "react";
import bundler from "../AccountAbstraction/bundler";
import paymaster from "../AccountAbstraction/paymaster";
import ViewTickets from "./viewTickets";

type Props = {
  web3Auth: Web3Auth;
};

const NoClaim = ({ web3Auth }: Props) => {
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2>();
  const [address, setAddress] = useState<string>();
  const handleLogin = async (e) => {
    console.log("login man", web3Auth);

    e.preventDefault();

    const web3AuthProvider = await web3Auth.connect();

    const user = await web3Auth.getUserInfo();

    const provider = new ethers.providers.Web3Provider(web3AuthProvider);

    const signer = provider.getSigner();

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

    setSmartAccount(biconomySmartAccount);
    setAddress(smartAccountAddress);
  };

  return (
    <div className=" min-h-[100vh] bg-url-bg bg-cover md:bg-bottom bg-center  bg-no-repeat">
      <div className="flex flex-col items-center pt-6 md:pt-0 ">
        <h2 className="font-PlayfairDisplay text-xs md:text-2xl mt-4 font-normal text-orange-900">
          World Popcorn Federation presents
        </h2>
        <h1 className="text-4xl md:text-8xl mt-4 text-orange-900">
          Popcorn Day 2024
        </h1>
        <h3 className="text-xs md:text-xl mt-2 font-PlayfairDisplay ">
          Jan 19th, 2024 | 6PM onwards |{" "}
          <span>
            <a
              href={process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL}
              className="underline"
            >
              {`Google Maps`}
              <span>{"->"}</span>
            </a>
          </span>
        </h3>
        <div className="border-b border-b-orange-900 w-[80vw] mt-6" />
        {!address ? (
          <button
            className="flex items-center bg-orange-200 px-4 py-2 shadow-xl text-orange-900 mt-4 font-PlayfairDisplay"
            onClick={handleLogin}
          >
            Login and View Tickets
          </button>
        ) : null}

        {address ? <ViewTickets smartAccount={smartAccount} /> : null}
      </div>
    </div>
  );
};

export default NoClaim;
