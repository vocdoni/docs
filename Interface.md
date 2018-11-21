
# Voting contract
Implements:
getProcessLength(organizationAddress) : int
getProcessByIndex(organizationAddress, index): processId
getProcessMetadataById(organizationAddress, processId): processMetadata


## ProcessMetadata (struct)
censusUrl //Where is the census Merkle-tree
censusRoot //Merkle-root of census
votingOptions //string that has an inmutable reference to the voting options
startBlock
endBlock
voteEncryptionKeys
status

# Modules (domains)
## Indentity
getVotingPublicKey(): Public Key
getVotingPrivateKey: Private key
## Franchise 
getNullifier(privateKey, processId) : nullifierHash
generateProof(privateKey, censusProof, censusRoot, nullifier, processId, encryptedVoteHash) :franchiseProof

## Census
getCensus()
getCensusProof(votingPublicKey)

## Data
getExternalData(url)

## Blockchain
getProcessById(): processMetadata
getOpenProcess(): [processIds]

## Relay
generatePOW(votingPackage): nonce

## Vote
getOptions()
getEncryptedVote(selectedVoteOptions, voteEncryptionKeys)
getHash(encryptedVoteHash)
getVotingPackage(franchiseProof, processId, encryptedVote, nullifier)
## Vote manager (integration)


# Flow
## Vote Manager
`Blockchain` --> getProcessById()
`Vote` --> getOptions()
<UI input>
`Vote` --> getEncryptedVote()
`Vote` --> getEncryptedVoteHash()
`Identity` --> getVotingKey()
`Census` --> getCensusProof()
    `Data` --> getExternalData()
`Identity` --> getVotingPrivateKey()
`Franchise` --> generateFranchiseProof()
`Franchise` --> getNullifier()
`Relay` --> generatePOW()
`Vore` --> getVotingPackage()
