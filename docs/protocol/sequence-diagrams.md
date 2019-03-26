# Sequence diagrams

- [Sequence diagrams](#sequence-diagrams)
  - [Prior to voting](#prior-to-voting)
    - [Contract deployment (Entity)](#contract-deployment-entity)
    - [Contract deployment (Process)](#contract-deployment-process)
    - [Set Entity metadata](#set-entity-metadata)
    - [Entity subscription](#entity-subscription)
    - [Custom requests to an Entity](#custom-requests-to-an-entity)
      - [Sign up](#sign-up)
      - [Submit a picture](#submit-a-picture)
      - [Make a payment](#make-a-payment)
      - [Resolve a captcha](#resolve-a-captcha)
    - [Adding users to a census](#adding-users-to-a-census)
  - [Voting](#voting)
    - [Voting process creation](#voting-process-creation)
    - [Voting process retrieval](#voting-process-retrieval)
    - [Check census inclusion](#check-census-inclusion)
    - [Casting a vote with ZK Snarks](#casting-a-vote-with-zk-snarks)
    - [Casting a vote with Linkable Ring Signatures](#casting-a-vote-with-linkable-ring-signatures)
    - [Registering a Vote Batch](#registering-a-vote-batch)
  - [After voting](#after-voting)
    - [Checking a submitted vote](#checking-a-submitted-vote)
    - [Closing a Voting Process](#closing-a-voting-process)
    - [Vote Scrutiny](#vote-scrutiny)

## Prior to voting

--------------------------------------------------------------------------------

### Set Entity metadata

The `entityId` is the unique identifier of an entity:

```solidity
bytes32 entityId = keccak256 (entityAddress);
```

An Entity starts existing at the moment it has some metadata stored on the resolver smart contract

Setting any metadata to the entity is done via the the `Storage of text records` or via `Storage of lists of text` interfaces used by the resolver contract:

```solidity
setText (entityId, key, value);

setListText (entityId, key, index, value);
```

```mermaid

sequenceDiagram
    participant PM as Process Manager
    participant DV as dvote-js
    participant GW as Gateway/Web3
    participant ER as Entity Resolver contract

    PM->>DV: getEntityId(entityAddress)
    DV-->>PM: entityId

    alt has a Gateway
        Note right of PM: Set Metamask <br/> to the Gateway
    else
        Note right of PM: Boot a GW and tell <br/> Metamask to use it
    end

    PM->>DV: getDefaultResolver()
        Note right of DV: Hardcoded default Entity<br/>Resolver instance
    DV-->>PM: resolverAddress


    PM->>PM: Fill-up name
    PM->>+DV: EntityResolver.setName(entityId, name)
        DV->>GW: setText(entityId, "name", name)
            GW->>ER: <transaction>
            ER-->>GW: 
        GW-->>DV: 
    DV-->>-PM: 

    loop additional key/values
        PM->>PM: Fill-up key-value
        PM->>+DV: EntityResolver.set(entityId, key, value)
            DV->>GW: setText(entityId, key, value)
                GW->>ER: <transaction>
                ER-->>GW: 
            GW-->>DV: 
        DV-->>-PM: 
    end

```

**Used schemas:**

- [Entity metadata](/protocol/entity-metadata.md)

<!-- ### Identity creation -->

### Entity subscription

```mermaid

sequenceDiagram
    participant App
    participant DV as dvote-js
    participant GW as Gateway/Web3
    participant ER as Entity Resolver contract
    participant IPFS as Ipfs/Swarm

    App->>App: get reference entityId/resolver from config
    App->>DV: getBootEntities(resolver, entityId)
    DV->>GW: list(entityId, "vndr.vocdoni.entities.boot")
    GW->>ER: list(entityId, "vndr.vocdoni.entities.boot")
    ER-->>GW: entitiesList[]
    GW-->>DV: entitiesList[]

    alt default
        loop
            DV->>GW: text(entities[i], "vndr.vocdoni.meta")
                GW->>ER: text(entities[i], "vndr.vocdoni.meta")
                ER-->>GW: entityMetadataHash
            GW-->>DV: entityMetadataHash
            DV->>GW: fetchFile(entityMetadataHashURI)
                GW->>IPFS: Ipfs.get(entityMetadataHash)
                IPFS-->GW: entityMetadata
            GW-->DV: entityMetadata
        end
    end

    alt if default fails
        loop
            DV->>GW: text(entities[i], "vndr.vocdoni.name")
            GW->>ER: text(entities[i], "vndr.vocdoni.name")
            ER-->>GW: entityName
            GW-->>DV: entityName

            loop necessary data
                DV->>GW: text(entities[i], key)
                GW->>ER: text(entities[i], key)
                ER-->>GW: data
                GW-->>DV: data
            end
        end
    end

    DV-->>App:  entitiesMetadata []
    App->>App: Displays Entites
    App->>App: User subscribes
```

**Used schemas:**

- [Entity metadata](/protocol/entity-metadata.md)

**Notes:**

- In the case of React Native apps, DVote JS will need to run on the WebRuntime component

### Custom requests to an Entity

An Entity may have specific requirements on what users have to accomplish in order to join a be part of its user registry.

Some may require filling a simple form. Some others may ask to log in from an existing HTTP service. Uploading ID pictures, selfies or even making payments need custom implementations that decide that a user must eventually be added to a census.

Below are some examples:

#### Sign up

The user selects an action from the entityMetadata > actions available.

```mermaid
sequenceDiagram
    participant App
    participant UR as User Registry
    participant DB as Internal Database

    App->>UR: Navigate to: ACTION-URL?publicKey=0x1234&censusId=0x4321
        activate UR
            Note right of UR: Fill the form
        deactivate UR

        UR->>UR: signUp(name, lastName, publicKey, censusId)

        UR->>DB: insert(name, lastName, publicKey, censusId)
    UR-->>App: success
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
    participant GW as Gateway/Web3
    participant CS as Census Service

    PM->>DB: getUsers({ pending: true })
    DB-->>PM: pendingUsers


    loop pendingUsers
        PM->>DV: Census.addCensusClaim(censusId, censusOrigin, claimData, web3Provider)
        activate DV
        DV->>DV: signRequestPayload(payload, web3Provider)
        deactivate DV
        DV->>GW: addCensusClaim(addClaimPayload)
        GW->>CS: addCensusClaim(addClaimPayload)
        CS-->>GW: success
        GW-->>DV: success
        DV-->>PM: success
    end
```

**Used schemas:**

- [addClaimPayload](/protocol/data-schema?id=census-addclaim)

## Voting

--------------------------------------------------------------------------------

### Voting process creation

```mermaid
sequenceDiagram
    participant PM as Process Manager
    participant DV as DVote JS
    participant GW as Gateway/Web3
    participant CS as Census Service
    participant SW as Swarm
    participant BC as Blockchain Process

    PM->>+DV: Process.create(processDetails)

        DV->>+GW: censusDump(censusId, signature)
        GW->>+CS: dump(censusId, signature)
        CS-->>-GW: merkleTree
        GW-->>-DV: merkleTree

        DV-->>+GW: addFile(merkleTree) : merkleTreeHash
        GW-->>+SW: Swarm.put(merkleTree) : merkleTreeHash

        DV->>+GW: getCensusRoot(censusId)
        GW->>+CS: getRoot(censusId)
        CS-->>-GW: rootHash
        GW-->>-DV: rootHash

        DV-->GW: addFile(processMetadata) : metadataHash
        GW-->SW: Swarm.put(processMetadata) : metadataHash

        DV->>+GW: create(entityId, name, metadataOrigin)
        GW->>+BC: create(entityId, name, metadataOrigin)
        BC-->>-GW: txId
        GW-->>-DV: txId

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
    participant GW as Gateway/Web3
    participant BC as Blockchain Process
    participant SW as Swarm

    App->>+DV: Process.fetchByEntity(entityAddress)

        DV->>GW: getProcessesIdByOrganizer(entityAddress)
        GW->>BC: getProcessesIdByOrganizer(entityAddress)
        BC-->>GW: processIDs
        GW-->>DV: processIDs

        loop processIDs

            DV->>GW: getMetadata(processId)
            GW->>BC: getMetadata(processId)
            BC-->>GW: (name, metadataOrigin, merkleRootHash, relayList, startBlock, endBlock)
            GW-->>DV: (name, metadataOrigin, merkleRootHash, relayList, startBlock, endBlock)

            alt Process is active or in the future
                DV->>GW: fetchFile(metadataHash)
                GW->>SW: Swarm.get(metadataHash)
                SW-->>GW: processMetadata
                GW-->>DV: processMetadata
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
    participant GW as Gateway/Web3
    participant CS as Census Service

    App->>+DV: Census.hasClaim(publicKey, censusId, censusOrigin)

        DV->>+GW: genCensusProof(censusId, publicKey)
        GW->>+CS: genProof(censusId, publicKey)
        CS-->>-GW: isInCensus
        GW-->>-DV: isInCensus

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
    participant GW as Gateway/Web3
    participant CS as Census Service
    participant RL as Relay

    App->>+DV: Process.castVote(vote, processMetadata, merkleProof?)

        alt merkleProof not provided

            DV->>+GW: genProof(processMetadata.census.id, publicKey)

            GW->>+CS: genProofData(censusId, publicKey)
            CS-->>-GW: merkleProof

            GW-->>-DV: merkleProof

        end

        DV->>DV: computeNullifier()

        DV->>DV: encrypt(vote, processMetadata.publicKey)

        DV->>DV: generateZkProof(provingK, verificationK, signals)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVote(encryptedVotePackage, relay.origin)

            GW->>RL: transmitVoteEnvelope(encryptedVotePackage)
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
    participant GW as Gateway/Web3
    participant CS as Census Service
    participant RL as Relay

    App->>+DV: Process.castVote(vote, processMetadata, censusChunk?)

        alt censusChunk not provided

            DV->>+GW: getChunk(publicKeyModulus)

            GW->>+CS: getChunkData(modulus)
            CS-->>-GW: censusChunk

            GW-->>-DV: censusChunk

        end

        DV->>DV: encrypt(vote, processMetadata.publicKey)

        DV->>DV: sign(processMetadata.address, privateKey, censusChunk)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVote(encryptedVotePackage, relay.origin)

            GW->>RL: transmitVoteEnvelope(encryptedVotePackage)
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
    participant GW as Gateway/Web3
    participant RL as Relay
    participant BC as Blockchain Process
    participant SW as Swarm

    App->>DV: checkVoteStatus(processAddress, relayOrigin)

        DV->>DV: computeNullifierOrSignature()

        DV->>+GW: getVoteStatus(processAddress, nullifierOrSignature, relayOrigin)

            GW-->>RL: requestVoteStatus(processAddress, nullifierOrSignature)
            RL-->>GW: (batchId?, batchOrigin?)

        GW-->>-DV: (batchId?, batchOrigin?)

        alt it does not trust the batchOrigin

            DV->>+GW: Process.getBatch(batchId)
            GW->>+BC: Process.getBatch(batchId)
            BC-->>-GW: (processAddress, batchOrigin)
            GW-->>-DV: (processAddress, batchOrigin)

        end

        DV->>+GW: fetchFile(batchHashURI)
        GW->>+SW: Swarm.get(batchHash)
        SW-->>-GW: batch
        GW-->>-DV: batch

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
    participant GW as Gateway/Web3
    participant BC as Blockchain Process

    PM->>DV: Process.close(processAddress, privateKey)

        DV->>+GW: Process.close(processAddress, privateKey)
        GW->>+BC: Process.close(processAddress, privateKey)

            BC->>BC: checkPrivateKey(privateKey)
            BC->>BC: closeProcess(processAddress)

        BC-->>-GW: success
        GW-->>-DV: success

    DV-->>PM: success
```

### Vote Scrutiny

Anyone with internet access can compute the scrutiny of a given processAddress. However, the vote batch data needs to be pinned online for a certain period of time.

```mermaid
sequenceDiagram
    participant SC as Scrutinizer
    participant DV as DVote JS
    participant GW as Gateway/Web3
    participant BC as Blockchain Process
    participant SW as Swarm

    SC->>+DV: Process.get(processAddress)

        DV->>+GW: Process.get(processAddress)
        GW->>+BC: Process.get(processAddress)
        BC-->>-GW: (name, metadataOrigin, privateKey)
        GW-->>-DV: (name, metadataOrigin, privateKey)

    DV-->>-SC: (name, metadataOrigin)

    SC->>+DV: Swarm.get(metadataHash)

        DV->>+GW: fetchFile(metadataHash)
        GW->>+SW: Swarm.get(metadataHash)
        SW-->>-GW: processMetadata
        GW-->>-DV: processMetadata

    DV-->>-SC: processMetadata

    SC->>+DV: Process.getVoteBatchIds(processAddress)

        DV->>+GW: Process.getVoteBatchIds(processAddress)
        GW->>+BC: Process.getVoteBatchIds(processAddress)
        BC-->>-GW: batchIds
        GW-->>-DV: batchIds

    DV-->>-SC: batchIds

    SC->>+DV: Process.fetchBatches(batchIds)
        loop batchIds

            DV->>+GW: Process.getBatch(batchId)
            GW->>+BC: Process.getBatch(batchId)
            BC-->>-GW: (type, relay, batchOrigin)
            GW-->>-DV: (type, relay, batchOrigin)

            DV->>+GW: fetchFile(batchHash)
            GW->>+SW: Swarm.get(batchHash)
            SW-->>-GW: voteBatch
            GW-->>-DV: voteBatch

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

    SC->>+DV: addFile(voteSummary)
        DV-->GW: addFile(voteSummary)
        GW-->SW: Swarm.put(voteSummary)
        SW-->>GW: voteSummaryHash
        GW-->>DV: voteSummaryHash
    DV-->>-SC: voteSummaryHash

    SC->>+DV: addFile(voteList)
        DV-->GW: addFile(voteList)
        GW-->SW: Swarm.put(voteList)
        SW-->>GW: voteListHash
        GW-->>DV: voteListHash
    DV-->>-SC: voteListHash
```

**Used schemas:**

- [processMetadata](/protocol/data-schema?id=process-metadata)
- [Vote Package - ZK Snarks](/protocol/data-schema?id=vote-package-zk-snarks)
- [Vote Package - Ring Signature](/protocol/data-schema?id=vote-package-ring-signature)
- [Vote Batch](/protocol/data-schema?id=vote-batch)
- [Vote Summary](/protocol/data-schema?id=vote-summary)
- [Vote List](/protocol/data-schema?id=vote-list)
