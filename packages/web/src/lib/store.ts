import { Address } from "tevm";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Chain, getChain, SUPPORTED_CHAINS } from "@core/chains";

type State = {
  chainId: number;
  contractAddress: Address | undefined;

  update: (chain: Chain, contractAddress: Address) => void;
  getCurrentChain: () => Chain;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      chainId: SUPPORTED_CHAINS[0].id,
      contractAddress: undefined,

      getCurrentChain: () => {
        const { chainId } = get();
        return getChain(chainId);
      },

      update: (chain: Chain, contractAddress: Address) => {
        // Update state
        set({ chainId: chain.id, contractAddress });

        // Start fetching contract explanation from the LLM
      },
    }),
    {
      name: "contract-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chainId: state.chainId,
        contractAddress: state.contractAddress,
      }),
    },
  ),
);
