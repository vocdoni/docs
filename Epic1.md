# `Epic 1`: Proof of concept

Please, refer to the draft for references:  
https://github.com/vocdoni/docs/blob/master/README.md

And to the roadmap for context:  
https://github.com/vocdoni/docs/blob/master/Roadmap.md

The goal of this epic is to have a working proof of concept.
This means:
  - No relay network (centralized relay)
  - No user interface
  - No tests (maybe as replacement of the client)
  - No nice code
  - No identities (just keys)
  - No documentation
  - No optimizations
  
It could be divided two steps.
1. (A) Snarks proof creation and validation
1. (B) Voting contract
2. Integration

## Snarks proof creation and validation

### Zk snarks circuit
- Depends on J
- Designed with [Circom](https://github.com/iden3/circom)
- May have its own repository

### Franchise proof
- Depends on the circuit
- Needs to be executed in the client, and the Relay as well
- Should implement
    - createNullifier(processId, privateKey)
    - createProof(privateKey, censusMerkleProof, censusMerkleRoot, nullifier, processId, encryptedVoteHash) : proof
    - validateProof(proof, merkleRoot, nullifier, encryptedVoteHash, processId): bool
- Should NOT implement
    - Vote encryption is not specific to the proof. (could use multiple keys, encryption schemes...)

### Census Merkle-tree generation
- Makes sense to have its own repository, although it relies on the Snarks Circuit implementation
- Takes thousands of public keys.
- Creates a Merkle-tree
- No optimizations (sparse Merkle-trees, streams...)



## Voting smart-contract
- Not need to implement time-frames for now
- Should implement...
    - createProcess(name, voteEncryptionKey)
    - getProcessMetadata(processId):processMetadata
    - AddPackageAgregationHash(agregatedPackagesHash)//eventually should store the sender to know who added it
    - getPackageAgregationHash(index)
    - FinalizeProcess(voteEncryptionKey)
- Should not implement (YET)
    - RegisterRelay // To be defined, likley not needed for now


## Client integration
- Can be done using a test suit (no UI)
- Should
    - Download processMetadata from blockchain
    - Encyrpts mock data vote  
    - Generates VotePackage
    - Sends VotePackage to relay
    - Recieves reciept // TO BE DEFINED, probably not required for now


## Relay integration

- voteAgregationHasn pinning
- validates franchise proof

## Relay devops


- IPFS gateway
- Ethereum node