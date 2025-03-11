import { Common, mainnet } from "tevm/common";

import { parseEnv } from "./env";

/* ---------------------------------- TYPES --------------------------------- */
export type ChainConfig = Common & {
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
export const SUPPORTED_CHAINS = [mainnet] as const satisfies Array<Common>;
// Use this from the server only as this will use env variables
export const getChainConfig = ({ chainId }: { chainId: number | string }) => {
  const env = parseEnv("server");

  const chain = SUPPORTED_CHAINS.find((chain) => chain.id.toString() === chainId.toString());
  if (!chain) throw new Error("Chain not supported");

  switch (chainId.toString()) {
    case mainnet.id.toString():
      return {
        ...mainnet,
        rpcUrl: env ? env.MAINNET_RPC_URL : "",
        etherscan: {
          apiUrl: "https://api.etherscan.io/api",
          apiKey: env ? env.MAINNET_ETHERSCAN_API_KEY : "",
        },
        blockscout: {
          apiUrl: "https://eth.blockscout.com/api",
          apiKey: env.MAINNET_BLOCKSCOUT_API_KEY,
        },
      } as const satisfies ChainConfig;
  }
};
