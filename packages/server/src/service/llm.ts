import { createDeepInfra, DeepInfraProvider } from "@ai-sdk/deepinfra";
import { generateText, streamText } from "ai";

import { SYSTEM_PROMPTS } from "@server/lib/prompts";
import { ExplainContractOutput, ExplainEventInput, ExplainEventOutput, GetContractOutput } from "@server/lib/types";

export type LLMServiceOptions = {
  modelUrl: string;
  apiKey: string;
};

export class LLMService {
  private deepInfra: DeepInfraProvider;

  constructor(private readonly options: LLMServiceOptions) {
    this.deepInfra = createDeepInfra({
      apiKey: options.apiKey,
    });
  }

  async explainEvent(input: ExplainContractOutput & ExplainEventInput): Promise<ExplainEventOutput> {
    const eventInfo = input.events.find((e) => e.name === input.event.name);
    if (!eventInfo) throw new Error("Event not found"); // TODO: this means there is a prompting or other issue we need to handle

    const result = await this.generate(SYSTEM_PROMPTS.explainEvent, JSON.stringify({ event: input.event, eventInfo }));
    return JSON.parse(result);
  }

  async explainContract(input: GetContractOutput): Promise<ExplainContractOutput> {
    const result = await this.generate(SYSTEM_PROMPTS.explainContract, JSON.stringify(input));
    return JSON.parse(result);
  }

  async explainEventStream(
    input: ExplainContractOutput & ExplainEventInput,
    onCompletion: (text: string) => void,
  ): Promise<void> {
    const eventInfo = input.events.find((e) => e.name === input.event.name);
    if (!eventInfo) throw new Error("Event not found"); // TODO: this means there is a prompting or other issue we need to handle

    await this.stream(SYSTEM_PROMPTS.explainEvent, JSON.stringify({ event: input.event, eventInfo }), onCompletion);
  }

  async explainContractStream(
    input: GetContractOutput,
    onCompletion: (text: string) => void,
    onFinish: (text: string) => void,
  ): Promise<void> {
    await this.stream(SYSTEM_PROMPTS.explainContract, JSON.stringify(input), onCompletion, onFinish);
  }

  private async generate(systemPrompt: string, input: string): Promise<string> {
    const { text } = await generateText({
      model: this.deepInfra(this.options.modelUrl),
      system: systemPrompt,
      prompt: input,
    });

    return text.split("```json")[1]?.split("```")[0] ?? "";
  }

  private async stream(
    systemPrompt: string,
    input: string,
    onCompletion: (text: string) => void,
    onFinish?: (text: string) => void,
  ): Promise<void> {
    const result = streamText({
      model: this.deepInfra(this.options.modelUrl),
      system: systemPrompt,
      prompt: input,
    });

    for await (const text of result.textStream) {
      onCompletion(text);
      console.log(text);
    }

    const allText = await result.text;
    onFinish?.(allText.split("```json")[1]?.split("```")[0] ?? "");
  }
}
