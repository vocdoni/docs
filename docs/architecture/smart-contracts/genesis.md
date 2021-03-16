# Genesis Contract

The Genesis contract acts as a central registry where Vochain (L2) chains can be registered and parameterized. Most notably, chains may refer to something like Mainnet, Testnet, etc.

The instance of the Genesis contract is resolved from `genesis.vocdoni.eth` on the ENS registry.

## Contract

To define the parameters of every Vochain instance, Vocdoni defines the following struct:

```solidity
struct NamespaceItem {
    string genesis;
    bytes[] validatorList; // Public key array
    address[] oracleList; // Oracles allowed to submit processes to the Vochain and publish results on to the Results contract
}
mapping(uint32 => ChainEntry) internal chains;
uint32 internal chainCount;
```

Chains are indexed by the `chainId`, which is unique. 

- `genesis` provides the data that will be used as the Vochain genesis
- `validatorList` contains the public keys of the nodes that can validate Vochain transactions
- `oracleList` contains the Ethereum addresses of the oracles that can submit processes to the Vochain and relay results to the Results contract

Note: The `oracles` field may progressively be deprecated as the platform evolves toward a trustless oracles model. When oracles become trustless, any participant from the network could signal events on-chain, relay signed transactions or publish results following an optimistic rollup approach.

### Coming next

See the [Namespace Contract](/architecture/smart-contracts/namespace) section.
