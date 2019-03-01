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
            DV-->S: Swarm.put(entityMetadata) : metadataHash

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
        PM->>DV: Census.addClaim(censusId, censusOrigin, claimData, web3Provider)
        activate DV
        DV->>DV: signRequestPayload(payload, web3Provider)
        deactivate DV
        DV->>CS: addClaim(addClaimPayload)
        CS-->>DV: success
        DV-->>PM: success
    end

```

**Used schemes:**
* [addClaimPayload](/protocol/data-schema?id=census-addclaim)


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

        DV-->SW: Swarm.put(merkleTree) : merkleTreeHash

        DV->>+CS: getRoot(censusId)
        CS-->>-DV: rootHash

        DV-->SW: Swarm.put(processMetadata) : metadataHash

        DV->>+BC: create(entityId, name, metadataOrigin)
        BC-->>-DV: txId

    DV-->>-PM: success

```

**Used schemes:**
* [processMetadata](/protocol/data-schema?id=process-metadata)
* [getRootPayload](/protocol/data-schema?id=census-getroot)
* The `processDetails` parameter is specified [on the dvote-js library](https://github.com/vocdoni/dvote-client/blob/master/src/dvote/process.ts)

### Voting process retrieval

A user wants to retrieve the voting processes of a given Entity

```mermaid
sequenceDiagram
    participant App as App user
    participant DV as DVote JS
    participant BC as Blockchain Process
    participant SW as Swarm

    App->>+DV: Process.fetchByEntity(entityAddress)

        DV->>BC: getProcessesIdByOrganizer(entityAddress)
        BC-->>DV: processIDs

        loop processIDs

            DV->>BC: getMetadata(processId)
            BC-->>DV: (name, metadataOrigin, merkleRootHash, startBlock, endBlock)

            alt Process is active or in the future
                DV->>SW: Swarm.get(metadataHash)
                SW-->>DV: processMetadata
            end

        end

    DV-->>-App: processesMetadata
```

**Used schemes:**
* [processMetadata](/protocol/data-schema?id=process-metadata)

### Check census inclusion

A user wants to know whether he/she belongs in the census of a process or not.

The request can be sent through HTTP/PSS/PubSub. The response may be fetched by subscribing to a topic on PSS/PubSub.

```mermaid
sequenceDiagram
    participant App as App user
    participant DV as DVote JS
    participant CS as Census Service

    App->>+DV: Census.hasClaim(publicKey, censusId, censusOrigin)

        DV->>+CS: genProof(censusId, publicKey)
        CS-->>-DV: isInCensus

    DV-->>-App: isInCensus
```

**Used schemes:**
* [genProofPayload](/protocol/data-schema?id=census-genproof)

**Notes:** 
- `genProof` may be replaced with a call to `hasClaim`, for efficiency
- The `censusId` and `censusOrigin` should have been fetched from a the metadata of a process

## Casting a vote with ZK Snarks

Requests can be sent through HTTP/PSS/PubSub. Responses may be fetched by subscribing to a topic on PSS/PubSub.

```mermaid
sequenceDiagram

    participant App
    participant DV as DVote JS
    participant CS as Census Service
    participant GW as Gateway
    participant RL as Relay

    App->>+DV: Process.castVote(vote, processMetadata, merkleProof?)

        alt merkleProof not provided

            DV->>+CS: genProof(processMetadata.census.id, publicKey)
            CS-->>-DV: merkleProof

        end

        DV->>DV: computeNullifyer()

        DV->>DV: encrypt(vote, processMetadata.publicKey)

        DV->>DV: generateZkProof(provingK, verificationK, signals)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVotePackage(encryptedVotePackage, relay.origin)
            
            GW->>RL: submitVotePackage(encryptedVotePackage)
            RL-->>GW: ACK
        
        GW-->>DV: submitted

    DV-->>-App: submitted

```

**Used schemes:**
* [processMetadata](/protocol/data-schema?id=process-metadata)
* [genProofPayload](/protocol/data-schema?id=census-genproof)
* [Vote Package - ZK Snarks](/protocol/data-schema?id=vote-package-zk-snarks)

**Notes:**
- The Merkle Proof could be retrieved and stored beforehand


## Casting a vote with Linkable Ring Signatures

Requests can be sent through HTTP/PSS/PubSub. Responses may be fetched by subscribing to a topic on PSS/PubSub.

```mermaid
sequenceDiagram

    participant App
    participant DV as DVote JS
    participant CS as Census Service
    participant GW as Gateway
    participant RL as Relay

    App->>+DV: Process.castVote(vote, processMetadata, censusChunk?)

        alt censusChunk not provided

            DV->>+CS: getChunk(publicKeyModulus)
            CS-->>-DV: censusChunk

        end

        DV->>DV: encrypt(vote, processMetadata.publicKey)
        
        DV->>DV: sign(processMetadata.address, privateKey, censusChunk)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVotePackage(encryptedVotePackage, relay.origin)
            
            GW->>RL: submitVotePackage(encryptedVotePackage)
            RL-->>GW: ACK
        
        GW-->>DV: submitted

    DV-->>-App: submitted

```

**Used schemes:**
* [processMetadata](/protocol/data-schema?id=process-metadata)
* [getChunk](/protocol/data-schema?id=census-getchunk)
* [Vote Package - Ring Signature](/protocol/data-schema?id=vote-package-ring-signature)

**Notes:**
- The `publicKeyModulus` allows to segment the whole census into `N` polling stations. Every public key is assigned to exactly one, depending on the modulus that yields a division by `processMetadata.census.modulusSize`.

## Registering a Vote Batch

```mermaid
sequenceDiagram
    participant RL as Relay
    participant SW as Swarm
    participant BC as Blockchain Process

    activate RL
        RL->>RL: loadPendingVotes()
        RL->>RL: filterInvalidVotes()
    deactivate RL

    RL-->SW: Swarm.put(voteBatch) : batchHash

    RL->>+BC: Process.registerBatch(batchOrigin)
    BC-->>-RL: txId

```

**Used schemes:**
* [Vote Batch](/protocol/data-schema?id=vote-batch)


