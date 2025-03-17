import { z } from "zod";

// Enforce json schema return type with LM Studio: https://lmstudio.ai/docs/app/api/structured-output

export const EXPLAIN_CONTRACT = {
  outputSchema: z.object({
    overview: z.string(),
    functions: z.array(
      z.object({
        signature: z.string(),
        name: z.string(),
        description: z.string(),
        parameters: z.array(
          z.object({
            name: z.string(),
            type: z.string(),
            description: z.string(),
          }),
        ),
        returns: z.array(
          z.object({
            type: z.string(),
            description: z.string(),
          }),
        ),
        visibility: z.array(z.enum(["public", "external", "internal", "private", "pure", "view"])),
        payable: z.boolean(),
        modifiers: z.array(z.string()),
        sideEffects: z.array(z.string()),
      }),
    ),
    events: z.array(
      z.object({
        signature: z.string(),
        name: z.string(),
        description: z.string(),
        parameters: z.array(
          z.object({
            name: z.string(),
            type: z.string(),
            indexed: z.boolean(),
            description: z.string(),
            significance: z.string(),
          }),
        ),
      }),
    ),
  }),
  systemPrompt: `You are a smart contract analyzer. Given a contract's ABI and optional source code, which might be complete, incomplete, or missing, provide a comprehensive analysis in JSON format with three fields:
1. "overview": A clear, technical explanation of the contract's purpose, functionality, and architecture
2. "events": An array of objects describing each event, with each object containing:
   - "signature": Full event signature (e.g., "Transfer(address,address,uint256)")
   - "name": Event name
   - "description": Detailed explanation of when and why the event is emitted
   - "parameters": Array of parameter objects, each with:
     - "name": Parameter name
     - "type": Parameter type
     - "indexed": Boolean indicating if parameter is indexed
     - "description": What this parameter represents
     - "significance": Why this parameter is important and how it's used
   - "contextualUsage": Where/how this event is used in the contract's logic
   - "stateChanges": Array of state variables that are typically modified when this event is emitted
   - "securityConsiderations": Any security implications or considerations when handling this event
   - "commonPatterns": Common usage patterns or scenarios where this event is relevant
3. "functions": An array of objects describing each function, with each object containing:
   - "signature": Full function signature (e.g., "transfer(address,uint256)")
   - "name": Function name
   - "description": Detailed explanation of what the function does and its purpose
   - "parameters": Array of parameter objects, each with:
     - "name": Parameter name
     - "type": Parameter type
     - "description": What this parameter represents and how it's used
   - "returns": Array of return value objects, each with:
     - "type": Return value type
     - "description": What this return value represents
   - "visibility": Array of function visibility (strictly among the following: public, external, internal, private, pure, view)
   - "modifiers": Array of modifiers applied to the function (e.g., "onlyOwner", "nonReentrant") each with a very brief explanation of what they do
   - "payable": Boolean indicating if the function is payable
   - "sideEffects": Array of state changes or external calls made by this function
   - "securityConsiderations": Any security implications or considerations when calling this function
   - "commonPatterns": Common usage patterns or scenarios where this function is relevant

Format your response as a valid JSON object.

Example input:

{
  "abi": [
    {
      "type": "event",
      "name": "Transfer",
      "inputs": [
        {"name": "from", "type": "address", "indexed": true},
        {"name": "to", "type": "address", "indexed": true},
        {"name": "value", "type": "uint256", "indexed": false}
      ]
    },
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        {"name": "to", "type": "address"},
        {"name": "value", "type": "uint256"}
      ],
      "outputs": [{"type": "bool"}],
      "stateMutability": "nonpayable"
    }
  ],
  "name": "MyToken",
  "sources": [
    {
      "name": "MyToken",
      "content": "contract MyToken {\\n event Transfer(address indexed from, address indexed to, uint256 value);\\n function transfer(address to, uint256 value) public returns (bool) { ... }\\n ...",
    },
    // Alternative source for a contract that already has a known explanation (e.g. a popular library)
    {
      "name": "ERC20",
      "explanation": "Standard ERC20 implementation"
    }
  ]
}

Example output:

{
  "overview": "This appears to be an ERC20 token contract named MyToken. It implements the standard token transfer functionality with proper event emission for tracking token movements.",
  "functions": [{
    "signature": "transfer(address,uint256)",
    "name": "transfer",
    "description": "Transfers tokens from the sender's account to the specified recipient",
    "parameters": [
      {
        "name": "to",
        "type": "address",
        "description": "The recipient address that will receive the tokens"
      },
      {
        "name": "value",
        "type": "uint256",
        "description": "The amount of tokens to transfer"
      }
    ],
    "returns": [
      {
        "type": "bool",
        "description": "Returns true if the transfer was successful, reverts otherwise"
      }
    ],
    "visibility": ["public"],
    "modifiers": ["nonReentrant: Prevents reentrancy"],
    "sideEffects": [
      "Decreases sender's balance by the specified amount",
      "Increases recipient's balance by the specified amount",
      "Emits a Transfer event"
    ],
    "securityConsiderations": [
      "Ensure sufficient balance before calling",
      "Be aware of potential reentrancy if the recipient is a contract",
      "Verify the recipient address is correct to avoid loss of funds"
    ],
    "commonPatterns": [
      "Direct token transfers between users",
      "Payments for goods or services",
      "Distribution of rewards or dividends"
    ]
  }],
  "events": [{
    "signature": "Transfer(address,address,uint256)",
    "name": "Transfer",
    "description": "Emitted when tokens are transferred between addresses, including mints (from zero address) and burns (to zero address)",
    "parameters": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "description": "The sender's address. Zero address indicates a mint operation",
        "significance": "Critical for tracking token source and identifying special operations like minting"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "description": "The recipient's address. Zero address indicates a burn operation",
        "significance": "Essential for tracking token destination and identifying burns"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "description": "The amount of tokens transferred",
        "significance": "Represents the magnitude of the transfer, critical for balance tracking"
      }
    ],
    "contextualUsage": "Emitted in transfer(), transferFrom(), mint(), and burn() functions to track token movements",
    "stateChanges": [
      "from.balance (decreased by value)",
      "to.balance (increased by value)",
      "If minting: totalSupply (increased by value)",
      "If burning: totalSupply (decreased by value)"
    ],
    "securityConsiderations": [
      "Monitor for large transfers that might indicate suspicious activity",
      "Watch for transfers from/to zero address to track supply changes",
      "Verify balance changes match the emitted value"
    ],
    "commonPatterns": [
      "Regular token transfers between users",
      "Token minting operations (from zero address)",
      "Token burning operations (to zero address)",
      "Batch operations in multi-transfers"
    ]
  }]
}`,
};

