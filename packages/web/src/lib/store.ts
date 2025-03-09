import { Address, MemoryClient } from "tevm";
import { create } from "zustand";

import { ChainOptions, createTevmClient } from "@/lib/providers";

type State = {
  client: MemoryClient | undefined;
  contractAddress: Address | undefined;

  update: (chain: ChainOptions, contractAddress: Address) => void;
};

export const useStore = create<State>()((set) => ({
  client: undefined,
  contractAddress: undefined,

  update: (chain: ChainOptions, contractAddress: Address) => set({ client: createTevmClient(chain), contractAddress }),
}));
