import { SUBGRAPH_ENDPOINT } from "@/constants";
import { ApolloClient, InMemoryCache } from "@apollo/client";

console.log({ SUBGRAPH_ENDPOINT });

export const client = new ApolloClient({
  uri: SUBGRAPH_ENDPOINT,
  cache: new InMemoryCache(),
});

export default ApolloClient;
