import { TextGeneration } from "deepinfra";

import { PROMPTS } from "@/lib/prompts";
import { ExplainContractOutput, ExplainEventInput, ExplainEventOutput, GetContractOutput } from "@/lib/types";

export type LLMServiceOptions = {
  modelUrl: string;
  apiKey: string;
};

export class LLMService {
  constructor(private readonly options: LLMServiceOptions) {}

  async explainEvent(input: ExplainContractOutput & ExplainEventInput): Promise<ExplainEventOutput> {
    // TODO: parse event details correctly to form the prompt and input
    const formattedInput = "";
    const result = await this.prompt(PROMPTS.explainEvent, formattedInput);
    return JSON.parse(result);
  }

  async explainContract(input: GetContractOutput): Promise<ExplainContractOutput> {
    // TODO: parse contract details correctly to form the prompt and input
    const formattedInput = "";
    const result = await this.prompt(PROMPTS.explainContract, formattedInput);
    return JSON.parse(result);
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
