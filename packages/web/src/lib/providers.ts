import { createMemoryClient, http } from "tevm";
import { Common, mainnet } from "tevm/common";
import { Chain as ViemChain } from "viem";

/* ---------------------------------- TYPES --------------------------------- */
export type ChainOptions = {
  chain: ViemChain & Common;
  rpcUrl: string;
};

/* --------------------------------- CHAINS --------------------------------- */
export const SUPPORTED_CHAINS = [
  {
    chain: mainnet,
    rpcUrl: "https://eth.llamarpc.com",
  },
] as const satisfies Array<ChainOptions>;

/* ---------------------------------- UTILS --------------------------------- */
export const createTevmClient = ({ chain, rpcUrl }: ChainOptions) =>
  createMemoryClient({
    fork: { transport: http(rpcUrl)({}) },
    common: chain,
  });
