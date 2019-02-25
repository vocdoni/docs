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

### Entity creation

```mermaid
sequenceDiagram
    ProcessManager->>DVoteJS: createEntity(entityMetadata)

    DVoteJS->>+Blockchain Entity: Entity.get(address)
    Blockchain Entity-->>-DVoteJS: entity

    Note right of DVoteJS: Check if it exists
    
    DVoteJS-->+IPFS: ipfs.pin(entityMetadata) : metadataHash

    DVoteJS->>+Blockchain Entity: Entity.create(name, metadataHash)
    Blockchain Entity-->>-DVoteJS: txId

    DVoteJS-->>ProcessManager: address
```

Used schemas:
* [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Note:** <small>IPFS is not an external service. Data is pinned in the local IPFS repository of the Process Manager, but from this point, data becomes available through the P2P network.</small>

### Identity creation

-

### Entity subscription

```mermaid
sequenceDiagram
    App->>+DVoteJS: getAll()

    DVoteJS->>+Blockchain Entity: Entity.getEntityIds()
    Blockchain Entity-->>-DVoteJS: idList

    loop
        DVoteJS->>+Blockchain Entity: Entity.get(id)
        Blockchain Entity-->>-DVoteJS: entityMetadata
    end

    DVoteJS-->>-App: entities

    activate App
    Note right of App: User selects an identity
    deactivate App

    App->>App: addEntity(selectedEntity)

```
