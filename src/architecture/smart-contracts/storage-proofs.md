# Storage Proofs Contracts

There are two types of census origins: Those who depend on a list of public keys maintained off-chain and those dependent on the status of the Ethereum blockchain at a given point in time.

In the second case, the Token holder balances are used as a weighted census. But to this end, it is needed that tokens are registered and that the balance mapping position is properly validated.


This way, token holders can proof that they held funds at a given point in time and the storage proofs contract acts as a registry that enables just that. 

The instance of the ERC20 Token Storage contract is resolved from `results.vocdoni.eth` on the ENS registry.

### Contract structs

```solidity
struct ERC20Token {
    uint256 balanceMappingPosition;
    bool registered;
}

mapping(address => ERC20Token) public tokens;
address[] public tokenAddresses;
uint32 public tokenCount = 0;
```

### Methods

- `registerToken` Validates and registers the parameters of the given token contract, if not already present.

### Getters

- `isRegistered` Determines whether the given token address has been registered
- `getBalanceMappingPosition` Retrieves the offset where the balance mapping is located. Used to generate the storage proofs from the client side.



