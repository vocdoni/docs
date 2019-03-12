# Prototype 1

Basic voting implementation with the next restrictions:

  - No decentralized relay
  - Very basic client interface
  - No organizer user interface
  - No identities (just keys)
  - Unit testing not required
  - Documentation not required
  - No optimizations

---

## Flow

#### Vote Manager

1. `Blockchain` --> getProcessById()
2. `Vote` --> getOptions()
3. `<UI input>`
4. `Vote` --> getEncryptedVote()
5. `Vote` --> getEncryptedVoteHash()
6. `Identity` --> getVotingKey()
7. `Census` --> getCensusProof() `Data` --> getExternalData()
8. `Identity` --> getVotingPrivateKey()
9. `Franchise` --> generateFranchiseProof()
10. `Franchise` --> getNullifier()
11. `Relay` --> generatePOW()
12. `Vote` --> getVotingPackage()
13. `Blockchain` --> getRegisterdRelays()
14. `Relay` --> encryptVotingPackage()
15. `Relay` --> sendVote()
16. `Relay` --> getVotesBatchHashByNullifier():votesBatchHash
17. `Data` --> getExternalData(voteBatchHash)
18. `Blockchain` --> batchExists(voteBatchHash)

---

## Interface Calls

+ Local Auth
   - Import @ledfusion's flow


+ Census register
   - **App**: HTTP POST ...../register/0x123445678901234567891234567
   - **Process Manager**:  Handle HTTP POST and add the pubkey to the census DB


+ Process creation
   - **Process Manager**: Get census and generate Merkle tree
   - **dvote-process**: Merkle tree generation (create tree, verify proof)
   - **dvote-process**: Web3 implementation/integration
   - **Process Manager**: Generate priv/pub key for the process (stored locally)
   - **Process Manager**: Publish Merkle Tree (IPFS)
   - **Process Manager**: Generate Process Meta Data (given the name, start block, end block, voting encryption public key and gateway/relay's IP+pubkey)
   - **Process Manager**: Sending creation transaction to the SContract (with Merkle tree root, IPFS Merkle tree hash, meta data)
   - **Smart Contract**: Process creation transaction


+ Vote metadata retrieval
   - **App**: fetch process meta data
   - **dvote-client**: Web3 call getProcessMetadata(id)
   - **App**: Display metadata and options


+ Voting
   - **App**: Request lock pattern and decrypt the private key
   - **App**: Prepare the vote package
   - **dvote-client**: encryptVote(vote, votePubKey)
   - **dvote-client**: hashEncryptedVote(_, privKey)
   - **dvote-client**: generateProof(aboveData)
   - **dvote-client**: getNullifier(privKey, id)
   - **dvote-client**: generatePOW()
   - **dvote-client**: getVotingPackage()
   - **dvote-client**: getRelays()
   - **dvote-client**: encryptRelayPackage(_)
   - **dvote-client**: sendPackage(...)
   - **Relay**: Listen to incoming vote packages
   - **Relay**: Ignore invalid Proofs of work
   - **dvote-relay**:  checkPOW()
   - **Relay**: Get the census
   - **dvote-relay**: decryptVote()
   - **dvote-relay**: checkProof()
   - **Relay**: Batch votes
   - **dvote-relay**: batchVotes([...])
   - **Relay**: Publish batch (IPFS)
   - **Relay**: Send tx to SContract to register the votes batch
   - **dvote-relay**: registerVoteBatch(...)


+ Individual vote verification
   - **App**: Ask for a batch containing the vote
   - **dvote-client**: getVotesBatchHashById() (IPFS)
   - **dvote-client**: getExternalData()
   - **dvote-client**: batchExists(nullifier)
   - **App**: Confirm voting status


+ Voting ends + Results
   - **Process Manager**: Send a vote closing transaction
   - **dvote-process**: closeVote > Call SContract
   - **Smart Contract**: implement closeVote(privateKey)
   - **Process Manager**: Compute official results
   - **dvote-process**: getResultsFromVote(...)
   

![sprint1_diagram](https://github.com/vocdoni/docs/raw/master/img/sprint1.png)
      
