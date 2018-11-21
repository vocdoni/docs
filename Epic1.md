# `Epic 1`: Proof of concept

Please, refer to the draft for references:  
https://github.com/vocdoni/docs/blob/master/README.md

And to the roadmap for context:  
https://github.com/vocdoni/docs/blob/master/Roadmap.md

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

## Sprints/checkpoints
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

## Repositories/ development blocks
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
- Can be done using a test suit (no UI)

1. Local integration
    - Encyrpts mock vote
    - Generates `vote package`

2. External integration (relay/blockchain)
    - Gets and uses `process metadata` from `voting smart-contract`
    - Sends `vote-package` to `relay`
  
### Relay integration

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