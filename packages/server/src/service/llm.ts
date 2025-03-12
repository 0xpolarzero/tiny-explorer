import { createOpenRouter, OpenRouterProvider } from "@openrouter/ai-sdk-provider";
import { generateObject, generateText, streamObject, streamText } from "ai";
import { z } from "zod";

import { EXPLAIN_CONTRACT, EXPLAIN_EVENT } from "@core/llm";
import { ExplainContractOutput, ExplainEventInput, ExplainEventOutput, GetContractOutput } from "@core/llm/types";

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

  async explainEventStream(
    input: ExplainContractOutput & ExplainEventInput,
    onCompletion: (obj: Partial<ExplainEventOutput>) => void,
  ): Promise<void> {
    const eventInfo = input.events.find((e) => e.name === input.event.name);
    if (!eventInfo) throw new Error("Event not found"); // TODO: this means there is a prompting or other issue we need to handle

    await this.stream(
      EXPLAIN_EVENT.systemPrompt,
      EXPLAIN_EVENT.outputSchema,
      JSON.stringify({ event: input.event, eventInfo }),
      onCompletion,
    );
  }

  async explainContractStream(
    input: GetContractOutput,
    onCompletion: (obj: Partial<ExplainContractOutput>) => void,
    onFinish: (obj: ExplainContractOutput) => void,
  ): Promise<() => void> {
    return await this.stream(
      EXPLAIN_CONTRACT.systemPrompt,
      EXPLAIN_CONTRACT.outputSchema,
      JSON.stringify(input),
      onCompletion,
      onFinish,
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

  private async stream<S extends z.ZodSchema>(
    systemPrompt: string,
    schema: S,
    input: string,
    onCompletion: (obj: any) => void,
    onFinish?: (obj: z.infer<S>) => void,
  ): Promise<() => void> {
    const abortController = new AbortController();

    try {
      const { partialObjectStream, object: objectPromise } = streamObject({
        model: this.openrouter(this.options.model),
        system: systemPrompt,
        prompt: input,
        schema,
        abortSignal: abortController.signal,
      });

      // Process the stream in the background
      (async () => {
        try {
          for await (const obj of partialObjectStream) onCompletion(obj);

          if (onFinish) {
            const object = await objectPromise;
            onFinish(object);
          }
        } catch (err) {
          if (abortController.signal.aborted) {
            console.log("Stream aborted");
          } else {
            console.error(err);
          }
        }
      })();

      return () => {
        abortController.abort();
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
