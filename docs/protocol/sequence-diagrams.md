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
    participant DV as DVote JS
    participant BE as Blockchain Entity
    participant S as Swarm

    PM->>DV: createEntity(entityMetadata)

        DV->>+BE: Entity.get(address)
        BE-->>-DV: entity

        Alt It does not exist
            DV-->+S: Swarm.put(entityMetadata) : metadataHash

            DV->>+BE: Entity.create(name, metadataOrigin)
            BE-->>-DV: txId
        end

    DV-->>PM: entityId
```

**Used schemes:**
* [Entity metadata](/protocol/data-schema.md?id=entity-metadata)
* `metadataOrigin` should be as [stated here](/protocol/data-schema?id=content-uri)

**Notes:** 
* Swarm is not a service by itself. Data pinned in the local Swarm repository of the Process Manager becomes available through a P2P network.

<!-- ### Identity creation -->

### Entity subscription

```mermaid
sequenceDiagram
    participant App
    participant DV as DVote JS
    participant BE as Blockchain Entity
    participant S as Swarm

    App->>+DV: getAll()

        DV->>+BE: Entity.getEntityIds()
        BE-->>-DV: idList

        loop entityIds
            DV->>+BE: Entity.get(id)
            BE-->>-DV: (name, metadataOrigin)
        end

    DV-->>-App: entities

    activate App
        Note right of App: User selects an entity
    deactivate App

    App->>+DV: Entity.getMetadata(selectedEntity.metadataOrigin)
        DV->>+S: Swarm.get(metadataHash)
        S-->>-DV: entityMetadata
    DV-->>-App: entityMetadata

    App->>App: addEntity(selectedEntity)
```

**Used schemes:**
* [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Notes:** 
* `metadataOrigin` should be as [stated here](/protocol/data-schema?id=content-uri)
* In the case of React Native apps, DVote JS will need to run on the WebRuntime component

### Custom requests to an Entity

Actions like creating an Entity or subscribing to it are standard processes. However every Entity will probably have specific requirements on what users have to accomplish in order to join a census.

Some may require filling a simple form. Some others may ask to log in from an existing HTTP service. Uploading ID pictures, selfies or even making payments need custom implementations that decide that a user must eventually be added to a census.

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

Depending on the activity of users, an **Entity** may decide to add public keys to one or more census.

```mermaid
sequenceDiagram
    participant PM as Process Manager
    participant DB as Internal Database
    participant DV as DVote JS
    participant CS as Census Service

    PM->>DB: getUsers({ pending: true })
    DB-->>PM: pendingUsers


    loop pendingUsers
        PM->>DV: Census.sign(addClaimPayload)
        DV-->>PM: signature
        
        PM->>CS: addClaim(censusId, claimData, signature)
        CS-->>PM: success
    end

```

**Used schemes:**
* [addClaimPayload](/protocol/data-schema?id=census-service-request-payload)


## Voting
---

### Voting process creation

```mermaid
sequenceDiagram
    participant PM as Process Manager
    participant DV as DVote JS
    participant CS as Census Service
    participant SW as Swarm
    participant BC as Blockchain Process

    PM->>+DV: Process.create(processDetails)

        DV->>+CS: dump(censusId, signature)
        CS-->>-DV: merkleTree

        DV->>+SW: Swarm.put(merkleTree)
        SW-->>-DV: Swarm hash

        DV->>+CS: getRoot(censusId)
        CS-->>-DV: rootHash

        DV->>+SW: Swarm.put(processMetadata)
        SW-->>-DV: Swarm hash

        DV->>+BC: create(entityId, name, metadataOrigin)
        BC-->>-DV: txId

    DV-->>-PM: success

```

**Used schemes:**
* [processMetadata](/protocol/data-schema?id=process-metadata)
* `processDetails` parameter is defined [on the dvote-js library](https://github.com/vocdoni/dvote-client/blob/master/src/dvote/process.ts)
