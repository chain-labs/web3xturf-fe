import NoClaim from "@/containers/claim/components/NoClaim";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";

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

export default function Home() {
  return <NoClaim web3Auth={web3auth} />;
}
