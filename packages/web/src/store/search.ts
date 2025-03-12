import { create } from "zustand";

import { ExplainContractOutput } from "@core/llm/types";

type State = {
  loading: boolean;
  error: boolean;
  output: Partial<ExplainContractOutput> | null;
  subscriptionRef: { unsubscribe: () => void } | null;

  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
  setOutput: (output: Partial<ExplainContractOutput> | null) => void;
  updateOutput: (newData: Partial<ExplainContractOutput>) => void;
  setSubscription: (sub: { unsubscribe: () => void } | null) => void;
  reset: () => void;
};

export const useSearchStore = create<State>()((set, get) => ({
  loading: false,
  error: false,
  output: null,
  subscriptionRef: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setOutput: (output) => set({ output }),
  updateOutput: (newData) =>
    set((state) => ({
      output: state.output ? { ...state.output, ...newData } : newData,
    })),
  setSubscription: (subscriptionRef) => set({ subscriptionRef }),

  reset: () => {
    // Clean up subscription if it exists
    if (get().subscriptionRef) {
      get().subscriptionRef?.unsubscribe();
    }

    set({
      loading: false,
      error: false,
      output: null,
      subscriptionRef: null,
    });
  },
}));
