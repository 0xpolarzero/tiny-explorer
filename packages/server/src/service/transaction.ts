import { abi } from "@shazow/whatsabi";
import { AbiFunction, decodeEventLog, decodeFunctionData } from "tevm";
import { Log, Transaction } from "viem";

import { createTevmClient } from "@core/tevm";
import { GetTransactionInput, GetTransactionsInput, TransactionDetails, TransactionRaw } from "@core/types";
import { bigIntReplacer } from "@core/utils";
import { debug } from "@server/app/debug";

export type TransactionServiceOptions = {};

export class TransactionService {
  constructor(config: TransactionServiceOptions) {}

  async getTransactionsByPeriod(input: GetTransactionsInput): Promise<Array<TransactionDetails>> {
    const client = createTevmClient({ chainId: input.chainId });

    try {
      // TODO: hardcoded for now for ease of use
      const currentBlock = await client.getBlockNumber();
      const fromBlock = currentBlock - BigInt(10_000); // max 10_000 blocks

      const logs = await client.getLogs({
        address: input.contractAddress,
        fromBlock,
        toBlock: currentBlock,
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
          return this.decodeTransaction(tx, logs, input.abi);
        }),
      );
    } catch (err) {
      debug("Error getting logs", err);
      throw err;
    }
  }

  async getTransactionByHash(input: GetTransactionInput): Promise<TransactionDetails> {
    const client = createTevmClient({ chainId: input.chainId });

    try {
      const [tx, receipt] = await Promise.all([
        client.getTransaction({ hash: input.transactionHash }),
        client.getTransactionReceipt({ hash: input.transactionHash }),
      ]);

      return this.decodeTransaction(tx, receipt.logs, input.abi);
    } catch (err) {
      debug("Error getting transaction", err);
      throw err;
    }
  }

  private async decodeTransaction(tx: Transaction, logs: Array<Log>, abi: abi.ABI): Promise<TransactionDetails> {
    // Try to decode function data, but provide fallback if it fails
    let txDetails;
    try {
      if (!tx.to) {
        txDetails = {
          functionName: "Deployment",
          data: tx.input,
          args: {},
        };
      } else {
        const { functionName, args } = decodeFunctionData({ abi, data: tx.input });
        const functionDef = abi.find((item) => item.name === functionName) as AbiFunction;

        txDetails = {
          functionName,
          data: tx.input,
          // Create an object { [argName]: argValue } from the args
          args: args
            ? Object.fromEntries(
                bigIntReplacer(args).map((arg, index) => [functionDef.inputs[index]?.name ?? index, arg]),
              )
            : {},
        };
      }
    } catch (err) {
      debug("Failed to decode function data", tx.hash, err);
      txDetails = {
        functionName: tx.input.slice(0, 8),
        data: tx.input,
        args: undefined,
      };
    }

    // Process logs, handling decoding failures for individual logs
    const logsDetails = logs.map((log) => {
      try {
        const { eventName, args } = decodeEventLog({
          abi,
          topics: log.topics,
          data: log.data,
        });

        return {
          eventName: eventName as unknown as string,
          data: log.data,
          // TODO: Why do we have to change the type here, as without the abi it considers `args` as unknown[]
          args: bigIntReplacer(args as Record<string, any>),
        };
      } catch (err) {
        debug("Failed to decode event log", log.transactionHash, log.logIndex, err);
        return {
          eventName: "Unknown Event",
          data: log.data,
          args: undefined,
        };
      }
    });

    return {
      hash: tx.hash,
      blockNumber: bigIntReplacer(tx.blockNumber ?? "0"),
      details: {
        tx: {
          ...txDetails,
          from: tx.from,
          to: tx.to,
          value: bigIntReplacer(tx.value),
        },
        logs: logsDetails,
      },
    };
  }
}