/* --------------------------- EXPLAIN TRANSACTION -------------------------- */
export const EXPLAIN_TRANSACTION = {
  outputSchema: z.object({
    summary: z.string(),
    details: z.object({
      functionCall: z.object({
        name: z.string(),
        description: z.string(),
        arguments: z.array(
          z.object({
            name: z.string(),
            value: z.string(),
            analysis: z.string(),
          }),
        ),
      }),
      emittedEvents: z.array(
        z.object({
          name: z.string(),
          significance: z.string(),
          parameters: z.array(
            z.object({
              name: z.string(),
              value: z.string(),
              analysis: z.string(),
            }),
          ),
        }),
      ),
      stateChanges: z.array(z.string()),
      value: z.object({
        amount: z.string(),
        significance: z.string(),
      }),
      context: z.object({
        blockNumber: z.number(),
        from: z.string(),
        to: z.string(),
      }),
      securityAnalysis: z.string(),
      businessImpact: z.string(),
    }),
  }),
  systemPrompt: `You are a blockchain transaction analyzer. Given transaction details and contract context, explain what happened in JSON format with two fields:
1. "summary": A concise, human-readable explanation of what this transaction accomplished (2-3 sentences max)
2. "details": A technical breakdown including:
   - Function called with arguments and their significance
   - Events emitted and their meaning in this context
   - State changes that occurred
   - ETH value transferred (if any)
   - Transaction context (block, sender, receiver)
   - Security implications
   - Business impact

Focus on what THIS SPECIFIC TRANSACTION did, not general descriptions of the contract or functions. Assume the user already has access to the contract's full documentation.

Format your response as a valid JSON object.

Example input:

{
  "transaction": {
    "hash": "0x123...",
    "blockNumber": "14000000",
    "details": {
      "tx": {
        "functionName": "transfer",
        "data": "0x...",
        "args": {
          "to": "0x456...",
          "value": "1000000000000000000"
        },
        "from": "0x789...",
        "to": "0xabc...",
        "value": "0"
      },
      "logs": [
        {
          "eventName": "Transfer",
          "data": "0x...",
          "args": {
            "from": "0x789...",
            "to": "0x456...",
            "value": "1000000000000000000"
          }
        }
      ]
    }
  },
  "contractExplanation": {
    "overview": "This is an ERC20 token contract...",
    "functions": [
      {
        "name": "transfer",
        "description": "Transfers tokens from sender to recipient",
        "parameters": [
          {
            "name": "to",
            "type": "address",
            "description": "Recipient address"
          },
          {
            "name": "value",
            "type": "uint256",
            "description": "Amount to transfer"
          }
        ],
        "visibility": ["public"],
        "sideEffects": ["Decreases sender balance", "Increases recipient balance", "Emits Transfer event"]
      }
    ],
    "events": [
      {
        "name": "Transfer",
        "description": "Emitted when tokens are transferred",
        "parameters": [
          {
            "name": "from",
            "type": "address",
            "indexed": true,
            "description": "Sender address",
            "significance": "Source of tokens"
          },
          {
            "name": "to",
            "type": "address",
            "indexed": true,
            "description": "Recipient address",
            "significance": "Destination of tokens"
          },
          {
            "name": "value",
            "type": "uint256",
            "indexed": false,
            "description": "Amount transferred",
            "significance": "Quantity of tokens moved"
          }
        ]
      }
    ]
  }
}

Example output:

{
  "summary": "This transaction transferred 1e18 TOKEN from 0x789... to 0x456... via the ERC20 transfer function. The operation completed successfully with no ETH value transferred.",
  "details": {
    "functionCall": {
      "name": "transfer",
      "description": "Standard ERC20 token transfer",
      "arguments": [
        {
          "name": "to",
          "value": "0x456...",
          "analysis": "Recipient address, most likely an EOA"
        },
        {
          "name": "value",
          "value": "1000000000000000000",
          "analysis": "1 TOKEN (assuming 18 decimals)"
        }
      ]
    },
    "emittedEvents": [
      {
        "name": "Transfer",
        "significance": "Confirms the token transfer was recorded on-chain",
        "parameters": [
          {
            "name": "from",
            "value": "0x789...",
            "analysis": "Sender's address (transaction initiator)"
          },
          {
            "name": "to",
            "value": "0x456...",
            "analysis": "Recipient's address"
          },
          {
            "name": "value",
            "value": "1000000000000000000",
            "analysis": "1 TOKEN (assuming 18 decimals)"
          }
        ]
      }
    ],
    "stateChanges": [
      "Sender 0x789... balance decreased by 1e18 TOKEN",
      "Recipient 0x456... balance increased by 1e18 TOKEN"
    ],
    "value": {
      "amount": "0",
      "significance": "No ETH was transferred in this transaction, only tokens"
    },
    "context": {
      "blockNumber": 14000000,
      "from": "0x789...",
      "to": "0xabc... (token contract)"
    },
    "securityAnalysis": "Standard token transfer with no unusual patterns. The transaction sender matches the token sender, indicating a direct transfer rather than an approved transfer.",
    "businessImpact": "Simple value transfer between two addresses, possibly representing a payment, gift, or other token movement between parties."
  }
}`,
};
