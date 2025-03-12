# Contracts

**A Foundry-based Solidity package for testing and demonstration of smart contracts with the EVM AI Indexer.**

The contracts package provides example smart contracts for testing the EVM AI Indexer's analysis capabilities.

## Table of contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Prerequisites](#prerequisites)
  - [Development](#development)
  - [Testing](#testing)
  - [Deployment](#deployment)
- [Structure](#structure)
- [Contract Details](#contract-details)
- [Contributing](#contributing)
- [License](#license)

## Overview

The contracts package contains a simple example smart contract (`Counter.sol`) implemented using Solidity and the Foundry development framework. This package serves as a testing ground for the EVM AI Indexer, providing real contracts that can be analyzed by the system.

## Installation

This package is part of the EVM AI Indexer monorepo. To install it:

```bash
# From the repository root
pnpm install

# Install Foundry dependencies
cd packages/contracts
forge install
```

### Prerequisites

- [Foundry](https://getfoundry.sh/) - Smart contract development toolkit

## Usage

### Development

To compile contracts:

```shell
forge build
```

### Testing

To run tests:

```shell
# Run all tests
forge test

# Run specific test
forge test --match-test testFunctionName -vvv
```

### Deployment

To deploy contracts to a local Anvil node:

```shell
# Start an Anvil node
anvil

# Deploy using the script
forge script script/Counter.s.sol --rpc-url http://localhost:8545 --broadcast
```

## Structure

```
├── src/                # Contract source files
│   └── Counter.sol     # Example counter contract
├── test/               # Test files
│   └── Counter.t.sol   # Tests for Counter contract
├── script/             # Deployment scripts
│   └── Counter.s.sol   # Script to deploy Counter
├── lib/                # Dependencies (managed by Forge)
│   └── forge-std/      # Forge standard library
└── foundry.toml        # Foundry configuration
```

## Contract Details

### Counter.sol

A simple smart contract that demonstrates basic state management:

- Stores a single integer value
- Provides functions to get, set, and increment the value
- Used for testing the indexer's analysis capabilities

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
```

## Additional Foundry Commands

- **Format code**: `forge fmt`
- **Gas snapshots**: `forge snapshot`
- **Interact with contracts**: `cast <subcommand>`
- **Get help**: `forge --help`, `anvil --help`, `cast --help`

For more information on Foundry, visit the [Foundry documentation](https://book.getfoundry.sh/).

## Contributing

If you wish to contribute to this package, please follow the contribution guidelines in the root repository README.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
