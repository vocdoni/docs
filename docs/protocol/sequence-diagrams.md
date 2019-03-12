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

**Used schemas:**
- [Entity metadata](/protocol/data-schema.md?id=entity-metadata)
- `metadataOrigin` should be as [stated here](/protocol/data-schema?id=content-uri)

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

**Used schemas:**
- [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Notes:** 
- `metadataOrigin` should be as [stated here](/protocol/data-schema?id=content-uri)
- In the case of React Native apps, DVote JS will need to run on the WebRuntime component

### Custom requests to an Entity

Actions like creating an Entity or subscribing to it are standard processes. However every Entity will probably have specific requirements on what users have to accomplish in order to join a census.

Some may require filling a simple form. Some others may ask to log in from an existing HTTP service. Uploading ID pictures, selfies or even making payments need custom implementations that decide that a user must eventually be added to a census.

Below are some examples:

#### Sign up

The user selects an action from the entityMetadata > actions available.

```mermaid
sequenceDiagram
    participant App
    participant CR as Census Registry
    participant DB as Internal Database

    App->>CR: Navigate to: <ACTION-URL>?publicKey=<pk>&censusId=<id>
        activate CR
            Note right of CR: Fill the form
        deactivate CR

        CR->>CR: signUp(name, lastName, publicKey, censusId)

        CR->>DB: insert(name, lastName, publicKey, censusId)
        DB-->>CR: 
    CR-->>App: success

```

**Used schemas:**
- [Entity metadata](/protocol/data-schema.md?id=entity-metadata)

**Notes:** 
- `ACTION-URL` is defined on the metadata of the contract. It is expected to be a full URL to which GET parameters will be appended (`publicKey` and optionally `censusId`)

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

**Used schemas:**
- [addClaimPayload](/protocol/data-schema?id=census-addclaim)


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

**Used schemas:**
- [processMetadata](/protocol/data-schema?id=process-metadata)
- [getRootPayload](/protocol/data-schema?id=census-getroot)
- The `processDetails` parameter is specified [on the dvote-js library](https://github.com/vocdoni/dvote-client/blob/master/src/dvote/process.ts)

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
            BC-->>DV: (name, metadataOrigin, merkleRootHash, relayList, startBlock, endBlock)

            alt Process is active or in the future
                DV->>SW: Swarm.get(metadataHash)
                SW-->>DV: processMetadata
            end

        end

    DV-->>-App: processesMetadata
```

**Used schemas:**
- [processMetadata](/protocol/data-schema?id=process-metadata)

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

**Used schemas:**
- [genProofPayload](/protocol/data-schema?id=census-genproof)

**Notes:** 
- `genProof` may be replaced with a call to `hasClaim`, for efficiency
- The `censusId` and `censusOrigin` should have been fetched from a the metadata of a process

### Casting a vote with ZK Snarks

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

        DV->>DV: computeNullifier()

        DV->>DV: encrypt(vote, processMetadata.publicKey)

        DV->>DV: generateZkProof(provingK, verificationK, signals)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVotePackage(encryptedVotePackage, relay.origin)
            
            GW->>RL: submitVotePackage(encryptedVotePackage)
            RL-->>GW: ACK
        
        GW-->>DV: submitted

    DV-->>-App: submitted

```

**Used schemas:**
- [processMetadata](/protocol/data-schema?id=process-metadata)
- [genProofPayload](/protocol/data-schema?id=census-genproof)
- [Vote Package - ZK Snarks](/protocol/data-schema?id=vote-package-zk-snarks)

**Notes:**
- The Merkle Proof could be retrieved and stored beforehand


### Casting a vote with Linkable Ring Signatures

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

**Used schemas:**
- [processMetadata](/protocol/data-schema?id=process-metadata)
- [getChunk](/protocol/data-schema?id=census-getchunk)
- [Vote Package - Ring Signature](/protocol/data-schema?id=vote-package-ring-signature)

**Notes:**
- The `publicKeyModulus` allows to segment the whole census into `N` polling stations. Every public key is assigned to exactly one, depending on the modulus that yields a division by `processMetadata.census.modulusSize`.

### Registering a Vote Batch

```mermaid
sequenceDiagram
    participant RL as Relay
    participant SW as Swarm
    participant BC as Blockchain Process

    activate RL
        RL->>RL: loadPendingVotes()
        RL->>RL: skipInvalidVotes()
    deactivate RL

    RL-->SW: Swarm.put(voteBatch) : batchHash

    RL->>+BC: Process.registerBatch(batchOrigin)
    BC-->>-RL: txId

```

**Used schemas:**
- [Vote Batch](/protocol/data-schema?id=vote-batch)


## After voting

### Checking a submitted vote

The sequence diagram applies to both **ZK Snarks** and **LRS** Vote Packages. `nullifierOrSignature` will be interpreted according to the process' `type` on its metadata.

```mermaid
sequenceDiagram
    participant App
    participant DV as DVote JS
    participant GW as Gateway
    participant RL as Relay
    participant BC as Blockchain Process
    participant SW as Swarm

    App->>DV: checkVoteStatus(processAddress, relayOrigin)

        DV->>DV: computeNullifierOrSignature()

        DV->>+GW: checkVoteStatus(processAddress, nullifierOrSignature, relayOrigin)

            GW-->>RL: checkVoteStatus(processAddress, nullifierOrSignature)
            RL-->>GW: (batchId?, batchOrigin?)

        GW-->>-DV: (batchId?, batchOrigin?)

        alt it does not trust the batchOrigin

            DV->>+BC: Process.getBatch(batchId)
            BC-->>-DV: (processAddress, batchOrigin)
        
        end

        DV->>+SW: Swarm.get(batchHash)
        SW-->>-DV: batch

        DV->>DV: checkWithinBatch(nullifierOrSignature, batch)

    DV-->>App: isRegistered
```

**Used schemas:**
- [Vote Batch](/protocol/data-schema?id=vote-batch)

**Notes:**
- `nullifierOrSignature` is expected to contain a nullifier when the process `type` is `zk-snarks`
- `nullifierOrSignature` is expected to contain a ring signature when the process `type` is `lrs`


### Closing a Voting Process

```mermaid
sequenceDiagram
    participant PM as Process Manager
    participant DV as DVote JS
    participant BC as Blockchain Process

    PM->>DV: Process.close(processAddress, privateKey)

        DV->>+BC: Process.close(processAddress, privateKey)

            BC->>BC: checkPrivateKey(privateKey)
            BC->>BC: closeProcess(processAddress)

        BC-->>-DV: success

    DV-->>PM: success

```

### Vote Scrutiny

Anyone with internet access can compute the scrutiny of a given processAddress. However, the vote batch data needs to be pinned online for a certain period of time.

```mermaid
sequenceDiagram
    participant SC as Scrutinizer
    participant DV as DVote JS/Go
    participant BC as Blockchain Process
    participant SW as Swarm

    SC->>+DV: Process.get(processAddress)
    
        DV->>+BC: Process.get(processAddress)
        BC-->>-DV: (name, metadataOrigin, privateKey)
    
    DV-->>-SC: (name, metadataOrigin)

    SC->>+DV: Swarm.get(metadataHash)
    
        DV->>+SW: Swarm.get(metadataHash)
        SW-->>-DV: processMetadata
    
    DV-->>-SC: processMetadata

    SC->>+DV: Process.getVoteBatchIds(processAddress)
    
        DV->>+BC: Process.getVoteBatchIds(processAddress)
        BC-->>-DV: batchIds
    
    DV-->>-SC: batchIds

    SC->>+DV: Process.fetchBatches(batchIds)
        loop batchIds

            DV->>+BC: Process.getBatch(batchId)
            BC-->>-DV: (type, relay, batchOrigin)
            
            DV->>+SW: Swarm.get(batchHash)
            SW-->>-DV: voteBatch

        end
    DV-->>-SC: voteBatches

    SC->>+DV: skipInvalidRelayBatches(voteBatches, processMetadata.relays)
    DV-->>-SC: validRelayBatches
    
    SC->>+DV: skipInvalidTypeBatches(validRelayBatches, processMetadata.type)
    DV-->>-SC: validTypeBatches
    
    SC->>SC: sort(merge(validTypeBatches))

    SC->>+DV: resolveDuplicates(voteBatches)
    DV-->>-SC: uniqueVotePackages
    
    alt type=zk-snarks
        loop uniqueVotePackages

            SC->>+DV: Snark.check(proof, votePackage.publicSignals)
            DV-->>-SC: valid
        
        end
    else type=lrs

        SC->>SC: groupByModulus(uniqueVotePackages)
        loop voteGroups

            SC->>+DV: LRS.check(signature, voteGroup.pubKeys, processAddress)
            DV-->>-SC: isWithinGroup

            SC->>+DV: LRS.isUnseen(signature, processedVotes.signature)
            DV-->>-SC: isUnseen

        end
    end

    loop validVotes
    
        SC->>+DV: decrypt(vote.encryptedVote, privateKey)
        DV-->>-SC: voteValue

        SC->>SC: updateVoteCount(voteValue)

    end

    SC->>+DV: Swarm.put(voteSummary)
        DV-->SW: Swarm.put(voteSummary)
    DV-->>-SC: voteSummaryHash

    SC->>+DV: Swarm.put(voteList)
        DV-->SW: Swarm.put(voteList)
    DV-->>-SC: voteListHash

```

**Used schemas:**
- [processMetadata](/protocol/data-schema?id=process-metadata)
- [Vote Package - ZK Snarks](/protocol/data-schema?id=vote-package-zk-snarks)
- [Vote Package - Ring Signature](/protocol/data-schema?id=vote-package-ring-signature)
- [Vote Batch](/protocol/data-schema?id=vote-batch)
- [Vote Summary](/protocol/data-schema?id=vote-summary)
- [Vote List](/protocol/data-schema?id=vote-list)
