import { autoload, loaders } from "@shazow/whatsabi";

import { debug } from "@/app/debug";
import { KNOWN_CONTRACTS } from "@/lib/known-contracts";
import { createTevmClient, getChain } from "@/lib/providers";
import { GetContractInput, GetContractOutput } from "@/lib/types";

const ignoredSourcePaths = ["metadata.json", "creator-tx-hash.txt", "immutable-references"];

export type WhatsAbiOptions = {};

export class WhatsAbiService {
  constructor() {}

  // TODO: can we be more selective with source code? reduce it as much as possible to fit the context length?
  // TODO: can we grab more details from the loaderResult (e.g. .devdoc.details, .devdoc.title, .userdoc)?
  async getContract({ chainId, contractAddress }: GetContractInput): Promise<GetContractOutput> {
    const chain = getChain(chainId);
    if (!chain) throw new Error("Chain not supported");

    // Create client & loader
    const provider = createTevmClient(chain);
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

    try {
      // Get the contract sources and ABI
      const result = await autoload(contractAddress, {
        provider,
        abiLoader,
        followProxies: true,
        loadContractResult: true,
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
