import { abi } from "@shazow/whatsabi";

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

export type ExplainContractOutput = {
  overview: string;
  events: Array<{ name: string }>; // TODO: details of each event by llm
};

export type ExplainEventInput = ExplainContractInput & {
  event: { name: string }; // TODO: what comes from the event listener
};

export type ExplainEventOutput = {
  summary: string;
  details: string;
};
