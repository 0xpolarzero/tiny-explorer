import { Common, mainnet } from "tevm/common";

import { parseEnv } from "./env";

const env = parseEnv();

/* ---------------------------------- TYPES --------------------------------- */
export type Chain = Common & {
  rpcUrl: string;
  etherscan?: {
    apiUrl: string;
    apiKey: string;
  };
  blockscout?: {
    apiUrl: string;
    apiKey: string;
  };
};

/* --------------------------------- CHAINS --------------------------------- */
export const SUPPORTED_CHAINS = [
  {
    ...mainnet,
    rpcUrl: env.MAINNET_RPC_URL,
    etherscan: {
      apiUrl: "https://api.etherscan.io/api",
      apiKey: env.MAINNET_ETHERSCAN_API_KEY,
    },
    blockscout: {
      apiUrl: "https://eth.blockscout.com/api",
      apiKey: env.MAINNET_BLOCKSCOUT_API_KEY,
    },
  },
] as const satisfies Array<Chain>;

/* ---------------------------------- UTILS --------------------------------- */
export const getChain = (chainId: number | string): Chain => {
  const chain = SUPPORTED_CHAINS.find((chain) => chain.id.toString() === chainId.toString());
  if (!chain) throw new Error("Chain not supported");

  return chain;
};
