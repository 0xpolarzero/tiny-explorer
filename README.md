- Use whatsabi to get the contract code and abi (especially code)
- use multiple api keys for various chains
- create server for both llm & backend stuff
  - use caching for contract code & abi
- add lm studio running in docker instead of deep infra https://gitlab.com/logliwo/lm-studio-docker-compose/-/tree/main?ref_type=heads

(later)

- add caching to llm responses (chain_id:contract_address:function_name)
  - retrieve a general explanation of the function and cache it (1st prompt)
  - only need to reprompt with the provided arguments (2nd prompt)
