import { debug } from "@/app/debug";
import { ExplainContractInput, ExplainContractOutput, ExplainEventInput, ExplainEventOutput } from "@/lib/types";
import { CacheService, CacheServiceOptions } from "@/service/cache";
import { LLMService, LLMServiceOptions } from "@/service/llm";
import { WhatsAbiService } from "@/service/whatsabi";

/** Service class handling LLM requests and responses */
export class Service {
  private llm: LLMService;
  private whatsabi: WhatsAbiService;
  private cache: CacheService;

  /** Creates a new instance of Service */
  constructor(options: { llm: LLMServiceOptions; cache: CacheServiceOptions }) {
    this.llm = new LLMService(options.llm);
    this.whatsabi = new WhatsAbiService();
    this.cache = new CacheService(options.cache);
  }

  /**
   * Returns the status of the service
   *
   * @returns The status of the service
   */
  getStatus(): { status: number } {
    return { status: 200 };
  }

  /**
   * Explains a smart contract event given its details and the source code and ABI of the contract
   *
   * @param input - The input to explain
   * @returns A concise explanation of the event considering the contract details
   */
  async explainEvent(input: ExplainEventInput): Promise<ExplainEventOutput> {
    // Retrieve contract details with caching
    const contractExplanation = await this.explainContract(input);
    return await this.llm.explainEvent({ ...contractExplanation, ...input });
  }

  /**
   * Explains a smart contract given its source code and ABI
   *
   * Note: This endpoint caches the contract explanation
   *
   * @param input - The input to explain
   * @returns A concise explanation of the contract
   */
  async explainContract(input: ExplainContractInput): Promise<ExplainContractOutput> {
    // Create a cache key
    const cacheKey = `contract:${input.chainId}:${input.contractAddress}`;

    try {
      // Try to get from cache first
      const cached = await this.cache.get<ExplainContractOutput>(cacheKey);
      if (cached) {
        debug("Cache hit for key:", cacheKey);
        return cached;
      }

      // If not in cache, get from LLM
      debug("Cache miss for key:", cacheKey);
      const contractDetails = await this.whatsabi.getContract(input);
      const result = await this.llm.explainContract(contractDetails);

      // Store in cache
      await this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      debug("Error in explainContract:", error);
      throw error;
    }
  }
}
