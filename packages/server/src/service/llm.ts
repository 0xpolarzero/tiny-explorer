import { createOpenRouter, OpenRouterProvider } from "@openrouter/ai-sdk-provider";
import { generateObject, streamObject } from "ai";
import { z } from "zod";

import { EXPLAIN_CONTRACT, EXPLAIN_EVENT } from "@core/llm";
import {
  ExplainContractOutput,
  ExplainEventInput,
  ExplainEventOutput,
  GetContractOutput,
  StreamCallbacks,
} from "@core/llm/types";

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

  async explainEvent(input: ExplainContractOutput & ExplainEventInput) {
    const eventInfo = input.events.find((e) => e.name === input.event.name);
    if (!eventInfo) throw new Error("Event not found"); // TODO: this means there is a prompting or other issue we need to handle

    return await this.generate(
      EXPLAIN_EVENT.systemPrompt,
      EXPLAIN_EVENT.outputSchema,
      JSON.stringify({ event: input.event, eventInfo }),
    );
  }

  async explainContract(input: GetContractOutput) {
    return await this.generate(EXPLAIN_CONTRACT.systemPrompt, EXPLAIN_CONTRACT.outputSchema, JSON.stringify(input));
  }

  explainEventStream(
    input: ExplainContractOutput & ExplainEventInput,
    callbacks: StreamCallbacks<ExplainEventOutput>,
  ): () => void {
    const eventInfo = input.events.find((e) => e.name === input.event.name);
    if (!eventInfo) throw new Error("Event not found"); // TODO: this means there is a prompting or other issue we need to handle

    return this.stream(
      EXPLAIN_EVENT.systemPrompt,
      EXPLAIN_EVENT.outputSchema,
      JSON.stringify({ event: input.event, eventInfo }),
      callbacks,
    );
  }

  explainContractStream(input: GetContractOutput, callbacks: StreamCallbacks<ExplainContractOutput>): () => void {
    return this.stream(EXPLAIN_CONTRACT.systemPrompt, EXPLAIN_CONTRACT.outputSchema, JSON.stringify(input), callbacks);
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
