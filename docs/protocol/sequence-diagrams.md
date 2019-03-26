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
An Entity starts existing at the moment it has certain metadata stored on the [EntityResolver](/protocol/entity-metadata?id=entityresolver) smart contract. 

```mermaid

sequenceDiagram
    participant PM as Process Manager
    participant DV as dvote-js
    participant GW as Gateway
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
        DV->>GW: EntityResolver.setText(entityId, "name", name)
            GW->>ER: <transaction>
            ER-->>GW: 
        GW-->>DV: 
    DV-->>-PM: 

    loop additional key/values
        PM->>PM: Fill-up key-value
        PM->>+DV: EntityResolver.set(entityId, key, value)
            DV->>GW: EntityResolver.setText(entityId, key, value)
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
    participant ER as Entity Resolver contract
    participant IPFS as Ipfs/Swarm

    App->>App: get reference entityId/resolver from config
    App->>DV: getBootEntities(resolver, entityId)
    DV->>ER: list(entityId, "vndr.vocdoni.entities.boot")
    ER-->>DV: entitiesList[]

    alt default
        loop
            DV->>ER: text(entities[i], "vndr.vocdoni.meta")
            ER-->>DV: entityMetadataHash
            DV->>IPFS: Ipfs.get(entityMetadataHash)
            IPFS-->DV: entityMetadata
        end
    end

    alt if default fails
        loop
            DV->>ER: text(entities[i], "vndr.vocdoni.name")
            ER-->>DV: entityName

            loop necessary data
                DV->>ER: text(entities[i], key)
                ER-->>DV: data
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

--------------------------------------------------------------------------------

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
    participant GW as Gateway
    participant CS as Census Service
    participant RL as Relay

    App->>+DV: Process.castVote(vote, processMetadata, merkleProof?)

        alt merkleProof not provided

            DV->>+GW: genProof(processMetadata.census.id, publicKey)

            GW->>+CS: PSS.broadcast(genProofData)
            CS-->>-GW: merkleProof

            GW-->>-DV: merkleProof

        end

        DV->>DV: computeNullifier()

        DV->>DV: encrypt(vote, processMetadata.publicKey)

        DV->>DV: generateZkProof(provingK, verificationK, signals)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVoteEnvelope(encryptedVotePackage, relay.origin)

            GW->>RL: submitVoteEnvelope(encryptedVotePackage)
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
    participant GW as Gateway
    participant CS as Census Service
    participant RL as Relay

    App->>+DV: Process.castVote(vote, processMetadata, censusChunk?)

        alt censusChunk not provided

            DV->>+GW: getChunk(publicKeyModulus)

            GW->>+CS: PSS.broadcast(getChunkData)
            CS-->>-GW: censusChunk

            GW-->>-DV: censusChunk

        end

        DV->>DV: encrypt(vote, processMetadata.publicKey)

        DV->>DV: sign(processMetadata.address, privateKey, censusChunk)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVoteEnvelope(encryptedVotePackage, relay.origin)

            GW->>RL: submitVoteEnvelope(encryptedVotePackage)
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
