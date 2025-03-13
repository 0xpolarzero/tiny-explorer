import { autoload, interfaces, loaders } from "@shazow/whatsabi";

import { getChainConfig } from "@core/chains";
import { KNOWN_CONTRACTS, KNOWN_INTERFACES } from "@core/llm/known-contracts";
import { GetContractInput, GetContractOutput } from "@core/llm/types";
import { createTevmClient } from "@core/tevm";
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
      // Create loader
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
      const { abi, contractResult } = await autoload(contractAddress, {
        provider: createTevmClient(chain),
        abiLoader,
        followProxies: true,
        loadContractResult: true,
      });

      const sources = await contractResult?.getSources?.();

      // Keep content of contracts we need to explain and direct explanation for known ones
      const refinedSources = sources
        ?.filter((s) => !ignoredSourcePaths.some((p) => s.path?.includes(p)))
        .map((s) => {
          const knownContract = KNOWN_CONTRACTS.concat(KNOWN_INTERFACES).find((k) => s.path?.includes(k.path));

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

      // If sources were not available, we can at least find out if it could detect some known interfaces
      const knownInterfaces =
        refinedSources?.length === 0
          ? interfaces
              .abiToInterfaces(abi)
              .map((i) => {
                const knownInterface = KNOWN_INTERFACES.find((k) => k.name === i);
                if (knownInterface) {
                  return {
                    name: knownInterface.name,
                    explanation: knownInterface.explanation,
                  };
                }
              })
              .filter((i) => i !== undefined)
          : undefined;

      debug("Retrieved contract details", chainId, contractAddress);
      return {
        abi: abi,
        name: contractResult?.name ?? undefined,
        sources: refinedSources ?? knownInterfaces,
      };
    } catch (err) {
      debug("Error in getContract", chainId, contractAddress, err);
      throw err;
    }
  }
}

const grabContractName = (content: string) =>
  content.match(/(?:contract|abstract\s+contract|interface)\s+(\w+)(?:\s+is\s+[\w\s,]*)?{/)?.[1] ?? "";
