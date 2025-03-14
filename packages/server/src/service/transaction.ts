import { abi } from "@shazow/whatsabi";
import { Address, decodeEventLog, decodeFunctionData } from "tevm";
import { Log } from "tevm/actions";

import { createTevmClient } from "@core/tevm";
import { GetTransactionsInput, TransactionDetails, TransactionRaw } from "@core/types";
import { debug } from "@server/app/debug";

export type TransactionServiceOptions = {};

export type SubscribeLogsInput = {
  chainId: number | string;
  contractAddress: Address;
  abi: abi.ABI;
  callbacks: {
    onLogs: (logs: Array<Log>) => void;
    onError: (err: Error) => void;
  };
};

// TODO: for subscription: https://www.tevm.sh/core/tevm-node-interface#receipt--log-management
export class TransactionService {
  constructor(config: TransactionServiceOptions) {}

  async getTransactions(input: GetTransactionsInput): Promise<Array<TransactionDetails>> {
    const client = createTevmClient({ chainId: input.chainId });

    try {
      // TODO: hardcoded for now for ease of use
      const currentBlock = await client.getBlockNumber();
      const fromBlock = currentBlock - BigInt(10_000);

      const logs = await client.getLogs({
        address: input.contractAddress,
        fromBlock,
        toBlock: BigInt(input.toBlock ?? 0) || "latest",
      });

      const transactions = logs.reduce((acc, log) => {
        const tx = acc.find((tx) => tx.hash === log.transactionHash);

        if (tx) {
          tx.logs.push(log);
        } else {
          acc.push({ hash: log.transactionHash, logs: [log] });
        }

        return acc;
      }, [] as Array<TransactionRaw>);

      return await Promise.all(
        transactions.map(async ({ hash, logs }) => {
          const tx = await client.getTransaction({ hash });

          // Try to decode function data, but provide fallback if it fails
          let txDetails;
          try {
            if (!tx.to) {
              txDetails = {
                functionName: "Deployment",
                args: [],
              };
            } else {
              txDetails = decodeFunctionData({ abi: input.abi, data: tx.input });
            }
          } catch (err) {
            debug("Failed to decode function data", hash, err);
            txDetails = {
              functionName: tx.input.slice(0, 8),
              args: undefined,
            };
          }

          // Process logs, handling decoding failures for individual logs
          const logsDetails = logs.map((log) => {
            try {
              return decodeEventLog({
                abi: input.abi,
                topics: log.topics,
                data: log.data,
              });
            } catch (err) {
              debug("Failed to decode event log", log.transactionHash, log.logIndex, err);
              return {
                // TODO: pass signature and data
                eventName: "Unknown Event",
                args: undefined,
              };
            }
          });

          return {
            hash: tx.hash,
            blockNumber: tx.blockNumber.toString(),
            details: {
              tx: {
                ...txDetails,
                from: tx.from,
                to: tx.to,
                value: tx.value.toString(),
              },
              logs: logsDetails.map((log) => ({
                eventName: log.eventName as unknown as string,
                args: log.args,
              })),
            },
          };
        }),
      );
    } catch (err) {
      debug("Error getting logs", err);
      throw err;
    }
  }

  async subscribeLogs({ chainId, contractAddress, abi, callbacks: { onLogs, onError } }: SubscribeLogsInput) {
    const client = createTevmClient({ chainId });

    return client.watchContractEvent({
      address: contractAddress,
      abi,
      onLogs,
      onError,
    });
  }
}
