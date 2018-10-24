# VôcDoni

Status of the document: *work in progress*

### A self-soveregnity peer-to-peer voting system

Cryptography and distributed p2p systems have brought a new, revolutionary digital technology which might change the way society organizes: blockchain. Among many other applications, it allows decision making through a secure, transparent, distributed and resilent voting system.

In this document we propose the design, architecture and implementation of a self soveregnity peer-to-peer voting platform using already existing tools, which (most of them) have been tested in a production environment.

### Design basics

+ Secure and anonymous voting using ZK-snarks
+ Use BlockChain as less as possible
+ Use Smart Contracts to manage the system basics
+ User does not need to directly create BlockChain transactions
+ Data availability via distributed filesystems such as IPFS
+ Use static a web page for interacting with the system
+ Incentivate third parties to participate with the system infraestructure

![overall](https://github.com/vocdoni/docs/raw/master/img/overall_design.png)

### Digital identity

As an identity standard Vocdoni uses [Iden3](https://iden3.io).

### Voting process

+ The organizer publish a new election via the Web Frontend

  + Sends a transaction to the Election Smart Contract
  + Publish the list of required claims for voting
  + Generates a Merkle Tree with all identities that can vote and makes it accessible
  + Publish the ID of the election and the Encryption Public key
  + Publish the format and/or list of possible voting options



+ The user sees the new election via the Web Frontend

  + Verifies that he can vote (he/she has the required claims)
  + Generates a random serial number (nullifier)
  + Generates a ZK proof to demostrate he/she is in the identity Merkle Tree
    + Private inputs: {Private Key, MerkleProof}
    + Public inputs: {MerkleRoot, serial number, ID election}
  + Makes its voting choice
  + Encrypts the identity proof and the voting choice with the election Pub Key
  + Generates a Proof of Work (to avoid relay node spaming)
  + Sends the data to a relay node and/or to the pool


+ The p2p relay pool receives the data from the user
  + Relay nodes veriffy the PoW, if not valid the packet is discarted
  + Choose a number of pending votes to relay
  + Creates a Merkle Tree with the chosen pending votes
  + Add the Merkle Tree to IPFS
  + Uploads the Merkle Root and the IPFS hash to the Blockchain


+ Once the election is finished
  + The organizer publishes the private key, so the votes and proofs are available
  + A contract will reward the relay nodes which has contributed to relay and store votes
