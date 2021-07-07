# Namespace Contract

Concurrent Process contract instances may not be chained together and this could cause `processId` duplication issues if the same entity created processes among them. This is why Process contracts are assigned a unique namespace Id when they are created. 

Same as the Genesis Contract, the Namespaces also acts as a central registry where Process instances register for a unique Id. This Id also allows to filter processes when querying the Vochain or a Gateway. 

The instance of the Namespaces contract is resolved from `namespaces.vocdoni.eth` on the ENS registry.

## Contract

The struct defining a namespace is so simple:

```solidity
mapping(uint32 => address) public namespaces;
uint32 public namespaceCount;
```

## Methods

- `register()` is called by process contracts upon deployment. They receive a unique `namespaceId` and are registered as the contract assigned to this index.


