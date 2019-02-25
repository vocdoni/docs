# Sequence diagrams

## Prior to voting
---

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

<!-- ### Identity creation -->

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

    App->>+DVoteJS: Entity.getMetadata(selectedEntity.metadataOrigin)
        DVoteJS->>+Swarm: Swarm.fetch(metadataHash)
        Swarm-->>-DVoteJS: entityMetadata
    DVoteJS-->>-App: entityMetadata

    App->>App: addEntity(selectedEntity)
```

**Used schemas:**
* [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Notes:** 
* `metadataOrigin` can be in the form of `swarm:<metadataHash>` `ipfs:<metadataHash>` or `https://<host>/<path-to-json>`
* In the case of React Native apps, DVoteJS will need to run on the WebRuntime component

### Custom requests to an Entity

Below are some examples:

#### Sign up

The user selects an action from the entityMetadata > actions available.

```mermaid
sequenceDiagram
    App->>+ProcessManager: Show <ACTION-URL>?publicKey=<pk>&censusId=<id>
        activate ProcessManager
        Note right of ProcessManager: Fill the form
        deactivate ProcessManager

        ProcessManager->>+ProcessManager: signUp(name, lastName, publicKey, censusId)
    ProcessManager-->>-App: success

```

#### Submit a picture
#### Make a payment
#### Resolve a captcha

#### Add a user to a census

Depending on the activity of the user, an organization may decide to add it to a census.

