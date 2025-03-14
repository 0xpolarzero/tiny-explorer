import { Address, Hex } from "tevm";
import { z } from "zod";

import { EXPLAIN_CONTRACT, EXPLAIN_TRANSACTION } from "@core/llm/index";

export type ExplainContractInput = {
  chainId: string;
  contractAddress: Address;
};

export type ExplainTransactionInput = {
  chainId: string;
  transactionHash: Hex;
};

export type ExplainTransactionOutput = z.infer<typeof EXPLAIN_TRANSACTION.outputSchema>;
export type ExplainContractOutput = z.infer<typeof EXPLAIN_CONTRACT.outputSchema>;

export type StreamCallbacks<T> = {
  onProgress: (obj: Partial<T>) => void;
  onComplete: (obj: T) => void;
  onError: (err: Error) => void;
};
