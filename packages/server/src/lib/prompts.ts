import { ExplainContractOutput, ExplainEventInput, GetContractOutput } from "@/lib/types";

// TODO: when we switch to a local model using LM Studio, enfore json schema return type:
// https://lmstudio.ai/docs/app/api/structured-output
// TODO: see how to directly enforce return format as we can do in LM Studio

export const getPrompt = {
  explainContract: (input: GetContractOutput) => `<|begin_of_text|><|start_header_id|>user<|end_header_id|>

# Instructions

You are a smart contract analyzer. Given a contract's ABI and optional source code, provide a comprehensive analysis in JSON format with two fields:
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
    }
  ],
  "name": "MyToken",
  "sources": [
    {
      "name": "MyToken",
      "content": "contract MyToken {\\n event Transfer(address indexed from, address indexed to, uint256 value);\\n ...",
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
}

# Input

${JSON.stringify(input)}

<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`,

  /* ------------------------------ EXPLAIN EVENT ----------------------------- */
  explainEvent: ({
    event,
    eventInfo,
  }: {
    event: ExplainEventInput["event"];
    eventInfo: ExplainContractOutput["events"][number];
  }) => `<|begin_of_text|><|start_header_id|>user<|end_header_id|>

# Instructions

You are a smart contract event analyzer. Given an event's occurrence details and its definition, explain what happened in JSON format with two fields:
1. "summary": A concise, human-readable explanation of what this event represents
2. "details": A technical breakdown including:
   - Exact values and meaning of all parameters
   - Transaction context
   - State changes
   - Security implications
   - Related events or actions
   - Business impact

Format your response as a valid JSON object.

Example input:

{
  "event": {
    "name": "Transfer",
    "signature": "Transfer(address,address,uint256)",
    "args": {
      "from": "0x123...",
      "to": "0x456...",
      "value": "1000000000000000000"
    },
    "transactionHash": "0x789...",
    "blockNumber": 12345678
  },
  "eventInfo": {
    "name": "Transfer",
    "description": "Emitted when tokens are transferred between addresses",
    "parameters": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "description": "The sender's address",
        "significance": "Critical for tracking token source"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "description": "The recipient's address",
        "significance": "Essential for tracking token destination"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "description": "The amount of tokens transferred",
        "significance": "Represents the magnitude of the transfer"
      }
    ],
    "contextualUsage": "Emitted in transfer(), transferFrom(), mint(), and burn() functions to track token movements",
    "stateChanges": ["from.balance (decreased by value)", "to.balance (increased by value)"],
    "securityConsiderations": ["Monitor for large transfers"],
    "commonPatterns": ["Regular token transfers between users", "Token minting operations (from zero address)", "Token burning operations (to zero address)", "Batch operations in multi-transfers"]
  }
}

Example output:

{
  "summary": "Transfer of 1e18 TOKEN from 0x123... to 0x456...",
  "details": {
    "parameters": {
      "from": {
        "value": "0x123...",
        "analysis": "Regular user address (not a contract or special address)"
      },
      "to": {
        "value": "0x456...",
        "analysis": "Regular user address (not a contract or special address)"
      },
      "value": {
        "value": "1000000000000000000",
        "analysis": "Standard transfer amount (1e18 TOKEN)"
      }
    },
    "context": {
      "transaction": "0x789...",
      "block": 12345678,
      "type": "Standard Transfer"
    },
    "stateChanges": [
      "Sender 0x123... balance decreased by 1e18 TOKEN",
      "Recipient 0x456... balance increased by 1e18 TOKEN"
    ],
    "securityAnalysis": "Regular transfer amount, no suspicious patterns detected",
    "relatedActions": "Direct transfer call, no additional approvals or hooks triggered",
    "businessImpact": "Standard token movement between addresses, no special implications"
  }
}

# Input

${JSON.stringify({ event, eventInfo })}

<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`,
};
