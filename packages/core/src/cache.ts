import { Hex } from "tevm";

import { ExplainContractInput } from "@core/llm/types";

export const getCacheKey = {
  explainContract: (input: ExplainContractInput) => `contract_explain:${input.chainId}:${input.contractAddress}`,
  getContractDetails: (input: ExplainContractInput) => `contract_details:${input.chainId}:${input.contractAddress}`,
  getTransactionDetails: (hash: Hex) => `transaction_details:${hash}`,
  getTransactionExplanation: (hash: Hex) => `transaction_explanation:${hash}`,
};
