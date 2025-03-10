import { debug } from "@/app/debug";
import { CacheService, CacheServiceOptions } from "@/service/cache";
import { LLMService, LLMServiceOptions } from "@/service/llm";
import { ExplainContractInput, ExplainEventInput } from "@/service/types";

/** Service class handling LLM requests and responses */
export class Service {
  private llm: LLMService;
  private cache: CacheService;

  /** Creates a new instance of Service */
  constructor(options: { llm: LLMServiceOptions; cache: CacheServiceOptions }) {
    this.llm = new LLMService(options.llm);
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
   * Explains a smart contract given its source code and ABI
   *
   * @param input - The input to explain
   * @returns A concise explanation of the contract
   */
  async explainContract(input: ExplainContractInput): Promise<string> {
    // Create a cache key
    const cacheKey = `contract:${input.chainId}:${input.contractAddress}`;

    try {
      // Try to get from cache first
      const cached = await this.cache.get<{ explanation: string }>(cacheKey);
      if (cached) {
        debug("Cache hit for key:", cacheKey);
        return cached.explanation;
      }

      // If not in cache, get from LLM
      debug("Cache miss for key:", cacheKey);
      const result = await this.llm.explainContract(input);

      // Store in cache
      await this.cache.set(cacheKey, { explanation: result });

      return result;
    } catch (error) {
      debug("Error in explainContract:", error);
      throw error;
    }
  }

  async explainEvent(input: ExplainEventInput): Promise<string> {
    // TODO: implement
    return "";
  }
}
