# Sequence diagrams

## Prior to voting
---

### Contract deployment (Entity)

```mermaid
sequenceDiagram
    participant V as Vocdoni 
    participant B as Blockchain 

    V->>+B: Entity.deploy()
    B-->>-V: address
```

### Contract deployment (Process)

```mermaid
sequenceDiagram
    participant V as Vocdoni
    participant B as Blockchain

    V->>+B: Process.deploy()
    B-->>-V: address
```

### Entity creation

```mermaid
sequenceDiagram
    participant PM as Process Manager
    participant DVJS as DVote JS
    participant BE as Blockchain Entity
    participant S as Swarm

    PM->>DVJS: createEntity(entityMetadata)

        DVJS->>+BE: Entity.get(address)
        BE-->>-DVJS: entity

        Alt It does not exist
            DVJS-->+S: Swarm.add(entityMetadata) : metadataHash

            DVJS->>+BE: Entity.create(name, metadataOrigin)
            BE-->>-DVJS: txId
        end

    DVJS-->>PM: address
```

**Used schemes:**
* [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Notes:** 
* `metadataOrigin` can be in the form of `swarm:<metadataHash>` `ipfs:<metadataHash>` or `https://<host>/<path-to-json>`
* Swarm is not an external service. Data is pinned in the local Swarm repository of the Process Manager, and from this point, data becomes available through the P2P network.

<!-- ### Identity creation -->

### Entity subscription

```mermaid
sequenceDiagram
    participant App
    participant DVJS as DVote JS
    participant BE as Blockchain Entity
    participant S as Swarm

    App->>+DVJS: getAll()

        DVJS->>+BE: Entity.getEntityIds()
        BE-->>-DVJS: idList

        loop entityIds
            DVJS->>+BE: Entity.get(id)
            BE-->>-DVJS: (name, metadataOrigin)
        end

    DVJS-->>-App: entities

    activate App
        Note right of App: User selects an entity
    deactivate App

    App->>+DVJS: Entity.getMetadata(selectedEntity.metadataOrigin)
        DVJS->>+S: Swarm.fetch(metadataHash)
        S-->>-DVJS: entityMetadata
    DVJS-->>-App: entityMetadata

    App->>App: addEntity(selectedEntity)
```

**Used schemes:**
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
    participant App
    participant PM as Process Manager
    participant DB as Internal Database

    App->>PM: Navigate to: <ACTION-URL>?publicKey=<pk>&censusId=<id>
        activate PM
            Note right of PM: Fill the form
        deactivate PM

        PM->>PM: signUp(name, lastName, publicKey, censusId)

        PM->>DB: insert(name, lastName, publicKey, censusId)
        DB-->>PM: 
    PM-->>App: success

```

**Used schemes:**
* [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Notes:** 
* `ACTION-URL` is defined on the metadata of the contract. It is expected to be a full URL to which GET parameters will be appended (`publicKey` and optionally `censusId`)

#### Submit a picture
#### Make a payment
#### Resolve a captcha

#### Adding users to a census

Depending on the activity of users, an **Entity** may decide to add their public keys to a census.

```mermaid
sequenceDiagram
    participant PM as Process Manager
    participant DB as Internal Database
    participant DVJS as DVote JS
    participant CS as Census Service

    PM->>DB: getUsers({ pending: true })
    DB-->>PM: pendingUsers


    loop pendingUsers
        PM->>DVJS: Census.sign(addClaimPayload)
        DVJS-->>PM: signature
        
        PM->>CS: addClaim(addClaimPayload, signature)
        CS-->>PM: signature
    end

```

**Used schemes:**
* [addClaimPayload](/protocol/data-schema?id=census-service-request-payload)
