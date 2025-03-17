import { getCacheKey } from "@core/cache";
import {
  ExplainContractInput,
  ExplainContractOutput,
  ExplainTransactionInput,
  ExplainTransactionOutput,
  StreamCallbacks,
} from "@core/llm/types";
import { ContractDetails, GetTransactionsInput, TransactionDetails } from "@core/types";
import { debug } from "@server/app/debug";
import { AuthService, AuthServiceOptions } from "@server/service/auth";
import { CacheService, CacheServiceOptions } from "@server/service/cache";
import { LLMService, LLMServiceOptions } from "@server/service/llm";
import { TransactionService, TransactionServiceOptions } from "@server/service/transaction";
import { WhatsAbiService } from "@server/service/whatsabi";

/** Service class handling LLM requests and responses */
export class Service {
  private llm: LLMService;
  private whatsabi: WhatsAbiService;
  private cache: CacheService;
  private auth: AuthService;
  private transaction: TransactionService;

  /** Creates a new instance of Service */
  constructor(options: {
    llm: LLMServiceOptions;
    cache: CacheServiceOptions;
    auth: Omit<AuthServiceOptions, "cache">;
    transaction: TransactionServiceOptions;
  }) {
    this.llm = new LLMService(options.llm);
    this.whatsabi = new WhatsAbiService();
    this.cache = new CacheService(options.cache);
    this.auth = new AuthService({
      sessionTtl: options.auth.sessionTtl,
      cache: this.cache,
    });
    this.transaction = new TransactionService(options.transaction);
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
   * Note: This endpoint caches the contract explanation
   *
   * @param input - The input to explain
   * @returns A concise explanation of the contract
   */
  async explainContract(input: ExplainContractInput, contractDetails: ContractDetails): Promise<ExplainContractOutput> {
    try {
      const cached = await this.getCachedContractExplanation(input);
      if (cached) return cached;

      const result = await this.llm.explainContract(contractDetails);

      // Store in cache
      await this.cache.set(getCacheKey.explainContract(input), result);

      return result;
    } catch (err) {
      debug("Error in explainContract:", err);
      throw err;
    }
  }

  /**
   * Explains a smart contract transaction given the source code and ABI as well as some explanation of the target
   * contract
   *
   * @param input - The input to explain
   * @param contractExplanation - The explanation of the target contract
   * @returns A concise explanation of the event considering the contract details
   */
  // async explainTransaction(
  //   input: TransactionDetails,
  //   contractExplanation: ExplainContractOutput,
  // ): Promise<ExplainTransactionOutput> {
  //   return await this.llm.explainTransaction(input, contractExplanation);
  // }

  explainContractStream(
    input: ExplainContractInput,
    contractDetails: ContractDetails,
    callbacks: StreamCallbacks<ExplainContractOutput>,
  ): () => void {
    return this.llm.explainContractStream(contractDetails, {
      ...callbacks,
      onComplete: (obj) => {
        try {
          this.cache.set(getCacheKey.explainContract(input), obj);
        } catch (err) {
          debug("Error in onComplete:", err);
          callbacks.onError(err instanceof Error ? err : new Error(String(err)));
        }
        callbacks.onComplete(obj);
      },
    });
  }

  async getCachedContractExplanation(input: ExplainContractInput): Promise<ExplainContractOutput | undefined> {
    const cacheKey = getCacheKey.explainContract(input);

    try {
      const cached = await this.cache.get<ExplainContractOutput>(cacheKey);
      if (cached) {
        debug("Cache hit for key:", cacheKey);
        return cached;
      }

      debug("Cache miss for key:", cacheKey);
      return undefined;
    } catch (err) {
      debug("Error in getCachedContractExplanation:", err);
      return undefined;
    }
  }

  async getContractDetails(input: ExplainContractInput): Promise<ContractDetails> {
    try {
      const cacheKey = getCacheKey.getContractDetails(input);
      const cached = await this.cache.get<ContractDetails>(cacheKey);
      if (cached) {
        debug("Cache hit for key:", cacheKey);
        return cached;
      }

      const contractDetails = await this.whatsabi.getContract(input);
      await this.cache.set(cacheKey, contractDetails);
      return contractDetails;
    } catch (err) {
      debug("Error in getContractDetails:", err);
      throw err;
    }
  }

  // from block to block -> logs -> transactions -> transaction details
  async getTransactionsByPeriod(input: GetTransactionsInput): Promise<Array<TransactionDetails>> {
    const txs = await this.transaction.getTransactionsByPeriod(input);

    // Save transactions to cache
    // TODO: save to a database when implemented
    await Promise.all(txs.map((tx) => this.cache.set(getCacheKey.getTransactionDetails(tx.hash), tx)));

    return txs;
  }

  // hash -> transaction + logs -> transaction details
  async getTransactionByHash(input: ExplainTransactionInput & ContractDetails): Promise<TransactionDetails> {
    try {
      const cacheKey = getCacheKey.getTransactionDetails(input.transactionHash);
      const cached = await this.cache.get<TransactionDetails>(cacheKey);
      if (cached) {
        debug("Cache hit for key:", cacheKey);
        return cached;
      }

      const tx = await this.transaction.getTransactionByHash(input);
      await this.cache.set(cacheKey, tx);

      return tx;
    } catch (err) {
      debug("Error in getTransactionByHash:", err);
      throw err;
    }
  }

  explainTransactionStream(
    input: TransactionDetails,
    contractExplanation: ExplainContractOutput,
    callbacks: StreamCallbacks<ExplainTransactionOutput>,
  ): () => void {
    try {
      return this.llm.explainTransactionStream(input, contractExplanation, {
        ...callbacks,
        onComplete: (obj) => {
          try {
            this.cache.set(getCacheKey.getTransactionExplanation(input.hash), obj);
          } catch (err) {
            debug("Error in onComplete:", err);
            callbacks.onError(err instanceof Error ? err : new Error(String(err)));
          }
          callbacks.onComplete(obj);
        },
      });
    } catch (err) {
      debug("Error in explainEventStream:", err);
      throw err;
    }
  }

  async getCachedTransactionExplanation(input: ExplainTransactionInput): Promise<ExplainTransactionOutput | undefined> {
    const cacheKey = getCacheKey.getTransactionExplanation(input.transactionHash);

    try {
      const cached = await this.cache.get<ExplainTransactionOutput>(cacheKey);
      if (cached) {
        debug("Cache hit for key:", cacheKey);
        return cached;
      }

      debug("Cache miss for key:", cacheKey);
      return undefined;
    } catch (err) {
      debug("Error in getCachedTransactionExplanation:", err);
      return undefined;
    }
  }

  // Add auth methods
  createSession() {
    return this.auth.createSession();
  }

  validateSession(sessionId: string | undefined) {
    return this.auth.validateSession(sessionId);
  }

  clearSession(sessionId: string) {
    return this.auth.clearSession(sessionId);
  }
}
