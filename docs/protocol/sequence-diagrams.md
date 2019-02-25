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

    Alt It does not exist
        DVoteJS-->+Swarm: Swarm.add(entityMetadata) : metadataHash

        DVoteJS->>+Blockchain Entity: Entity.create(name, metadataOrigin)
        Blockchain Entity-->>-DVoteJS: txId
    end

    DVoteJS-->>ProcessManager: address
```

**Used schemas:**
* [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Notes:** 
* `metadataOrigin` can be in the form of `swarm:<metadataHash>` `ipfs:<metadataHash>` or `https://<host>/<path-to-json>`
* Swarm is not an external service. Data is pinned in the local Swarm repository of the Process Manager, and from this point, data becomes available through the P2P network.

### Identity creation

-

### Entity subscription

```mermaid
sequenceDiagram
    App->>+DVoteJS: getAll()

    DVoteJS->>+Blockchain Entity: Entity.getEntityIds()
    Blockchain Entity-->>-DVoteJS: idList

    loop entityIds
        DVoteJS->>+Blockchain Entity: Entity.get(id)
        Blockchain Entity-->>-DVoteJS: (name, metadataOrigin)
    end

    DVoteJS-->>-App: entities

    activate App
    Note right of App: User selects an entity
    deactivate App

    App->>+Swarm: Swarm.fetch(selectedEntity.metadataHash)
    Swarm-->>-App: entityMetadata

    App->>App: addEntity(selectedEntity)

```

**Used schemas:**
* [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Notes:** 
* `metadataOrigin` can be in the form of `swarm:<metadataHash>` `ipfs:<metadataHash>` or `https://<host>/<path-to-json>`

