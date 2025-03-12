import { autoload, loaders } from "@shazow/whatsabi";
import { createMemoryClient, http } from "tevm";

import { getChainConfig } from "@core/chains";
import { KNOWN_CONTRACTS } from "@core/llm/known-contracts";
import { GetContractInput, GetContractOutput } from "@core/llm/types";
import { debug } from "@server/app/debug";

const ignoredSourcePaths = ["metadata.json", "creator-tx-hash.txt", "immutable-references"];

export type WhatsAbiOptions = {};

export class WhatsAbiService {
  constructor() {}

  // TODO: can we be more selective with source code? reduce it as much as possible to fit the context length?
  // TODO: can we grab more details from the loaderResult (e.g. .devdoc.details, .devdoc.title, .userdoc)?
  async getContract({ chainId, contractAddress }: GetContractInput): Promise<GetContractOutput> {
    const chain = getChainConfig({ chainId });
    if (!chain) throw new Error("Chain not supported");

    try {
      // Create client & loader
      const provider = createMemoryClient({
        fork: { transport: http(chain.rpcUrl)({}) },
        common: chain,
      });
      const abiLoader = new loaders.MultiABILoader(
        [
          new loaders.SourcifyABILoader({ chainId: chain.id }),
          chain.etherscan
            ? new loaders.EtherscanABILoader({
                baseURL: chain.etherscan.apiUrl,
                apiKey: chain.etherscan.apiKey,
              })
            : undefined,
          chain.blockscout
            ? new loaders.BlockscoutABILoader({
                baseURL: chain.blockscout.apiUrl,
                apiKey: chain.blockscout.apiKey,
              })
            : undefined,
        ].filter((l) => l !== undefined),
      );

      // Get the contract sources and ABI
      const result = await autoload(contractAddress, {
        provider,
        abiLoader,
        followProxies: true,
        loadContractResult: true,
        onError: (error) => {
          console.error(error);
          throw error;
        },
      });

      const sources = await result.contractResult?.getSources?.();

      // Keep content of contracts we need to explain and direct explanation for known ones
      const refinedSources = sources
        ?.filter((s) => !ignoredSourcePaths.some((p) => s.path?.includes(p)))
        .map((s) => {
          const knownContract = KNOWN_CONTRACTS.find((k) => s.path?.includes(k.path));
          if (knownContract) {
            return {
              name: knownContract.name,
              explanation: knownContract.explanation,
            };
          }

          return {
            name: grabContractName(s.content),
            content: s.content,
          };
        });

      debug("Retrieved contract details", chainId, contractAddress);
      return {
        abi: result.abi,
        name: result.contractResult?.name ?? undefined,
        sources: refinedSources,
      };
    } catch (error) {
      debug("Error in getContract", chainId, contractAddress, error);
      throw error;
    }
  }
}

const grabContractName = (content: string) =>
  content.match(/(?:contract|abstract\s+contract|interface)\s+(\w+)(?:\s+is\s+[\w\s,]*)?{/)?.[1] ?? "";
