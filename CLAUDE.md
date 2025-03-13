# TinyExplorer - Development Guidelines

## Commands

- **Dev**: `pnpm dev` - Start all services (server, cache, web)
- **Test**: `pnpm --filter server test` - Run server tests with Vitest
- **Solidity Tests**: `cd packages/contracts && forge test` - Run Foundry tests
- **Single Test**: `cd packages/contracts && forge test --match-test testFunctionName`
- **Lint**: `pnpm lint` - Check formatting
- **Lint Fix**: `pnpm lint:fix` - Fix formatting issues

## Code Style

- **Formatting**: 2 spaces, 120 char line length, double quotes, no semicolons
- **Imports**: Sorted using `@ianvs/prettier-plugin-sort-imports` (third-party -> @/ -> ./)
- **Types**: TypeScript with strict mode enabled, no unchecked indexed access
- **Error Handling**: Use proper error handling and typed errors
- **Naming**: Use descriptive names for functions and variables
- **TypeScript**: Use strict types, avoid `any`, use `noUncheckedIndexedAccess`
- **React**: Follow React hooks rules, use functional components

## Project Structure

- **Monorepo**: Uses pnpm workspaces with packages (core, server, web, contracts)
- **Solidity**: Uses Foundry for smart contract development and testing
- **API**: tRPC server with Redis cache for EVM contract interactions and LLM responses
