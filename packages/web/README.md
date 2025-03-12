# Web

**A React application providing a user interface for analyzing smart contracts with AI-powered explanations.**

The web package implements the frontend for the EVM AI Indexer, allowing users to submit contract addresses and view AI-generated explanations of their functionality.

## Table of contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Environment Setup](#environment-setup)
  - [Development](#development)
  - [Building for Production](#building-for-production)
- [Features](#features)
  - [Contract Analysis](#contract-analysis)
  - [Blockchain Support](#blockchain-support)
  - [Real-time Streaming](#real-time-streaming)
  - [User Interface](#user-interface)
- [Structure](#structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

The web package provides a React-based user interface for interacting with the EVM AI Indexer. It allows users to enter contract addresses, select blockchain networks, and receive AI-generated analyses of smart contracts including their functionality, events, and other details.

## Installation

This package is part of the EVM AI Indexer monorepo. To install it:

```bash
# From the repository root
pnpm install
```

## Usage

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Server connection
EXPOSED_SERVER_PROD_URL=http://localhost:8888 # only required for production
```

### Development

To run the development server:

```bash
pnpm dev
```

This will start a Vite development server with hot module replacement (HMR).

### Building for Production

To build the application for production:

```bash
pnpm build
```

To preview the production build:

```bash
pnpm preview
```

## Features

### Contract Analysis

The application fetches and displays detailed contract information:

- Contract name and description
- Functions and their descriptions
- Events and their parameters
- State variables
- Inheritance structure

### Blockchain Support

Support for multiple EVM-compatible blockchains:

- Ethereum Mainnet (with more chains coming soon)
- Configurable RPC endpoints through the core package
- Blockchain explorer integration for verification

### Real-time Streaming

Real-time updates as contract analysis is generated:

- WebSocket subscription for streaming data
- Live updates as the LLM analyzes the contract
- Progress indicators during analysis

### User Interface

Modern, responsive UI components:

- Clean, intuitive interface built with React
- Form validation for contract addresses
- Responsive design for various screen sizes
- Component library with consistent styling

## Structure

```
src/
├── assets/           # Static assets
├── components/       # UI components
│   ├── config.tsx    # Chain and contract selection
│   ├── contract-details.tsx # Contract analysis display
│   ├── ui/           # Reusable UI components
│   └── wrapper.tsx   # Authentication wrapper
├── hooks/            # Custom React hooks
│   └── use-server.ts # Server connection hook
├── lib/              # Utilities and helpers
│   ├── store.ts      # State management
│   └── utils.ts      # Helper functions
├── providers/        # React context providers
│   └── server-provider.tsx # tRPC client provider
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Contributing

If you wish to contribute to this package, please follow the contribution guidelines in the root repository README.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
