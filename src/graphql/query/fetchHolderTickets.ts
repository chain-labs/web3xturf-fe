import { gql } from "@apollo/client";

const FETCH_HOLDER_TICKETS = gql`
  query FetchHolderTickets(
    $user_address_contains: String,
    $event_address_contains: Bytes,
    $first: Int = 10
  ) {
    tickets(
      where: {
        holder_: { address_contains: $user_address_contains }
        simplrEvent_: { address_contains: $event_address_contains }
      }
      orderBy: tokenId
      orderDirection: desc
      first: $first
    ) {
      tokenId
      metadataCid
      creationTimeStamp
      creationTrx
      dataCid
      simplrEvent {
        name
      }
      holder {
        address {
          id
        }
      }
    }
  }
`;

export default FETCH_HOLDER_TICKETS;

export interface ITicket {
  tokenId: string;
  metadataCid: string;
  creationTimeStamp: string;
  creationTrx: string;
  dataCid: string;
  simplrEvent: {
    name: string;
  };
  holder: {
    address: {
      id: string;
    };
  };
}
