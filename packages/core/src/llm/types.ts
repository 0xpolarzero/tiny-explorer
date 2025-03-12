import { abi } from "@shazow/whatsabi";
import { z } from "zod";

import { EXPLAIN_CONTRACT, EXPLAIN_EVENT } from "./index";

export type GetContractInput = ExplainContractInput;
export type GetContractOutput = {
  abi: abi.ABI;
  name?: string;
  sources?: Array<
    | {
        name: string;
        content: string;
      }
    | {
        name: string;
        explanation: string;
      }
  >;
};

export type ExplainContractInput = {
  chainId: string;
  contractAddress: string;
};

export type ExplainEventInput = ExplainContractInput & {
  event: { name: string }; // TODO: what comes from the event listener
};

export type ExplainEventOutput = z.infer<typeof EXPLAIN_EVENT.outputSchema>;
export type ExplainContractOutput = z.infer<typeof EXPLAIN_CONTRACT.outputSchema>;
