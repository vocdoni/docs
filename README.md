# VôcDoni

Status of the document: *work in progress*

### A self-soveregnity peer-to-peer voting system

Cryptography and distributed p2p systems have brought a new, revolutionary digital technology which might change the way society organizes: blockchain. Among many other applications, it allows decision making through a secure, transparent, distributed and resilent voting system.

In this document we propose the design, architecture and implementation of a self soveregnity peer-to-peer voting platform.

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

1. The organizer publish a new election via the Web Frontend

  + Sends a transaction to the Election Smart Contract
    - The funds sent in the transaction will be used for paying the Relay Nodes
  + Publish the list of required claims for voting
  + Generates a Merkle Tree with all identities that can vote and makes it accessible
  + Publish the ID of the election and the Encryption Public key
  + Publish the format and/or list of possible voting options


2. The user sees the new election via the Web Frontend

  + Verifies that he can vote and gets the Election ID (common for everyone)
  + Generates the nullifier and a random number
  ```
  Nullifier: Hash( election_id + priv_key )
  ```
  + Makes its voting choice and encrypts it with the Organization Pub Key
  ```
  Vote = Encrypt(vote_choice + Random)
  ```
  + Generates a ZK proof to demostrate he/she is in the identity Merkle Tree  
  ```
      -> private input: Private Key, MerkleProof
      -> public input: MerkleRoot, Nullifier, Election ID, Vote

      <- output: Zk-Snark Proof of identity
  ```

  + Generates a Proof of Work (to avoid relay node spaming)

  + Sends the data to the relay voting pool:
      ```
     - Zk-snark proof
     - Vote
     - Nullifier
     - Proof-of-Work nonce
     ```

3. The p2p relay pool receives the data from the user
  + Relay nodes veriffy the PoW, if not valid the packet is discarted
  + Choose a set of pending votes to relay
  + Checks the ZK-snark proof and checks the vote is not already processed
  + Creates a Merkle Tree with the chosen pending votes
  + Add the Merkle Tree and the data to IPFS
  + Uploads the Merkle Root and the IPFS hash to the Blockchain
  + Keep the data until the end of the election


4. Once the election is finished
  + The organizer publishes the private key, so the votes and proofs are available
  + A contract will reward the relay nodes which have contributed to relay and store votes
