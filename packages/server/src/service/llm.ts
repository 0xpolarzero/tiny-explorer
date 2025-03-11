import { TextGeneration } from "deepinfra";

import { getPrompt } from "@server/lib/prompts";
import { ExplainContractOutput, ExplainEventInput, ExplainEventOutput, GetContractOutput } from "@server/lib/types";

export type LLMServiceOptions = {
  modelUrl: string;
  apiKey: string;
};

export class LLMService {
  constructor(private readonly options: LLMServiceOptions) {}

  async explainEvent(input: ExplainContractOutput & ExplainEventInput): Promise<ExplainEventOutput> {
    const eventInfo = input.events.find((e) => e.name === input.event.name);
    if (!eventInfo) throw new Error("Event not found"); // TODO: this means there is a prompting or other issue we need to handle
    const formattedInput = getPrompt.explainEvent({ event: input.event, eventInfo });

    const result = await this.prompt(formattedInput);
    return JSON.parse(result);
  }

  async explainContract(input: GetContractOutput): Promise<ExplainContractOutput> {
    const formattedInput = getPrompt.explainContract(input);

    const result = await this.prompt(formattedInput);
    return JSON.parse(result);
  }

  private async prompt(input: string): Promise<string> {
    const client = new TextGeneration(this.options.modelUrl, this.options.apiKey);
    const res = await client.generate({
      input,
      stop: ["<|eot_id|>"],
      stream: false,
    });

    const text = res.results[0]?.generated_text ?? "";
    return text.split("```json")[1]?.split("```")[0] ?? "";
  }
}
