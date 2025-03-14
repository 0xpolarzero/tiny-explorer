import { createOpenRouter, OpenRouterProvider } from "@openrouter/ai-sdk-provider";
import { generateObject, streamObject } from "ai";
import { z } from "zod";

import { EXPLAIN_CONTRACT, EXPLAIN_TRANSACTION } from "@core/llm";
import { ExplainContractOutput, ExplainTransactionOutput, StreamCallbacks } from "@core/llm/types";
import { ContractDetails, TransactionDetails } from "@core/types";

export type LLMServiceOptions = {
  model: string;
  apiKey: string;
};

export class LLMService {
  private openrouter: OpenRouterProvider;

  constructor(private readonly options: LLMServiceOptions) {
    this.openrouter = createOpenRouter({
      apiKey: options.apiKey,
    });
  }

  async explainContract(input: ContractDetails) {
    return await this.generate(EXPLAIN_CONTRACT.systemPrompt, EXPLAIN_CONTRACT.outputSchema, JSON.stringify(input));
  }

  explainContractStream(input: ContractDetails, callbacks: StreamCallbacks<ExplainContractOutput>): () => void {
    return this.stream(EXPLAIN_CONTRACT.systemPrompt, EXPLAIN_CONTRACT.outputSchema, JSON.stringify(input), callbacks);
  }

  async explainTransaction(input: TransactionDetails, contractExplanation: ExplainContractOutput) {
    return await this.generate(
      EXPLAIN_TRANSACTION.systemPrompt,
      EXPLAIN_TRANSACTION.outputSchema,
      // TODO: pass contract overview, function; pass events? Probably because event logs
      // TODO: handle if it's not a contract interaction if we want to handle researching for an address
      // JSON.stringify({ transaction: input.transaction, context: {} }),
      "",
    );
  }

  explainTransactionStream(
    input: TransactionDetails,
    contractExplanation: ExplainContractOutput,
    callbacks: StreamCallbacks<ExplainTransactionOutput>,
  ): () => void {
    return this.stream(
      EXPLAIN_TRANSACTION.systemPrompt,
      EXPLAIN_TRANSACTION.outputSchema,
      // JSON.stringify({ transaction: input.transaction, context: {} }),
      "",
      callbacks,
    );
  }

  private async generate<S extends z.ZodSchema>(systemPrompt: string, schema: S, input: string): Promise<z.infer<S>> {
    try {
      const { object } = await generateObject({
        model: this.openrouter(this.options.model),
        system: systemPrompt,
        prompt: input,
        schema,
      });

      return object;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  private stream<S extends z.ZodSchema>(
    systemPrompt: string,
    schema: S,
    input: string,
    callbacks: StreamCallbacks<z.infer<S>>,
  ): () => void {
    const { onProgress, onComplete, onError } = callbacks;
    const abortController = new AbortController();

    try {
      const { partialObjectStream } = streamObject({
        model: this.openrouter(this.options.model),
        system: systemPrompt,
        prompt: input,
        schema,
        abortSignal: abortController.signal,
        onFinish: ({ object }) => {
          onComplete(object);
        },
        onError: (err) => {
          onError(err.error instanceof Error ? err.error : new Error(String(err.error)));
        },
      });

      // Process the stream in the background
      (async () => {
        try {
          for await (const obj of partialObjectStream) onProgress(obj);
        } catch (err) {
          if (abortController.signal.aborted) {
            console.log("Stream aborted");
          } else {
            onError(err instanceof Error ? err : new Error(String(err)));
          }
        }
      })();

      return () => {
        abortController.abort();
      };
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
      return () => {};
    }
  }
}
