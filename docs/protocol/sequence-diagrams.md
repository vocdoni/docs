# Sequence diagrams

### Contract deployment (Entity)

```mermaid
sequenceDiagram
    Vodconi->>+Blockchain: Entity.deploy()
    Blockchain-->>-Vodconi: address
```

### Contract deployment (Process)

```mermaid
sequenceDiagram
    participant Vodconi
    participant Blockchain
    Vodconi->>+Blockchain: Process.deploy()
    Blockchain-->>-Vodconi: address
```

### Register an entity

```mermaid
sequenceDiagram
    Entity->>+Process Manager: registerEntity(entityMetadata)
    Process Manager->>+Blockchain: getEntity(address)
    Blockchain-->>-Process Manager: entity
    Note right of Process Manager: Check if it exists
    Process Manager-->+IPFS: pin(entityMetadataJson) : metadataHash
    Process Manager->>+Blockchain: registerEntity(name, metadataHash)
    Blockchain-->>-Process Manager: txId
    Process Manager-->>-Entity: 
```

**Note:** IPFS is not an external service. Data is pinned in the local IPFS repository of the Process Manager, but from this point, data becomes available through the P2P network.

[Related data schema](/protocol/data-schema.md?id=entity-metadata) `(TODO)`
