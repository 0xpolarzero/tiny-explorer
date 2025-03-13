// TODO: check if covers all openzeppelin contracts and if correct
// TODO: add more known popular contracts
// - solady
export const KNOWN_CONTRACTS = [
  /* ------------------------------ OPENZEPPELIN ------------------------------ */
  {
    name: "AccessControl",
    path: "@openzeppelin/contracts/access/AccessControl.sol",
    explanation: "Provides a role-based access control mechanism to restrict function calls based on assigned roles.",
  },
  {
    name: "AccessControlEnumerable",
    path: "@openzeppelin/contracts/access/AccessControlEnumerable.sol",
    explanation: "Extends AccessControl to enable enumerating the members assigned to each role.",
  },
  {
    name: "Ownable",
    path: "@openzeppelin/contracts/access/Ownable.sol",
    explanation:
      "Implements a basic access control mechanism where an owner account is given exclusive control over certain functions.",
  },
  {
    name: "Ownable2Step",
    path: "@openzeppelin/contracts/access/Ownable2Step.sol",
    explanation:
      "Facilitates a two-step process for transferring ownership to enhance security during ownership changes.",
  },
  {
    name: "PaymentSplitter",
    path: "@openzeppelin/contracts/finance/PaymentSplitter.sol",
    explanation:
      "Allows Ether payments received by a contract to be split among a group of accounts according to predefined shares.",
  },
  {
    name: "Governor",
    path: "@openzeppelin/contracts/governance/Governor.sol",
    explanation:
      "Serves as the base contract for building on-chain governance systems by managing proposal creation, voting, and execution.",
  },
  {
    name: "GovernorCountingSimple",
    path: "@openzeppelin/contracts/governance/GovernorCountingSimple.sol",
    explanation: "Provides a basic vote counting mechanism for governance proposals.",
  },
  {
    name: "GovernorVotes",
    path: "@openzeppelin/contracts/governance/GovernorVotes.sol",
    explanation:
      "Integrates token-based voting into the governance process so that voting power is derived from token balances.",
  },
  {
    name: "GovernorVotesQuorumFraction",
    path: "@openzeppelin/contracts/governance/GovernorVotesQuorumFraction.sol",
    explanation: "Determines the quorum for governance proposals as a fraction of the total token supply.",
  },
  {
    name: "GovernorTimelockControl",
    path: "@openzeppelin/contracts/governance/GovernorTimelockControl.sol",
    explanation: "Incorporates a timelock mechanism to delay the execution of approved governance proposals.",
  },
  {
    name: "MinimalForwarder",
    path: "@openzeppelin/contracts/metatx/MinimalForwarder.sol",
    explanation:
      "Facilitates meta-transactions by forwarding calls on behalf of users so that they can interact with contracts without needing to hold Ether.",
  },
  {
    name: "Proxy",
    path: "@openzeppelin/contracts/proxy/Proxy.sol",
    explanation: "An abstract contract that delegates all calls to an implementation contract via a fallback function.",
  },
  {
    name: "TransparentUpgradeableProxy",
    path: "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol",
    explanation:
      "Implements an upgradeable proxy that separates admin functions from user calls to enable secure upgrades.",
  },
  {
    name: "ProxyAdmin",
    path: "@openzeppelin/contracts/proxy/ProxyAdmin.sol",
    explanation: "Acts as the administrator for upgradeable proxies, controlling upgrades and administration tasks.",
  },
  {
    name: "ERC1967Proxy",
    path: "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol",
    explanation:
      "Provides an upgradeable proxy implementation that follows the ERC1967 standard for storage slot management.",
  },
  {
    name: "ERC1967Upgrade",
    path: "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol",
    explanation:
      "Contains internal functions to securely upgrade the implementation address following the ERC1967 standard.",
  },
  {
    name: "BeaconProxy",
    path: "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol",
    explanation:
      "Delegates calls to an implementation address provided by a beacon contract, enabling upgradeability via the beacon pattern.",
  },
  {
    name: "UpgradeableBeacon",
    path: "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol",
    explanation:
      "Holds an implementation address and allows its upgrade, acting as a beacon for multiple proxy contracts.",
  },
  {
    name: "ReentrancyGuard",
    path: "@openzeppelin/contracts/security/ReentrancyGuard.sol",
    explanation: "Protects functions against reentrant calls by using a simple state lock mechanism.",
  },
  {
    name: "Pausable",
    path: "@openzeppelin/contracts/security/Pausable.sol",
    explanation: "Provides an emergency stop mechanism that can disable certain functions when activated.",
  },
  {
    name: "PullPayment",
    path: "@openzeppelin/contracts/security/PullPayment.sol",
    explanation:
      "Implements a pull-payment system that lets users withdraw funds owed to them, reducing risks in direct transfers.",
  },
  {
    name: "ERC20",
    path: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
    explanation: "A standard implementation of the ERC20 token standard, managing balances, allowances, and transfers.",
  },
  {
    name: "ERC20Burnable",
    path: "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol",
    explanation: "Extends the ERC20 token by allowing token holders to destroy (burn) their tokens permanently.",
  },
  {
    name: "ERC20Capped",
    path: "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol",
    explanation: "Adds a cap to the total supply of an ERC20 token, preventing minting beyond a set limit.",
  },
  {
    name: "ERC20Pausable",
    path: "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol",
    explanation: "Extends ERC20 to allow token transfers to be paused and resumed by authorized accounts.",
  },
  {
    name: "ERC20Snapshot",
    path: "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol",
    explanation:
      "Enables taking snapshots of account balances at specific moments, useful for features like dividend distribution or voting.",
  },
  {
    name: "ERC20Votes",
    path: "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol",
    explanation:
      "Integrates governance features into an ERC20 token by allowing token-based vote delegation and counting.",
  },
  {
    name: "ERC20Permit",
    path: "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol",
    explanation:
      "Allows approvals for ERC20 tokens to be made via signatures (off-chain) rather than requiring an on-chain transaction.",
  },
  {
    name: "SafeERC20",
    path: "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol",
    explanation:
      "Provides wrappers around ERC20 operations that automatically handle and revert on failure, making token interactions safer.",
  },
  {
    name: "ERC721",
    path: "@openzeppelin/contracts/token/ERC721/ERC721.sol",
    explanation:
      "A standard implementation of the ERC721 non-fungible token standard, managing unique token ownership and transfers.",
  },
  {
    name: "ERC721Enumerable",
    path: "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol",
    explanation: "Extends ERC721 to allow enumeration of all tokens as well as tokens owned by an account.",
  },
  {
    name: "ERC721URIStorage",
    path: "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol",
    explanation: "Enables per-token metadata storage by allowing token URIs to be set and stored on-chain.",
  },
  {
    name: "ERC721Burnable",
    path: "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol",
    explanation:
      "Adds functionality to ERC721 tokens so that token holders can irreversibly burn (destroy) their tokens.",
  },
  {
    name: "ERC721Royalty",
    path: "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol",
    explanation:
      "Incorporates royalty payment information into ERC721 tokens, enabling automated royalty fee handling.",
  },
  {
    name: "ERC721Holder",
    path: "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol",
    explanation:
      "A utility contract that implements the ERC721 token receiver interface, allowing it to safely hold ERC721 tokens.",
  },
  {
    name: "ERC1155",
    path: "@openzeppelin/contracts/token/ERC1155/ERC1155.sol",
    explanation:
      "A standard implementation of the ERC1155 multi-token standard that supports managing multiple token types in one contract.",
  },
  {
    name: "ERC1155Supply",
    path: "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol",
    explanation: "Extends ERC1155 by tracking the total supply for each token ID.",
  },
  {
    name: "ERC1155Burnable",
    path: "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol",
    explanation: "Allows holders of ERC1155 tokens to burn (destroy) their tokens, reducing the circulating supply.",
  },
  {
    name: "ERC1155Pausable",
    path: "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol",
    explanation:
      "Adds the ability to pause all token transfers in an ERC1155 contract for emergency or maintenance purposes.",
  },
  {
    name: "ERC1155Holder",
    path: "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
    explanation:
      "A utility contract that implements the ERC1155 receiver interface to enable a contract to hold ERC1155 tokens.",
  },
  {
    name: "ERC1155Receiver",
    path: "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol",
    explanation:
      "Provides an abstract implementation for receiving ERC1155 tokens safely, defining the required interface.",
  },
  {
    name: "Address",
    path: "@openzeppelin/contracts/utils/Address.sol",
    explanation:
      "Offers a set of functions related to the address type, including contract detection and safe value transfers.",
  },
  {
    name: "Context",
    path: "@openzeppelin/contracts/utils/Context.sol",
    explanation:
      "Provides information about the current execution context, such as the sender of the transaction and its data.",
  },
  {
    name: "Strings",
    path: "@openzeppelin/contracts/utils/Strings.sol",
    explanation: "Contains utility functions for converting numbers to strings and other string manipulation tasks.",
  },
  {
    name: "Math",
    path: "@openzeppelin/contracts/utils/Math.sol",
    explanation: "Includes standard mathematical utilities such as computing maximum, minimum, and average values.",
  },
  {
    name: "Arrays",
    path: "@openzeppelin/contracts/utils/Arrays.sol",
    explanation: "Provides utility functions for working with arrays, including searching and manipulation.",
  },
  {
    name: "Counters",
    path: "@openzeppelin/contracts/utils/Counters.sol",
    explanation:
      "Implements counters that can only be incremented, decremented, or reset, often used for tracking IDs or counts.",
  },
  {
    name: "StorageSlot",
    path: "@openzeppelin/contracts/utils/StorageSlot.sol",
    explanation: "Enables reading from and writing to specific storage slots in a safe and standardized way.",
  },
  {
    name: "EnumerableSet",
    path: "@openzeppelin/contracts/utils/EnumerableSet.sol",
    explanation:
      "Offers a library for managing sets of primitive types with efficient add, remove, and existence-check operations.",
  },
  {
    name: "EnumerableMap",
    path: "@openzeppelin/contracts/utils/EnumerableMap.sol",
    explanation: "Provides a library for managing key-value maps with enumeration over keys and values.",
  },
  {
    name: "Base64",
    path: "@openzeppelin/contracts/utils/Base64.sol",
    explanation:
      "Facilitates Base64 encoding and decoding, which is useful for generating data URIs and other on-chain data formats.",
  },
  {
    name: "ERC165",
    path: "@openzeppelin/contracts/utils/introspection/ERC165.sol",
    explanation: "Implements the ERC165 standard to allow contracts to declare and detect supported interfaces.",
  },
  {
    name: "ECDSA",
    path: "@openzeppelin/contracts/utils/cryptography/ECDSA.sol",
    explanation:
      "Provides functions for working with the Elliptic Curve Digital Signature Algorithm (ECDSA) for signature verification.",
  },
  {
    name: "EIP712",
    path: "@openzeppelin/contracts/utils/cryptography/EIP712.sol",
    explanation: "Implements the EIP712 standard for hashing and signing typed structured data.",
  },
  {
    name: "MerkleProof",
    path: "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol",
    explanation:
      "Offers functions to verify Merkle Tree proofs, which can be used to validate data inclusion in a set.",
  },
  {
    name: "SignatureChecker",
    path: "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol",
    explanation:
      "Allows checking the validity of a signature for a given signer, supporting both externally owned accounts and smart contract wallets.",
  },
  {
    name: "Timers",
    path: "@openzeppelin/contracts/utils/Timers.sol",
    explanation: "Provides utilities for managing and working with time-related operations in smart contracts.",
  },
  {
    name: "Multicall",
    path: "@openzeppelin/contracts/utils/Multicall.sol",
    explanation:
      "Enables batching multiple read-only function calls into a single call, improving efficiency for off-chain queries.",
  },
];

