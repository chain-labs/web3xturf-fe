import { gql } from "@apollo/client";

export const FETCH_TREE_CID_QUERY = gql`
  query FetchTreeCid($id: BigInt!, $address: Bytes!) {
    batches(
      where: {batchId: $id, simplrEvent_: {address: $address}}
    ) {
      batchId
      cid
      simplrEvent {
        address
      }
    }
  }
`;
