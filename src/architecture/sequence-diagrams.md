# Sequence diagrams

Traditional systems like APIs present simple scenarios, in which a centralized service define how data should be encoded. However, decentralized ecosystems like a distributed vote system need much stronger work on defining every interaction between any two peers on the network.

- [Sequence diagrams](#sequence-diagrams)
  - [Prior to voting](#prior-to-voting)
    - [Initial Gateway discovery](#initial-gateway-discovery)
    - [Set Entity metadata](#set-entity-metadata)
      - [Adding users to a census](#adding-users-to-a-census)
  - [Voting](#voting)
    - [Voting process creation](#voting-process-creation)
    - [Voting process retrieval](#voting-process-retrieval)
    - [Check census inclusion](#check-census-inclusion)
    - [Casting a vote](#casting-a-vote)
  - [After voting](#after-voting)
    - [Checking a Vote Envelope](#checking-a-vote-envelope)
    - [Closing a Voting Process](#closing-a-voting-process)
    - [Vote Scrutiny](#vote-scrutiny)

---

## Prior to voting

### Initial Gateway discovery

The app wants to get initial connectivity with the available gateways.

- Using a well-known Ethereum Gateway, we query for an initial boot node on the ENS Resolver. The following is defined:
    - Well-known Ethereum blockchain gateways
    - Entity Resolver contract address
    - Vocdoni's Entity ID
- From one of the boot nodes, we get a list of Gateways provided by Vocdoni

```mermaid
%%{init: {'theme':'forest'}}%%

sequenceDiagram
    participant Client
    participant DV as DVote
    participant ER as Entity Resolver<br/> contract
    participant BN as BootNode


    Client->>DV: Gateway.getActive(ethGateway,<br/> resolverAddress, entityId)
        DV->>ER: EntityResolver.list(resolverAddress,<br/> entityId, "vnd.vocdoni.boot")
        ER-->>DV: bootNodeUrl[]
    
        DV->>BN: GET /gateways.json
        BN-->>DV: gatewayUri[]
    DV-->>Client: gatewayUri[]
```

Eventually:

- One of Vocdoni's Gateways is used to query the ENS resolver of a certain Entity

### Set Entity metadata
An Entity starts existing at the moment it has certain metadata stored on the [Entity Resolver](/architecture/smart-contracts/entity-resolver.html#entityresolver) smart contract. 

```mermaid
%%{init: {'theme':'forest'}}%%

sequenceDiagram
    participant EM as Entity<br/> Manager
    participant DV as DVote
    participant GW as Gateway/<br/>Web3
    participant ER as Entity Resolver<br/> contract
    participant IPFS

    EM->>DV: getEntityId(entityAddress)
    DV-->>EM: entityId

    EM->>DV: getDefaultResolver()
    DV-->>EM: resolverAddress

    EM->>EM: Enter name, logo, header
    
    EM->>+DV: addFile(json)
        DV->>GW: addFile(json)
            GW->>IPFS: uri     
            IPFS-->>GW: 
        GW-->>DV: 
    DV-->>-EM: 


    EM->>+DV: setMetadata(entityId, uri)
        DV->>GW: setText(entityId,<br/> "vnd.vocdoni.boot", uri)
            GW->>ER: transaction;
            ER-->>GW: 
        GW-->>DV: 
    DV-->>-EM: 
```

**Used schemas:**

- [Entity metadata](/architecture/data-schemes/entity-metadata)

#### Adding users to a census

Depending on the activity of users, an **Entity** may decide to add public keys to one or more census.

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    participant PM as Entity<br/> Manager
    participant DB as Internal<br/> Database
    participant DV as DVote
    participant GW as Gateway/<br/>Web3
    participant CS as Census<br/> Service

    PM->>DB: getUsers(<br/>{ pending: true })
    DB-->>PM: pendingUsers

    loop pendingUsers
        PM->>DV: Census.addClaim(censusId,<br/> censusMessagingURI, claimData, web3Provider)
            activate DV
                DV->>DV: signRequestPayload(<br/>payload, web3Provider)
            deactivate DV

            DV->>GW: addCensusClaim(<br/>  addClaimPayload)
                GW->>CS: addClaim(<br/>  claimPayload)
                CS-->>GW: success
            GW-->>DV: success
        DV-->>PM: success
    end
```

**Used schemas:**

- [Census Service addClaim](/architecture/services/census-service.html#addclaim)
- [Census Service addClaimBulk](/architecture/services/census-service.html#addclaimbulk)

---

## Voting

### Voting process creation

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    participant PM as Entity<br/> Manager
    participant DV as DVote
    participant GW as Gateway/<br/>Web3
    participant CS as Census<br/>Service
    participant IPFS as IPFS
    participant BC as Blockchain

    PM->>+DV: Process.create(<br/>processDetails)

        DV->>+GW: censusDump(<br/>censusId, signature)
            GW->>+CS: dump(censusId, signature)
            CS-->>-GW: merkleTree
        GW-->>-DV: merkleTree

        DV-->>GW: addFile(merkleTree)<br/> : merkleTreeHash
            GW-->IPFS: IPFS.put(merkleTree): merkleTreeHash
        GW-->>DV: 

        DV->>+GW: getCensusRoot(censusId)
        GW->>+CS: getRoot(censusId)
        CS-->>-GW: rootHash
        GW-->>-DV: rootHash

        DV-->>GW: addFile(processMetadata)<br/> : metadataHash
            GW-->IPFS: IPFS.put(processMetadata) : metadataHash
        GW-->>DV: 

        DV->>+GW: Process.create(name,<br/> metadataContentUri, params)
            GW->>+BC: transaction;
            BC-->>-GW: txId
        GW-->>-DV: txId

        DV->>+GW: IPFS.put(newJsonMetadata)
            GW-->BC: IPFS.put(newJsonMetadata)
        GW-->>-DV: jsonHash

        DV->>+GW: EntityResolver.set(<br/>entityId, 'vnd.vocdoni.meta',<br/> metadataContentUri)
        GW-->>-DV: txId

    DV-->>-PM: success
```

**Used schemas:**

- [Process Metadata](/architecture/data-schemes/process.html#process-metadata)
- [Census Service addClaimBulk](/architecture/services/census-service.html#addclaimbulk)
- [Census Service getRoot](/architecture/services/census-service.html#getroot)
- [Census Service dump](/architecture/services/census-service.html#dump)

### Voting process retrieval

A user wants to retrieve the voting processes of a given Entity

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    participant App as App user
    participant DV as DVote
    participant GW as Gateway/Web3
    participant BC as Blockchain
    participant IPFS as IPFS

    App->>+DV: Process.fetchByEntity(<br/>entityAddress, resolver)

        DV->>GW: EntityResolver.text(<br/>entityId, "vnd.vocdoni.meta")
            GW->>BC: text(entityId, "vnd.vocdoni.meta")
            BC-->>GW: contentUri
        GW-->>DV: contentUri

        DV->>GW: IPFS.get(jsonHash)
            GW-->IPFS: IPFS.get(jsonHash)
        GW-->>DV: entityMetadata

        loop processIDs

            DV->>GW: getMetadata(processId)
                GW->>BC: getMetadata(processId)
                BC-->>GW: (metadata,<br/> merkleRoot, params)
            GW-->>DV: (metadata,<br/> merkleRoot, params)

            alt Process is active or in the future
                DV->>GW: fetchFile(metadataHash)
                GW->>IPFS: IPFS.get(metadataHash)
                IPFS-->>GW: processMetadata
                GW-->>DV: processMetadata
            end
        end

    DV-->>-App: processesMetadata
```

**Used schemas:**

- [Process Metadata](/architecture/data-schemes/process.html#process-metadata)

### Check census inclusion

A user wants to know whether he/she belongs in the census of a process or not.

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    participant App as App user
    participant DV as DVote
    participant GW as Gateway/Web3
    participant CS as Census Service

    App->>+DV: Census.isInCensus(publicKey, censusId, censusMessagingURI)

        DV->>+GW: genCensusProof(censusId, publicKey)
        GW->>+CS: genProof(censusId, publicKey)
        CS-->>-GW: isInCensus
        GW-->>-DV: isInCensus

    DV-->>-App: isInCensus
```

**Used schemas:**

- [Census Service generateProof](/architecture/services/census-service.html#generateproof)

**Notes:**

- `generateProof` may be replaced with a call to `hasClaim`, for efficiency
- The `censusId` and `censusMessagingURI` should have been fetched from the [Process Metadata](/architecture/smart-contracts/process)

### Casting a vote

A user wants to submit a vote for a given governance process.

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram

    participant App
    participant DV as DVote
    participant GW as Gateway/Web3
    participant CS as Census Service
    participant MP as Mempool

    App->>+DV: Process.castVote(vote, processMetadata, merkleProof?)

        DV->>+GW: genProof(<br/>processMetadata.census.id,<br/> publicKey)

            GW->>+CS: genProof(publicKeyHash)
            CS-->>-GW: merkleProof

        GW-->>-DV: merkleProof

        DV->>DV: computeNullifier()

        alt Encrypted process
            DV->>DV: encrypt(vote,<br/> processMetadata.publicKey)
        end

        alt Anonymous vote
            DV->>DV: generateZkProof(provingK,<br/> verificationK, signals)
        end

        alt Encrypted process
            DV->>DV: encryptVotePackage(<br/>votePackage)
        end

        DV->>GW: submitVoteEnvelope(<br/>voteEnvelope)

            GW->>MP: addEnvelope(voteEnvelope)
            MP-->>GW: ACK

        GW-->>DV: success

    DV-->>-App: success
```

**Used schemas:**

- [Process Metadata](/architecture/data-schemes/process.html#process-metadata)
- [Census Service generateProof](/architecture/services/census-service.html#generateproof)
- [Vote Package](/architecture/smart-contracts/process.html#vote-package)

**Notes:**
- The Merkle Proof could be retrieved and stored beforehand

## After voting

### Checking a Vote Envelope

A user wants to check the status of an envelope by its nullifier.

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    participant App
    participant DV as DVote
    participant GW as Gateway/Web3
    participant VN as Vochain Node

    App->>DV: getEnvelopeStatus(processId)

        DV->>DV: computeNullifier()

        DV->>+GW: getEnvelopeStatus(<br/>processId, nullifier)

            GW-->>VN: getEnvelopeStatus(<br/>processId, nullifier)
            VN-->>GW: status

        GW-->>-DV: status

    DV-->>App: registered
```

### Closing a Voting Process

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    participant PM as Entity Manager
    participant DV as DVote
    participant GW as Gateway/Web3
    participant BC as Blockchain Process

    PM->>DV: Process.endProcess(<br/>processId)

        DV->>+GW: Process.setStatus(<br/>processId, "ENDED")
            GW->>+BC: setStatus(<br/>processId, "ENDED")
            BC-->>-GW: success
        GW-->>-DV: success

    DV-->>PM: success
```

### Vote Scrutiny

Anyone with network access can compute the scrutiny of a given processId. The node can even compute a ZK Rollup proof to let the contract verify the correctness of the provided results on-chain.

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    participant SC as Scrutinizer
    participant DV as DVote
    participant GW as Gateway/Web3
    participant BC as Blockchain
    participant IPFS as IPFS

    SC->>+DV: Process.get(processId)

        DV->>+GW: Process.get(processId)
        GW->>+BC: Process.get(processId)
        BC-->>-GW: (name,<br/> metadataContentUri,<br/> privateKey)
        GW-->>-DV: (name,<br/> metadataContentUri,<br/> privateKey)

    DV-->>-SC: (name,<br/> metadataContentUri)

    SC->>+DV: IPFS.get(metadataHash)

        DV->>+GW: fetchFile(metadataHash)
        GW->>+IPFS: IPFS.get(metadataHash)
        IPFS-->>-GW: processMetadata
        GW-->>-DV: processMetadata

    DV-->>-SC: processMetadata

    SC->>+DV: getEnvelopeNullifiers(<br/>processId)
        loop
            DV->>+GW: Process.getEnvelopeList(<br/>processId)
                GW->>+BC: Process.getEnvelopeList(<br/>processId)
                BC-->>-GW: nullifiers[]
            GW-->>-DV: nullifiers[]
        end
    DV-->>-SC: nullifiers[]

    SC->>+DV: getEnvelopes(nullifiers[])
        loop
            DV->>+GW: Process.getEnvelope(<br/>nullifier)
                GW->>+BC: Process.getEnvelope(<br/>nullifier)
                BC-->>-GW: envelope
            GW-->>-DV: envelope
        end
    DV-->>-SC: envelopes[]


    SC->>SC: sort(merge(<br/>filterValid(envelopes)))
    SC->>SC: resolveDuplicates(<br/>validEnvelopes)

    loop uniqueVotePackages

        SC->>+DV: Proof.check(proof, nullifier, ...)
        DV-->>-SC: valid

    end

    loop validVotes

        alt encrypted process
            SC->>+DV: decrypt(vote.encryptedVote, privateKey)
            DV-->>-SC: voteValue
        end

        SC->>SC: updateVoteCount(<br/>voteValue)
    end

    alt
        SC->>+DV: setResults(<br/>processId, voteCounts)
            DV->>DV: computeZkRollup(<br/>voteCount, params)

            DV->>+GW: Process.setResults(<br/>processId, results, <br/>voteCount, proof)
                GW->>+BC: setResults(<br/>processId, results,<br/> voteCount, proof)
                    BC->>BC: verify(proof)
                BC-->>-GW: success
            GW-->>DV: success
        DV-->>-SC: success
    end

```

**Used schemas:**

- [Process Metadata](/architecture/data-schemes/process.html#process-metadata)
- [Vote Package](/architecture/smart-contracts/process.html#vote-package)


