# Voĉdoni

Status of the document: *work in progress*

## A fully verifiable decentralized anonymous voting system

Cryptography and distributed p2p systems have brought a new, revolutionary digital technology which might change the way society organizes: blockchain. Among many other applications, it allows decision making through a secure, transparent, distributed and resilent voting system.

In this document we propose the design, architecture of a decentralized anonymous voting platform using decentralized identities.

## Overview

We want to bring decentralized voting to mass adoption. This requires a solution that has a user experience at the level of current centralized solutions.

+ Minimize transactions to the blockchain 
+ Voter does not need to interact with the blockchain
+ Secure and anonymous voting using ZK-snarks
+ Data availability via distributed filesystems such as IPFS
+ Use static a web page or APP for interacting with the system
+ Incentivate third parties to participate (relays) by adding a reward system

![overall](https://github.com/vocdoni/docs/raw/master/img/overall_design.png)

## Identity
The system is agnostic to the identity scheme used.

We are developing our implementation using [Iden3](https://iden3.io), for having the best blance of decentralization vs scalability.

##Players
### Actors
`Voter`
+ A `voter` is the end user that will vote
+ Its digital representation we call it `identity`
+ Inside the voting process is identified by a public key
+ Can interact manage all interactions through a light client (web/app)

`Organizer`
+ The user or entity that creates and manages an especific voting process
+ Needs to interact with the blockchain
+ Pays for the costs of a process
+ Has the highest interest for the process to success

`Relay`
+ Is used as a proxy between the `voter` and the blockchain
+ Is a selfish actor. Good behaviour is ensure through economic incentives
+ Develops functions that would not be possible on a light client
  - It relays voting transactions to other relays
  - It aregates voting transactions and adds them into the blockchain
  - It validates zk-snarks proofs
  - It ensures data aviability on IPFS

### Elements
`Census Tree`
+ A Merkle-tree made of the public keys of all the `voters`
+ The Merkle-root is hosted in the blockchain as a proof the cenus
+ The tree needs to be publicly available (IPFS) for everyone to verify it

### Voting process
1. `Identity` creation
  + Before the process in itself starts `voters` must have their digital identity  already created
  + The unique requirement for the those identities is that they need to be represented by a public key.
  + The system is agnostic to the identity system used but an integration will be required for each of them.

1. The `organizer` generates a census
  + This first design iteration, assumes that the `organizer` has a list of all the `voters`
  + It agregate all the public keys of the `voters` and generates the `census merkle tree`
  + The `census merkle tree` will be used for the zk-snarks circuit to 

2. The `organizer` publishes a new voting process.
  + Via a user interface fills-up the required meta data regarding a voting process.
  + Sends a transaction to the `Voting Smart Contract`
    - The transaction includes the metadata, and makes it public for the rest other players
    - The funds sent in the transaction will be used for paying the Relay Nodes
    - The amount sent is proportional to the needs of the process (number of participants, relay redundancy...)
  + Publish the list of required claims for voting
  + Generates a Merkle Tree with all public keys that can vote and makes it accessible (IPFS?)
  + Publish to the Election Smart Contract the following information:
    + Merkle Root Census
    + IPFS hash Census
    + Election ID
    + Duration (#blocks)
    + Encryption PubKey
    + Voting Options
    + Funds

2. The user wants to vote in the new election

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
  + Relay nodes veriffy the PoW and the Zk-snarks proof, if not valid the packet is discarted
  + Choose a set of pending votes to relay
  + Aggregate the votes from several voters in a single packet of data
  + Add the aggregated data to IPFS
  + Upload the IPFS hash to the Blockchain (Ethereum)
  + Keep the data until the end of the election


4. Once the election is finished
  + The organizer publishes the private key, so the votes and proofs are available
  + The organizer checks the votes and validate the relay operation
  + Relay nodes will be rewarded according their contribution

![voting_process](https://github.com/vocdoni/docs/raw/master/img/voting_process.png)
