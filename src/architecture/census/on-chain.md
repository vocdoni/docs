# On-Chain Census

There are two types of census origins: Those who depend on a list of public keys maintained off-chain and those dependent on the status of the Ethereum blockchain at a given point in time.

The second case, referred to as an on-chain census, enables the weighted set of eligible voters for a process to be derived from the token holder balances for some ERC-20 Ethereum token. This is possible through the use of [Ethereum Storage Proofs](../smart-contracts/storage-proofs.md).

### ERC-20 Token Storage Proofs

Each Ethereum account has its own Storage Trie, which is where all of the contract data lives for that account. A 256-bit hash of the storage trie’s root node is stored as the storageRoot value in the global Ethereum state trie. In the context of storage proofs, we are concerned with ERC-20 Token Smart Contract accounts, whose Storage Tries contain the list of token balances of each token holder. 

A storage proof is a Merkle Proof computed on this storage trie. For the scope of this proposal, the storage proof allows anyone to demonstrate the balance of a token holder for a given ERC-20 token, at a specific State Root Hash (Ethereum block). In other words, we can cheaply generate a proof of any user's balance of a token, and this proof can be used in a Vocdoni voting census.  

### Token Registration

Before starting an election, the target token needs to be registered to the Token StorageProof Smart Contract. Any token holder can register the token by providing a valid storage proof.

In order to create a storage proof, on a mapping-based ERC20 contract, the `index slot` must be found. This depends on the contract implementation and refers to the storage layout of the Ethereum EVM. Most of the `index slots` are between 1 and 10. 

The user registering a new token must first try to find the index slot. To this aim, a web-frontend and a typescript library will be available. Once the index slot is found, the user must send a transaction to the Token StorageProof SC indicating the `index slot` and providing the Merkle proof that demonstrates the index slot and their possession of the token. 

### Election creation

When a token holder wants to create a process with an on-chain census origin, they must send a transaction to the Vocdoni Smart Contract with the election process details, including the token contract address for which the process is being created. 
The Smart Contract will check if the sender holds some minimum threshold tokens on the ERC20 contract address. 

### Voting

In order to cast a vote, each user needs to fetch their Census Merkle Proof. The client connects to a Web3 endpoint and uses the RPC call `eth_getProof` to retrieve this proof.

Once the user decides to cast a vote, a package will be forged containing the census proof, vote choice (represented as an array of integers) and signature (using Metamask).

The transaction of sending a vote is as follows:

```json
eth_getProof{ 
  "type":"vote",
  "processId": "0x47384...",
  "weight": "0x123",
  "proof": "MerkleProof",
  "votePackage": "base64encoded vote package",
  "signature": "signature performed with the privkey that computes the address"
}
```

The vote will be considered valid only if the signature computes an Ethereum address for which the provided Merkle proof and its weight (balance) is valid for the census root hash (Ethereum storage root) at the height of the process start block.

The storage proofs contract acts as a registry which allows token holders to prove that they held funds at a given point in time and therefore are eligible voters for a process.