# Namespaces

Governance processes are assigned to a namespace when they are created. Namespaces allow to group them by a certain criteria. Most notably, namespaces may refer to something like Mainnet, Testnet, etc.

At the same time, every Vochain is set to only react to processes created on a specific namespace.

## Contract

To define the parameters of every namespace, Vocdoni defines the following struct:

```solidity
struct NamespaceItem {
    string chainId;
    string genesis;
    string[] validators;
    address[] oracles;
}
mapping(uint16 => NamespaceItem) internal namespaces;
```

- `chainId` is the name given to the chain (mainnet, testnet, etc)
- `genesis` provides the data that will be used as the chain genesis
- `validators` contains the public keys of the nodes that can validate Vochain transactions
- `oracles` contains the Ethereum addresses of the hosts that can submit processes to the Vochain and publish results on the process contract

Note: The `oracles` field may progressively be deprecated as the platform evolves toward a trustless oracles model. When oracles become trustless, any participant from the network could signal events on-chain, relay signed transactions or publish results following an optimistic rollup approach.

## Processes

The process contract needs to define a namespace contract instance. This instance will confirm whether `msg.sender` is an oracle or not when attempting to set the results.

[More details](/architecture/components/process?id=methods)

### Coming next

See the [Gateway](/architecture/components/gateway) section.
