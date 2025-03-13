# Core

**A shared library providing configuration, constants, types, and utilities for the TinyExplorer ecosystem.**

The core package serves as the foundation for the TinyExplorer, containing shared environment configurations, blockchain chain definitions, and LLM integration utilities that are consumed by both the server and web packages.

## Table of contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Environment Variables](#environment-variables)
  - [Chain Configuration](#chain-configuration)
  - [LLM Integration](#llm-integration)
- [Structure](#structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

The core package centralizes configuration and utilities that are shared across the TinyExplorer ecosystem. It provides:

- Type-safe environment variables through Zod schemas
- Blockchain chain configurations and RPC endpoints
- LLM prompt definitions and output schemas
- Known contract information and types

By separating these shared resources into a dedicated package, we ensure that configuration changes only need to be made in one place, maintaining consistency across the application.

## Installation

This package is part of the TinyExplorer monorepo. To install it:

```bash
# From the repository root
pnpm install
```

## Usage

### Environment Variables

The core package handles environment variable validation and typing for both server and web environments:

```typescript
import { parseEnv } from "@core/env";

// Get typed environment variables
const env = parseEnv("server"); // or "web"

// Access typed variables
console.log(env.SERVER_PORT);
```

### Chain Configuration

Access chain configuration data for supported EVM networks:

```typescript
import { getChainConfig, SUPPORTED_CHAINS } from "@core/chains";

// Get configuration for a specific chain
const ethConfig = getChainConfig({ chainId: "1" }); // Ethereum mainnet

// List all supported chains
console.log(SUPPORTED_CHAINS);
```

### LLM Integration

The package provides schemas and types for LLM interactions:

```typescript
import { EXPLAIN_CONTRACT, ExplainContractOutput } from "@core/llm";

// Access system prompts for LLM
const systemPrompt = EXPLAIN_CONTRACT.systemPrompt;
```

## Structure

```
src/
├── chains.ts       # Chain configuration and constants
├── env/            # Environment variable schemas and parsing
│   ├── env.server.ts
│   ├── env.shared.ts
│   ├── env.web.ts
│   └── index.ts
└── llm/            # LLM integration utilities
    ├── index.ts
    ├── known-contracts.ts
    └── types.ts
```

## Contributing

If you wish to contribute to this package, please follow the contribution guidelines in the root repository README.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
