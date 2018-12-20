# `Epic 1`: Proof of concept

Please, refer to the  whitepaper [draft](https://github.com/vocdoni/docs/blob/master/README.md) for therminology  
Check the [roadmap](https://github.com/vocdoni/docs/blob/master/Roadmap.md) for context

## Goals
The goal of this epic is to have a working proof of concept.
This means:
  - No decentralized relay
  - No user interface
  - No identities (just keys)
  - Unit testing not required
  - Documentation not required
  - [No optimizations](https://www.youtube.com/watch?v=4bQOSRm9YiQ)
  
The outcome of this epic should be a clear set of specifications in order to move towars a firs MVP.

## Sprints
It would be the first coordinated development.
 - We don't know each other
 - There will be missing specifications and comunications
 - We will have to find out the best tools for coordination
 - We will have to setup enviroments find tools/libraries/frameworks...
  
So friction and slowness is expected... its ok :)

Taking all the above in consideration, we still should be able to get the first `Proof of Concept` ready!

I suggest two phases of development. The firt one allows to work quite indepently, which I belive will be quite beneficial to start. The second one will be integrate everyting

1. Libraries development 
    - Overall setup: tooling/data schemes/libraraies/ frameworks
    - `Franchise proof` creation and validation
    - `Census tree` generation
    - `Voting smart-contract`
    - Relay setup

2. Integration
    - Client local integration
    External integration
    - Client-Relay integration
    - Relay-Client integration

Below there is a more detail of what to develop

From the specs of this document each of us should generate specific tasks, and put estimated times on each. This is a super boring process but is the only way way can forecast dead-lines as well as organizing the works so no one is too over/under loaded.

## Development blocks
## Snarks proof creation and validation

### Snarks
#### Zk snarks circuit
- Depends on J
- Designed with [Circom](https://github.com/iden3/circom)
- May have its own repository

#### Franchise proof
- Depends on the circuit
- Needs to be executed in the `light-client`, and the `Relay` as well
- Should implement
    - createNullifier(processId, privateKey)
    - createProof(privateKey, censusMerkleProof, censusMerkleRoot, nullifier, processId, encryptedVoteHash) : proof
    - validateProof(proof, merkleRoot, nullifier, encryptedVoteHash, processId): bool
- Should NOT implement
    - Vote encryption is not specific to the proof. (could use multiple keys, encryption schemes...)

#### Census Merkle-tree generation
- Makes sense to have its own repository, although it relies on the Snarks Circuit implementation
- Takes thousands of public keys and creates a Merkle-tree
- No optimizations (sparse Merkle-trees, streams...)

### Voting smart-contract
- Has its own repository
- Should implement...
    - createProcess(name, voteEncryptionKey)
    - getProcessMetadata(processId):processMetadata
    - AddVotesBatch(votesBatchHash)//eventually should store the sender to know who added it
    - getPackageAgregationHash(index)
    - FinalizeProcess(voteEncryptionKey)
- Should not implement (YET)
    - RegisterRelay()
    - Time-frames (start/end blocks)
    - Available `vote options`

### Client integration
- Has its own repository
- Can be done using a test suit (no UI)

1. Local integration
    - Encyrpts mock vote
    - Generates `vote package`

2. External integration (relay/blockchain)
    - Gets and uses `process metadata` from `voting smart-contract`
    - Sends `vote-package` to `relay`
  
### Relay integration
- Has its own repository
1. Relay setup and infrastructure
    - Setup a testnet?
    - Build it into a docker?
    - Setup IPFS
    - Expose IPFS gateway
    - Setup Ethereum node
    - Expose Ethereum RPC
    - Setup testnet
  
2. External integration
    - Recieves `vote package`
    - validates franchise proof
    - Groups `voting packages` and creates `votes batch`
    - Pins `votes batch`
    - Adds `votes batch` to the `voting-smart` contract