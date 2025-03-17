# TinyExplorer

**A user-friendly interface for explaining contracts and events in real time on EVM chains using AI.**

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Development](#development)
  - [Docker](#docker)
  - [Configuration](#configuration)
- [Architecture](#architecture)
  - [Packages](#packages)
  - [Flow](#flow)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

TinyExplorer is a system that combines blockchain interaction with AI language models to provide intuitive, human-readable explanations of smart contracts and their events. By analyzing contract source code, ABIs, and event data, the system helps users understand contract functionality without requiring extensive blockchain or Solidity knowledge, and explains events as they occur.

## Features

- **Contract Analysis**: Fetch and analyze smart contract source code and ABIs
- **AI Explanations**: Generate human-readable explanations of contract functionality using LLMs
- **Event Monitoring**: Track and explain contract events in real-time
- **Multi-Chain Support**: Configurable support for different EVM-compatible blockchains
- **Caching**: Efficient caching to reduce API calls and improve performance
- **User Interface**: Clean, intuitive React UI for interacting with the system

## Prerequisites

- [Node.js](https://nodejs.org/) (tested with v23.8.0)
- [pnpm](https://pnpm.io/) (tested with v9.15.6)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized deployment); or you can use [OrbStack](https://www.orbstack.dev/) on Mac
- [Foundry](https://getfoundry.sh/) (for smart contract development)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/0xpolarzero/tiny-explorer.git
cd tiny-explorer
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Usage

### Development

To run the entire system in development mode:

```bash
pnpm dev
```

This will start:

- Redis cache (Dragonfly)
- tRPC server
- React frontend

### Configuration

Key configuration options:

- **LLM Provider**: Currently uses OpenRouter, configurable to other providers
- **Blockchain Networks**: Add RPC URLs and explorer API keys in the environment file
- **Caching**: Adjust cache TTL and other parameters in environment variables

## Architecture

### Packages

The project is organized as a monorepo with the following packages:

- [**core**](./packages/core/README.md): Shared configuration, constants, types, and utilities
- [**server**](./packages/server/README.md): tRPC server providing API endpoints for contract analysis
- [**web**](./packages/web/README.md): React frontend for interacting with the system
- [**contracts**](./packages/contracts/README.md): Example smart contracts for testing

### Flow

1. **User Input**: User provides a contract address and selects a blockchain network
2. **Contract Fetching**: System fetches contract ABI and source code using WhatsAbi
3. **AI Analysis**: LLM analyzes the contract and generates explanations
4. **Event Monitoring**: System listens for contract events in real-time
5. **Explanation**: Events are explained to the user as they occur

## TODO

Future development plans:

- [x] Use whatsabi to get the contract code and abi (especially code)
- [ ] use multiple api keys for various chains
- [x] create server for both llm & backend stuff
  - [x] use caching for contract code & abi
- [ ] add lm studio running in docker instead of deep infra https://gitlab.com/logliwo/lm-studio-docker-compose/-/tree/main?ref_type=heads (??)
- [ ] update server to use serverless
- [ ] the cache is not a database; a lot of stuff needs to be saved into a database instead (e.g. transaction details, transaction explanations)
- [ ] figure out a good model + some ai slop: sometimes it loops over the functions, forgets some, doesn't detect modifiers, etc. Most important is tx simulation tho, so we really need this one right.
- [ ] simulate tx with tevm then explain it
- [ ] better ux after tx was explained and "verified", something to copy/paste or a link and run the tx from your wallet?
- [ ] for unverified contracts, better interpretation where the LLM is provided all state/storage changes and figures out if anything weird happened
- [ ] train LLM for this specific purpose (on transactions that might not be understandable -> understandable output)
- [ ] provide just API for external use, maybe it can be self-hosted as well
- [ ] port to krome, enter api keys first time, then run whenever you want and eveything is stored locally

(later)

- add caching to llm responses (chain_id:contract_address:function_name)
  - retrieve a general explanation of the function and cache it (1st prompt)
  - only need to reprompt with the provided arguments (2nd prompt)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
