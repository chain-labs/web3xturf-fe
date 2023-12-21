import { client } from "@/components/ApolloClient";
import { FETCH_TREE_CID_QUERY } from "@/graphql/query/fetchTreeCid";
import axios from "axios";
import { ethers } from "ethers";

export const hashQueryData = (query) => {
  const { emailid, lastname, firstname, eventname, batchid } = query;
  const concatenatedString = `${emailid}-${lastname}-${firstname}-${batchid}-${eventname}`;
  console.log({ concatenatedString });

  const hash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(concatenatedString)
  );
  return hash;
};

export const getMerkleHashes = async (cid: string) => {
  const url = `https://simplr.mypinata.cloud/ipfs/${cid}`;
  const { data } = await axios.get(url);
  const hashes = JSON.parse(Object.keys(data)[0]);
  return hashes;
};

export const FETCH_TREE_CID = async (id: string) => {
  const tree_cid = await client.query({
    query: FETCH_TREE_CID_QUERY,
    variables: {
      id,
    },
  });

  console.log({ tree_cid });

  return tree_cid.data;
};
