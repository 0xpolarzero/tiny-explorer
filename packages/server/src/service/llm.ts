import { TextGeneration } from "deepinfra";

import { PROMPTS } from "@/prompts";
import { ExplainContractInput, ExplainEventInput } from "@/service/types";

export type LLMServiceOptions = {
  modelUrl: string;
  apiKey: string;
};

export class LLMService {
  constructor(private readonly options: LLMServiceOptions) {}

  async explainContract(input: ExplainContractInput): Promise<string> {
    // TODO: parse contract details correctly to form the prompt and input
    return await this.prompt(PROMPTS.explainContract, input);
  }

  async explainEvent(input: ExplainEventInput): Promise<string> {
    // TODO: parse event details correctly to form the prompt and input
    return await this.prompt(PROMPTS.explainEvent, input);
  }

  private async prompt(systemPrompt: string, input: string): Promise<string> {
    const client = new TextGeneration(this.options.modelUrl, this.options.apiKey);
    const res = await client.generate({
      input: `${systemPrompt}\n\n# Input\n\n${input}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
      stop: ["<|eot_id|>"],
      stream: false,
    });

    const text = res.results[0]?.generated_text ?? "";
    return text ?? "";
  }
}
