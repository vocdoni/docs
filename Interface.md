
# Smart contracts

## Voting contract
+ getProcessLength(organizationAddress) : int
+ getProcessByIndex(organizationAddress, index): processId
+ getProcessMetadataById(organizationAddress, processId): processMetadata

---

# Data structs

## ProcessMetadata
+ censusUrl //Where is the census Merkle-tree
+ censusRoot //Merkle-root of census
+ votingOptions //string that has an inmutable reference to the voting options
+ startBlock
+ endBlock
+ voteEncryptionKeys
+ status
+ trustedGateways

## VotingPackage
+ FranchiseProof
+ EncryptedVote
+ Nullifier
+ ProcessID

---

# Modules

## Indentity
+ getVotingPublicKey(): Public Key
+ getVotingPrivateKey: Private key

## Franchise 
+ getNullifier(privateKey, processId) : nullifierHash
+ generateProof(privateKey, censusProof, censusRoot, nullifier, processId, encryptedVoteHash) :franchiseProof

## Census
+ getCensus()
+ getCensusProof(votingPublicKey)

## Data
+ getExternalData(url)

## Blockchain
+ getProcessById(): processMetadata
+ getOpenProcess(): [processIds]
+ getRegisterdRelays(): [relayPublicKeys]
+ batchExists(voteBatchHash): bool

## Relay
+ generatePOW(votingPackage): powNonce
+ encryptVotingPackage(votingPakage, relayPublicKey)
+ sendVote(gatewayIP, votingPackage, powNonce)
+ getVotesBatchHashByNullifier(nullifier)

## Vote
+ getOptions()
+ getEncryptedVote(selectedVoteOptions, voteEncryptionKeys)
+ getHash(encryptedVoteHash)
+ getVotingPackage(franchiseProof, processId, encryptedVote, nullifier) : votingPackage

---

# Flow

## Vote Manager

1. `Blockchain` --> getProcessById()
2. `Vote` --> getOptions()
3. <UI input>
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

