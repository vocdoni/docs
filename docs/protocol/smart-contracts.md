# Smart-contracts
`This is a work int progress`

- `Voting`: Handles the voting processes. Unique for now.
- `EntityResolver`: Stores all the metadata regarding an Entity. Multiple can exist.

## Authentication

The owner of a process or an entity metadata is the address that created them.

> This changes when we use ENS. In this case the owner is the ENS owner. This is currently not implemented.

---

## Voting

Stores all the `voting processess`. It is the source of truth for the critical data of a process

### processId

Each process is identified by the `processId`

```solidity
bytes32 processId = keccak256(abi.encodePacked(entityAddress, processIndex))
```

where `processIndex` is an auto-incremental nonce per `entityAddress`.

### entityResolver

A pointer to the resolver smart-contract pointing to the entity metadata

---

## EntityResolver

See [Entity Metadata](/protocol/entity-metadata.md)

---