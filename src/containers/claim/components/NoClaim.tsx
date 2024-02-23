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
import {
  BG_ELEMENT,
  BG_GRADIENT,
  CALENDAR_ICON,
  LOCATION_ICON,
  LOGO,
  ORGANIZER,
  SIMPLR_EVENTS,
  TICKET_ICON,
  dateTimeText,
  heroText,
  locationText,
  subHeader,
} from "@/copy";
import Image from "next/image";

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
    <div className=" min-h-[100vh] max-h-[100vh] md:bg-bottom  bg-center  bg-no-repeat overflow-hidden">
      <div className="bg-black-text before:bg-gradient-url h-[100vh] w-[100vw] before:bg-cover before:bg-no-repeat before:bg-center before:mix-blend-hard-light relative before:absolute before:w-[100vw] before:h-[100vh]">
        {/* <h2 className="font-PlayfairDisplay text-xs md:text-2xl mt-4 font-normal text-orange-900">
          {subHeader}
        </h2> */}
        <div className="bg-gradient-url mix-blend-screen h-[775px] w-[775px] rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/2 animate-spin-element  mix-blend-color-dodge  border border-black">
          <div className="relative h-[674px] w-[674px] ">
            <Image
              className="object-contain"
              src={BG_ELEMENT}
              fill
              alt="logo"
            />
          </div>
        </div>
        <div className="absolute z-2 top-0 left- w-full flex items-end justify-between px-[96px] pt-20">
          <div className="flex flex-col items-center ">
            <h3 className="text-white font-medium text-[16px] opacity-60">
              Organized by:
            </h3>
            <div className="relative h-[84px] w-[84px] mt-[32px]">
              <Image src={ORGANIZER} alt="organizer-logo" fill />
            </div>
            <div className="relative h-[44px] w-[124px] mt-[32px]">
              <Image
                className="object-contain"
                src={SIMPLR_EVENTS}
                alt="simplr-events-logo"
                fill
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative h-[70px] w-[70px]">
              <Image src={LOGO} fill alt="logo" />d
            </div>
            <h1 className="text-2xl md:text-[64px] mt-8 text-black-text font-bold">
              {heroText}
            </h1>
            <div className="mt-10 flex items-center text-black-text">
              <div className="h-[24px] w-[24px] relative">
                <Image src={CALENDAR_ICON} fill alt="cal-icon" />
              </div>
              <h3 className="text-xs md:text-[16px] font-medium ">
                {`${dateTimeText} `}
              </h3>
            </div>
            <div className="flex items-center mt-2 text-black-text">
              <div className="h-[24px] w-[24px] relative">
                <Image src={LOCATION_ICON} fill alt="cal-icon" />
              </div>
              <h3 className="text-xs md:text-[16px] font-medium ">
                {locationText}
              </h3>
            </div>
            {/* <div className="border-b border-b-orange-900 w-[80vw] mt-6" /> */}
            {!address ? (
              <button
                className="flex items-center border-[9px] border-[#E2E7FF] rounded-[35px] bg-white py-[24px] px-[16px] font-black text-[25px] mt-8 text-black-text"
                onClick={handleLogin}
              >
                <div className="h-[32px] w-[32px] relative mr-2">
                  <Image src={TICKET_ICON} fill alt="cal-icon" />
                </div>
                Claim Ticket
              </button>
            ) : null}
            {address ? <ViewTickets smartAccount={smartAccount} /> : null}
          </div>
          <div className="flex flex-col items-center self-center">
            <h3 className="text-white font-medium text-[16px] opacity-60">
              Tickets Powered by:
            </h3>
            <div className="relative h-[44px] w-[124px] mt-[32px]">
              <Image
                className="object-contain"
                src={SIMPLR_EVENTS}
                alt="simplr-events-logo"
                fill
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoClaim;
