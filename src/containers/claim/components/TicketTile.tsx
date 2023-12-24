import { NFT_ADDRESS } from "@/constants";
import { ITicket } from "@/graphql/query/fetchHolderTickets";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

const TicketTile = ({
  ticket,
  ticketURI,
  isRevealed,
}: {
  ticket: ITicket;
  ticketURI: string;
  isRevealed: boolean;
}) => {
  const [ticketImg, setTicketImg] = useState("");

  useEffect(() => {
    axios
      .get(isRevealed ? `${ticketURI}/${ticket.tokenId}.json` : ticketURI)
      .then((res) => {
        console.log({ res: res.data });

        const imageCID = res.data.image.split("//")[1];
        console.log({ imageCID });

        setTicketImg(`https://nftstorage.link/ipfs/${imageCID}`);
      });
  }, [isRevealed, ticket.tokenId, ticketURI]);

  return (
    <a
      href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}${NFT_ADDRESS}/${ticket.tokenId}`}
      target="_blank"
    >
      <div className="md:max-w-[250px] max-w-[125px]">
        <div className="rounded-md border border-green-300 bg-green-100 py-4">
          <div className="relative mb-4 h-24 w-full md:h-32 lg:h-48">
            <Image
              src={ticketImg}
              fill
              alt="ticket_img"
              style={{ objectFit: "contain" }}
            />
          </div>
          <h3 className="md:text-lg text-sm px-4 font-semibold">{`#${ticket.tokenId} ${ticket?.simplrEvent?.name}`}</h3>
        </div>
      </div>
    </a>
  );
};

export default TicketTile;
