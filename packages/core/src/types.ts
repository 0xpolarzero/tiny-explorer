import { abi } from "@shazow/whatsabi";
import { Address, Hex } from "tevm";
import { Log } from "viem";

export type ContractDetails = {
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

export type GetTransactionsInput = {
  chainId: string;
  contractAddress: Address;
  fromBlock?: string;
  toBlock?: string;
  abi: abi.ABI;
};

export type GetDecodedTransactionsInput = {
  chainId: number | string;
  abi: abi.ABI;
  transactions: Array<TransactionRaw>;
};

export type TransactionRaw = {
  hash: Hex;
  logs: Log[];
};

export type TransactionDetails = {
  hash: Hex;
  blockNumber: string;
  details: {
    tx: {
      functionName: string;
      data: Hex;
      args?: Record<string, unknown>;
      from: Address;
      to: Address | null;
      value: string;
    };
    logs: Array<{
      eventName: string;
      data: Hex;
      args?: Record<string, unknown>;
    }>;
  };
};
