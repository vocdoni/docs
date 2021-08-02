# Storage Proofs Contracts

The Storage Proof Contract allows token-holders to prove their balance of an ERC-20 token, thereby enabling the [On-Chain Census](../census/on-chain.md) mechanism.

## Using the Contract

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


