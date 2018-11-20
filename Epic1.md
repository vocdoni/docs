# `Epic 1`: Proof of concept

Please, refer to the draft for references:  
https://github.com/vocdoni/docs/blob/master/README.md

And to the roadmap for context:
https://github.com/vocdoni/docs/blob/master/Roadmap.md

The goal of this epic is to have a working proof of concept.
This means:
  - No relay (user transacts directly blockchain)
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
The two elements below are tightly coupled.
A single repository to include them all makes sense

## Zk snarks circuit
- Depends on J
- Designed with [Circom](https://github.com/iden3/circom)
- May have its own repository

### Franchise proof
- Depends on the circuit
- Needs to be executed in the client, eventually in the Relay as well
- Vote encryption should be left out of the repo since is not specific of the proof. (could use multiple keys, encryption schemes...)
- Should implement
    - createNullifier(processId, privateKey)
    - createProof(privateKey, censusMerkleProof, censusMerkleRoot, nullifier, processId, encryptedVoteHash) : proof
    - validateProof(proof, merkleRoot, nullifier, encryptedVoteHash, processId): bool
  
- Needs:
    - Process ID (from the voting contract, can be faked)
    - VoteEncryption key (from the voting contract, can be faked)
    - Nullifier
        - ProccessId ( from the contact, can be faked)
        - PrivateKey (can be faked)


## Voting smart-contract
- Not need to implement time-frames
- Should implement...
    - createProcess(name, voteEncryptionKey)
    - AddPackageAgregationHash(agregatedPackagesHash)
    - FinalizeProcess(voteEncryptionKey)

## Census Merkle-tree generation
- Takes thousands of public keys.
- Creates a Merkle-tree
- No optimizations (sparse Merkle-trees, streams...)
- Makes sense to have its own repository
- 
## Integration
- Can be done using a test suit
- It only requires the client
- Can be the start of the light-client repository