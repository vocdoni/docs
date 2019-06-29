# Sequence diagrams

Traditional systems like API's present simple scenarios, in which a centralized service defined how data should be encoded.

However, decentralized ecosystems like a distributed vote system need much stronger work on defining every interaction between any two peers on the network.

- [Sequence diagrams](#sequence-diagrams)
  - [Prior to voting](#prior-to-voting)
    - [Set Entity metadata](#set-entity-metadata)
    - [Entity subscription](#entity-subscription)
      - [Initial Gateway discovery](#initial-gateway-discovery)
      - [Listing boot entities](#listing-boot-entities)
    - [Custom requests to an Entity](#custom-requests-to-an-entity)
      - [Sign up](#sign-up)
      - [Submit a picture](#submit-a-picture)
      - [Make a payment](#make-a-payment)
      - [Resolve a captcha](#resolve-a-captcha)
      - [External Entity to make use of Census Service](#external-entity-to-make-use-of-census-service)
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

---

## Prior to voting

--------------------------------------------------------------------------------

### Set Entity metadata
An Entity starts existing at the moment it has certain metadata stored on the [EntityResolver](/architecture/components/entity?id=entityresolver) smart contract. 

```mermaid

sequenceDiagram
    participant EM as Entity Manager
    participant DV as dvote-js
    participant GW as Gateway/Web3
    participant ER as Entity Resolver contract

    EM->>DV: getEntityId(entityAddress)
    DV-->>EM: entityId

    alt has a Gateway
        Note right of EM: Set Metamask <br/> to the Gateway
    else
        Note right of EM: Boot a GW and tell <br/> Metamask to use it
    end

    EM->>DV: getDefaultResolver()
        Note right of DV: Hardcoded default Entity<br/>Resolver instance
    DV-->>EM: resolverAddress


    EM->>EM: Fill-up name
    EM->>+DV: EntityResolver.setName(entityId, name)
        DV->>GW: setText(entityId, "name", name)
            GW->>ER: #60; transaction #62;
            ER-->>GW: 
        GW-->>DV: 
    DV-->>-EM: 

    loop additional key/values
        EM->>EM: Fill-up key-value
        EM->>+DV: EntityResolver.set(entityId, key, value)
            DV->>GW: setText(entityId, key, value)
                GW->>ER: #60; transaction #62;
                ER-->>GW: 
            GW-->>DV: 
        DV-->>-EM: 
    end

```

**Used schemas:**

- [Entity metadata](/architecture/components/entity.md)

### Entity subscription

#### Initial Gateway discovery

The app wants to get initial connectivity with the available gateways.

- Using a well-known Ethereum Gateway (Infura or similar), we query for an initial set of boot nodes on the Vocdoni ENS Resolver. The following is predefined:
    - Well-known Ethereum gateways
    - Entity Resolver contract address
    - Vocdoni's Entity ID
- From one of the bootnodes, we get a list of Gateways provided by Vocdoni

```mermaid

sequenceDiagram
    participant Client
    participant DV as DVote
    participant ER as Entity Resolver contract
    participant BN as BootNode


    Client->>DV: Gateway.getActive(ethGateway, resolverAddress, entityId)
        DV->>ER: EntityResolver.list(resolverAddress, entityId, "vnd.vocdoni.boot")
        ER-->>DV: bootNodeUrl[]
    
        DV->>BN: GET /gateways.json
        BN-->>DV: gatewayUri[]
    DV-->>Client: gatewayUri[]
```

Eventually:

- One of Vocdoni's Gateways is used to query the ENS resolver of a certain Entity

#### Listing boot entities

A user wants to visualize a list of entities so he/she can eventually subscribe to one.

```mermaid

sequenceDiagram
    participant App
    participant DV as dvote-js
    participant GW as Gateway/Web3
    participant ER as Entity Resolver contract
    participant IPFS as Ipfs

    loop entityRef[]
        App->>DV: Entity.fetch(entityId, resolver)
        loop
            DV->>GW: text(entities[i], "vnd.vocdoni.meta")
                GW->>ER: text(entities[i], "vnd.vocdoni.meta")
                ER-->>GW: metadataContentUri
            GW-->>DV: metadataContentUri
            DV->>GW: fetchFile(metadataContentUri)
                GW->>IPFS: Ipfs.get(metadataContentUri)
                IPFS-->>GW: entityMetadata
            GW-->>DV: entityMetadata
        end
        DV-->>App: entityMetadata
    end

    App->>App: Display Entites
    App->>App: Subscribe
```

**Used schemas:**

- [Entity metadata](/architecture/components/entity.md)

**Related:**

- [Gateway Boot Nodes](/architecture/components/entity?id=gateway-boot-nodes)

**Notes:**

- In the case of React Native apps, DVote JS will need to run on the [Web Runtime component](/architecture/general?id=web-runtime-for-react-native)

### Custom requests to an Entity

An Entity may have specific requirements on what users have to accomplish in order to join a be part of its user registry.

Some may require filling a simple form. Some others may ask to log in from an existing HTTP service. Uploading ID pictures, selfies or even making payments need custom implementations that decide that a user must eventually be added to a census.

Below are some examples of a user selecting an action from the entityMetadata > actions available.

#### Sign up

The user fills a form with personal data and submits it to the entity.

```mermaid
sequenceDiagram
    participant App
    participant UR as WebView<br/>User Registry
    participant BK as Private Backend

    Note right of App: Selected action:<br/>Browse #60;action-url#62;

    App->>UR: GET /#60;action-url#62;
        alt Needs the public key
            UR->>App: sendMessage('authenticate')
            App-->>UR: (publicKey, signature, timestamp)

        end
        UR->>UR: Fill the form

        UR->>UR: signUp(name, lastName, publicKey, censusId)

        UR->>BK: insert(name, lastName, publicKey, censusId)
            Note right of BK: validate the request
        BK-->>UR: 
    UR-->>App: 
```

**Used schemas:**

- [Entity metadata](/architecture/components/entity?id=entity-metadata)

**Notes:**

- `ACTION-URL` is defined on the metadata of the contract. It is expected to be a full URL that can be navigated through a traditional HTTP/S request.

#### Submit a picture

#### Make a payment

#### Resolve a captcha

#### External Entity to make use of Census Service

<!-- TODO: Review ENS records -->

- `Census Service Entity` and `External Entity` can be the same entity
- A request to the `Census Service` must include the <entityReference> in the payload for the `Census Service Entity` to know where it can find whether the `censusId` or the `entityId` are valid ones.

>Prefix `ex` and `cs` on `entityId` and `resolverAddress` are used to represent `External Entity` and `Census Service` respectively.

```mermaid

sequenceDiagram
    participant ENTCS as Entity's Census Service
    participant EXENT as External Entity
    participant EMGR as Entity Manager
    participant DV as DVote
    participant GW as Gateway/Web3/IPFS
    participant ER as Entity Resolver
    participant CSRV as Census Service
    participant IPFS as IPFS

    Note right of DV: TO DO: Review ENS records

    Note right of ENTCS: Agree on using <br/>the Census Service<br/>from an external <br/>channel
    ENTCS-->EXENT: 
    ENTCS->>EMGR: Fill External Entity resolver and externalEntityId
    EMGR->>DV: addCensusServiceSourceEntity(csEntityResolver, csEntityId, exResolver,exEntityId)
    DV->>DV: getEntityReference(exResolverAddress, exEntityId)
    DV->>GW: setListText(csEntityId, "vnd.vocdoni.census-service-source-entities", index, &#60;exEntityReference#62;)
    GW->>ER: #60;transaction#62;

    loop to all census ids
        EXENT->>EMGR:Fill censusId
        EMGR->>DV:addCensusId(exResolverAddress, exEntityId, censusId)
        DV->>GW:setListText(exEntityId, "vnd.vocdoni.census-ids", index,  censusId)
        GW->>ER:#60;transaction#62;
    end

    loop to all keys
        EXENT->>EMGR:Fill the public key that will publish to the Census Service
        EMGR->>DV:addCensusManagerKey(exResolverAddress, exEntityId, publicKey)
        DV->>GW:setListText(exEntityId, "vnd.vocdoni.census-manager-keys", index,  publicKey)
        GW->>ER:#60;transaction#62;
    end

    Note left of CSRV: Eventually, the <br/>Census Service <br/>refreshes its config

    CSRV->>ER: List(csEntityId, "vnd.vocdoni.census-service-source-entities")
    ER-->>CSRV:[#60;entityReference#62;]

    loop source entities
        CSRV->>ER: List(exEntityId, "vnd.vocdoni.census-ids")
        ER-->>CSRV:[#60;census-id#62;, ...]
        CSRV->>ER: List(exEntityId, "vnd.vocdoni.census-manager-keys")
        ER-->>CSRV:[#60;publicKey#62;, ...]
    end

    Note right of EXENT: Finally, an Entity<br/>requests a census<br/>operation
    
    EXENT->>GW: addClaimBulk(censusId, payload)
    GW->>IPFS: #60;request data#62;
    IPFS-->>CSRV: #60;request data#62;
    # CSRV->>CSRV: Get its own resolver and entityId
    CSRV->>CSRV: Check exEntityId is within "census-service-source-entities"
    CSRV->>CSRV: Check the censusId belongs to "census-ids"
    CSRV->>CSRV: Check the signer belongs to "census-manager-keys"
    CSRV->>CSRV: addClaimBulk(censusId, payload)

```

**Used schemas:**
- [Entity reference](/architecture/components/census-service?id=entity-reference)

#### Adding users to a census

Depending on the activity of users, an **Entity** may decide to add public keys to one or more census.

```mermaid
sequenceDiagram
    participant PM as Entity Manager
    participant DB as Internal Database
    participant DV as DVote JS
    participant GW as Gateway/Web3
    participant CS as Census Service

    PM->>DB: getUsers({ pending: true })
    DB-->>PM: pendingUsers

    loop pendingUsers
        PM->>DV: Census.addClaim(censusId, censusMessagingURI, claimData, web3Provider)
            activate DV
                DV->>DV: signRequestPayload(payload, web3Provider)
            deactivate DV

            Note right of DV: TO DO: Review calls

            DV->>GW: addCensusClaim(addClaimPayload)
                GW->>CS: addClaim(claimPayload)
                CS-->>GW: success
            GW-->>DV: success
        DV-->>PM: success
    end
```

**Used schemas:**

- [Census Service - addClaim](/architecture/components/census-service?id=census-service-addclaim)
- [Census Service - addClaimBulk](/architecture/components/census-service?id=census-service-addclaimbulk)

---

## Voting

### Voting process creation

```mermaid
sequenceDiagram
    participant PM as Entity Manager
    participant DV as DVote JS
    participant GW as Gateway/Web3
    participant CS as Census Service
    participant IPFS as IPFS
    participant BC as Blockchain

    Note right of DV: TO DO: Review calls

    PM->>+DV: Process.create(processDetails)

        DV->>+GW: censusDump(censusId, signature)
            GW->>+CS: dump(censusId, signature)
            CS-->>-GW: merkleTree
        GW-->>-DV: merkleTree

        alt Linkable Ring Signatures
            loop modulusGroups
                DV-->>GW: addFile(modulusGroup) : modulusGroupHash
                    GW-->IPFS: IPFS.put(modulusGroup) : modulusGroupHash
                GW-->>DV: 
            end
        else ZK-Snarks
            DV-->>GW: addFile(merkleTree) : merkleTreeHash
                GW-->IPFS: IPFS.put(merkleTree) : merkleTreeHash
            GW-->>DV: 
        end

        DV->>+GW: getCensusRoot(censusId)
        GW->>+CS: getRoot(censusId)
        CS-->>-GW: rootHash
        GW-->>-DV: rootHash

        DV-->>GW: addFile(processMetadata) : metadataHash
            GW-->IPFS: IPFS.put(processMetadata) : metadataHash
        GW-->>DV: 

        DV->>+GW: Process.create(entityId, name, metadataContentUri)
            GW->>+BC: #60; transaction #62;
            BC-->>-GW: txId
        GW-->>-DV: txId

        DV->>+GW: IPFS.put(newJsonMetadata)
            GW-->BC: IPFS.put(newJsonMetadata)
        GW-->>-DV: jsonHash

        DV->>+GW: EntityResolver.set(entityId, 'vnd.vocdoni.meta', metadataContentUri)
        GW-->>-DV: txId

    DV-->>-PM: success
```

**Used schemas:**

- [Process Metadata](/architecture/components/process?id=process-metadata-json)
- [Modulus group list](/architecture/components/census-service?id=modulus-group-list)
- [Census Service - addClaimBulk](/architecture/components/census-service?id=census-service-addclaimbulk)
- [Census Service - getRoot](/architecture/components/census-service?id=census-service-getroot)
- [Census Service - setParams](/architecture/components/census-service?id=census-service-setparams)
- [Census Service - dump](/architecture/components/census-service?id=census-service-dump)

### Voting process retrieval

A user wants to retrieve the voting processes of a given Entity

```mermaid
sequenceDiagram
    participant App as App user
    participant DV as DVote JS
    participant GW as Gateway/Web3
    participant BC as Blockchain
    participant SW as Swarm

    App->>+DV: Process.fetchByEntity(entityAddress, resolver)

        DV->>GW: EntityResolver.text(entityId, "vnd.vocdoni.meta")
            GW->>BC: text(entityId, "vnd.vocdoni.meta")
            BC-->>GW: contentUri
        GW-->>DV: contentUri

        DV->>GW: IPFS.get(jsonHash)
            GW-->IPFS: IPFS.get(jsonHash)
        GW-->>DV: entityMetadata

        loop processIDs

            DV->>GW: getMetadata(processId)
                GW->>BC: getMetadata(processId)
                BC-->>GW: (name, metadataContentUri, merkleRootHash, relayList, startTime, endTime)
            GW-->>DV: (name, metadataContentUri, merkleRootHash, relayList, startTime, endTime)

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

- [Process Metadata](/architecture/components/process?id=process-metadata-json)

### Check census inclusion

A user wants to know whether he/she belongs in the census of a process or not.

The request can be sent through HTTP/PSS/PubSub. The response may be fetched by subscribing to a topic on PSS/PubSub.

```mermaid
sequenceDiagram
    participant App as App user
    participant DV as DVote JS
    participant GW as Gateway/Web3
    participant CS as Census Service

    Note right of DV: TO DO: Review calls (LRS)

    App->>+DV: Census.hasClaim(publicKey, censusId, censusMessagingURI)

        DV->>+GW: genCensusProof(censusId, publicKey)
        GW->>+CS: genProof(censusId, publicKey)
        CS-->>-GW: isInCensus
        GW-->>-DV: isInCensus

    DV-->>-App: isInCensus
```

**Used schemas:**

- [Census Service - generateProof](/architecture/components/census-service?id=census-service-generateproof)

**Notes:**

- `generateProof` may be replaced with a call to `hasClaim`, for efficiency
- The `censusId` and `censusMessagingURI` should have been fetched from the [Process Metadata](/architecture/components/process)

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

            DV->>+GW: generateProof(processMetadata.census.id, publicKey)

            GW->>+CS: PSS.broadcast(#60;generateProofData#62;)
            CS-->>-GW: merkleProof

            GW-->>-DV: merkleProof

        end

        DV->>DV: computeNullifier()

        DV->>DV: encrypt(vote, processMetadata.publicKey)

        DV->>DV: generateZkProof(provingK, verificationK, signals)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVote(encryptedVotePackage, relay.messagingUri)

            GW->>RL: transmitVoteEnvelope(encryptedVotePackage)
            RL-->>GW: ACK

        GW-->>DV: submitted

    DV-->>-App: submitted
```

**Used schemas:**

- [Process Metadata](/architecture/components/process?id=process-metadata-json)
- [Census Service - generateProof](/architecture/components/census-service?id=census-service-generateproof)
- [Vote Package - ZK Snarks](/architecture/components/relay?id=vote-package-zk-snarks)

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

        Note right of DV: TO DO: Review calls

        alt censusChunk not provided

            DV->>+GW: getChunk(publicKeyModulus)

            GW->>+CS: getChunkData(modulus)
            CS-->>-GW: censusChunk

            GW-->>-DV: censusChunk

        end

        DV->>DV: encrypt(vote, processMetadata.publicKey)

        DV->>DV: sign(processMetadata.address, privateKey, censusChunk)

        DV->>DV: encryptVotePackage(package, relay.publicKey)

        DV->>GW: submitVote(encryptedVotePackage, relay.messagingUri)

            GW->>RL: transmitVoteEnvelope(encryptedVotePackage)
            RL-->>GW: ACK

        GW-->>DV: submitted

    DV-->>-App: submitted
```

**Used schemas:**

- [Process Metadata](/architecture/components/process?id=process-metadata-json)
<!-- - [getChunk](/architecture/components/census-service?id=census-service-getchunk) -->
- [Vote Package - Ring Signature](/architecture/components/relay?id=vote-package-ring-signature)

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

    RL->>+BC: Process.registerBatch(batchContentUri)
    BC-->>-RL: txId
```

**Used schemas:**

- [Vote Batch](/architecture/components/relay?id=vote-batch)

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

    App->>DV: checkVoteStatus(processId, relayMessagingUri)

        DV->>DV: computeNullifierOrSignature()

        DV->>+GW: getVoteStatus(processId, nullifierOrSignature, relayMessagingUri)

            GW-->>RL: requestVoteStatus(processId, nullifierOrSignature)
            RL-->>GW: (batchId?, batchContentUri?)

        GW-->>-DV: (batchId?, batchContentUri?)

        alt it does not trust the batchContentUri

            DV->>+GW: Process.getBatch(batchId)
            GW->>+BC: Process.getBatch(batchId)
            BC-->>-GW: (processId, batchContentUri)
            GW-->>-DV: (processId, batchContentUri)

        end

        DV->>+GW: fetchFile(batchHashURI)
        GW->>+SW: Swarm.get(batchHash)
        SW-->>-GW: batch
        GW-->>-DV: batch

        DV->>DV: checkWithinBatch(nullifierOrSignature, batch)

    DV-->>App: isRegistered
```
**Used schemas:**

- [Vote Batch](/architecture/components/relay?id=vote-batch)

**Notes:**

- `nullifierOrSignature` is expected to contain a nullifier when the process `type` is `zk-snarks`
- `nullifierOrSignature` is expected to contain a ring signature when the process `type` is `lrs`

### Closing a Voting Process

```mermaid
sequenceDiagram
    participant PM as Entity Manager
    participant DV as DVote JS
    participant GW as Gateway/Web3
    participant BC as Blockchain Process

    PM->>DV: Process.close(processId, privateKey)

        DV->>+GW: Process.close(processId, privateKey)
        GW->>+BC: Process.close(processId, privateKey)

            BC->>BC: checkPrivateKey(privateKey)
            BC->>BC: closeProcess(processId)

        BC-->>-GW: success
        GW-->>-DV: success

    DV-->>PM: success
```

### Vote Scrutiny

Anyone with internet access can compute the scrutiny of a given processId. However, the vote batch data needs to be pinned online for a certain period of time.

```mermaid
sequenceDiagram
    participant SC as Scrutinizer
    participant DV as DVote JS
    participant GW as Gateway/Web3
    participant BC as Blockchain Process
    participant SW as Swarm

    SC->>+DV: Process.get(processId)

        DV->>+GW: Process.get(processId)
        GW->>+BC: Process.get(processId)
        BC-->>-GW: (name, metadataContentUri, privateKey)
        GW-->>-DV: (name, metadataContentUri, privateKey)

    DV-->>-SC: (name, metadataContentUri)

    SC->>+DV: Swarm.get(metadataHash)

        DV->>+GW: fetchFile(metadataHash)
        GW->>+SW: Swarm.get(metadataHash)
        SW-->>-GW: processMetadata
        GW-->>-DV: processMetadata

    DV-->>-SC: processMetadata

    SC->>+DV: Process.getVoteBatchIds(processId)

        DV->>+GW: Process.getVoteBatchIds(processId)
        GW->>+BC: Process.getVoteBatchIds(processId)
        BC-->>-GW: batchIds
        GW-->>-DV: batchIds

    DV-->>-SC: batchIds

    SC->>+DV: Process.fetchBatches(batchIds)
        loop batchIds

            DV->>+GW: Process.getBatch(batchId)
            GW->>+BC: Process.getBatch(batchId)
            BC-->>-GW: (type, relay, batchContentUri)
            GW-->>-DV: (type, relay, batchContentUri)

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

            SC->>+DV: LRS.check(signature, voteGroup.pubKeys, processId)
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

- [Process Metadata](/architecture/components/process?id=process-metadata-json)
- [Vote Package - ZK Snarks](/architecture/components/relay?id=vote-package-zk-snarks)
- [Vote Package - Ring Signature](/architecture/components/relay?id=vote-package-ring-signature)
- [Vote Batch](/architecture/components/relay?id=vote-batch)
- [Vote Summary](/architecture/components/relay?id=vote-summary)
- [Vote List](/architecture/components/relay?id=vote-list)