export const KNOWN_INTERFACES = [
  {
    name: "IAccessControl",
    path: "@openzeppelin/contracts/access/IAccessControl.sol",
    explanation: "Defines the interface for role-based access control functionality.",
  },
  {
    name: "IERC1271",
    path: "@openzeppelin/contracts/interfaces/IERC1271.sol",
    explanation:
      "Defines an interface for contracts that can validate signatures, useful for smart contract-based accounts.",
  },
  {
    name: "IERC165",
    path: "@openzeppelin/contracts/interfaces/IERC165.sol",
    explanation: "Specifies the standard interface for contract interface detection (ERC165).",
  },
  {
    name: "IERC1822",
    path: "@openzeppelin/contracts/interfaces/IERC1822.sol",
    explanation:
      "Outlines the interface for the Universal Upgradeable Proxy Standard (UUPS), used for upgradeable contracts.",
  },
  {
    name: "IERC2981",
    path: "@openzeppelin/contracts/interfaces/IERC2981.sol",
    explanation: "Specifies the NFT Royalty Standard interface for providing royalty payment information.",
  },
  {
    name: "IERC1155",
    path: "@openzeppelin/contracts/token/ERC1155/IERC1155.sol",
    explanation:
      "Defines the interface for the ERC1155 multi-token standard, allowing for standard interactions with ERC1155 tokens.",
  },
  {
    name: "IERC165",
    path: "@openzeppelin/contracts/utils/introspection/IERC165.sol",
    explanation: "Defines the interface for ERC165, which is used to query a contract’s supported interfaces.",
  },
];
