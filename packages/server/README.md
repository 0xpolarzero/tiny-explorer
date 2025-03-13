# Server

**A tRPC server that provides API endpoints for analyzing EVM contracts with an LLM and caches results.**

The server package implements the backend services for the TinyExplorer, handling contract analysis requests, LLM integration, and authentication.

## Table of contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Environment Setup](#environment-setup)
  - [Running Locally](#running-locally)
  - [Docker Deployment](#docker-deployment)
- [Features](#features)
  - [tRPC API](#trpc-api)
  - [LLM Integration](#llm-integration)
  - [Caching](#caching)
  - [Authentication](#authentication)
- [Structure](#structure)
- [Development](#development)
  - [Testing](#testing)
  - [Adding New Endpoints](#adding-new-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Overview

The server provides a tRPC API for analyzing smart contracts on EVM blockchains. It uses an LLM to generate human-readable explanations of contract functionality and events, with support for both synchronous and streaming responses. The server includes caching, authentication, and integration with the WhatsAbi library for ABI and source code retrieval.

## Installation

This package is part of the TinyExplorer monorepo. To install it:

```bash
# From the repository root
pnpm install
```

## Usage

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Server
EXPOSED_NODE_ENV=local
SERVER_HOST=0.0.0.0
SERVER_PORT=8888
FRONTEND_URL=http://localhost:5173
COOKIE_SECRET=your-secure-cookie-secret-min-32-chars
SESSION_TTL=86400

# LLM
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL_NAME=qwen/qwq-32b

# Cache
DRAGONFLY_HOST=localhost
DRAGONFLY_PORT=6379
DEFAULT_CACHE_TIME=3600

# Blockchain
ETHEREUM_RPC_URL=your-ethereum-rpc-url
ETHEREUM_EXPLORER_API_KEY=your-etherscan-api-key
```

### Running Locally

To run the server locally with Dragonfly cache:

```bash
# Start Dragonfly cache
pnpm start:cache

# Start the server
pnpm start:server
```

### Docker Deployment

The server can be deployed using Docker:

```bash
# Build the images
docker build -f Dockerfile.server -t tiny-explorer-server .
docker build -f Dockerfile.llm -t tiny-explorer-llm . # not yet using a local LLM

# Run with Docker Compose
docker-compose up -d
```

Or use the packages published to the GitHub Container Registry:

```bash
docker pull ghcr.io/0xpolarzero/tiny-explorer-server:latest
docker pull ghcr.io/0xpolarzero/tiny-explorer-llm:latest
```

## Features

### tRPC API

The server exposes the following endpoints:

- `login`: Create a new authenticated session
- `logout`: End the current session
- `getStatus`: Check server health
- `explainContract`: Analyze a contract's source code and ABI
- `explainContractStream`: Streaming version of contract analysis

### LLM Integration

The server integrates with OpenRouter to provide AI-powered contract analysis:

- Uses structured prompts defined in the core package
- Parses LLM responses into typed objects
- Supports both synchronous and streaming responses
- Customizable model selection through environment variables

### Caching

Efficient caching is implemented to reduce API calls and improve performance:

- Redis-based caching for LLM responses
- Contract ABI and source code caching
- Session storage for authentication
- Configurable cache TTL

### Authentication

The server implements session-based authentication:

- Secure, HTTP-only cookies
- Redis-backed session storage
- Middleware protection for sensitive endpoints
- Cross-origin support for the frontend

## Structure

```
src/
├── app/             # Application setup
│   ├── client.ts    # tRPC client configuration
│   ├── debug.ts     # Debug utilities
│   └── router.ts    # API router and endpoints
├── index.ts         # Main entry point
└── service/         # Service implementations
    ├── auth.ts      # Authentication service
    ├── cache.ts     # Redis caching service
    ├── index.ts     # Main service orchestration
    ├── llm.ts       # LLM integration service
    └── whatsabi.ts  # Contract ABI/source fetching service
```

## Development

### Testing

Run tests with:

```bash
pnpm test
```

### Adding New Endpoints

1. Define input/output types in `core/llm/types.ts`
2. Add the endpoint to the router in `app/router.ts`
3. Implement service logic in the appropriate service file
4. Add any necessary middleware

## Contributing

If you wish to contribute to this package, please follow the contribution guidelines in the root repository README.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
