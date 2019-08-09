## A decentralized self sovereign governance system

Vocdoni is a universally verifiable, censorship-resistant, and anonymous self sovereign governance system, designed with the scalability and ease-of-use to support national elections.

Our main aim is a trustless voting system, where anyone can speak their voice and where everything can be audited. We are engineering building blocks for a permissionless, private and censorship resistant democracy. 

We intend the algorithms, systems, and software that we build to be a useful contribution toward making _violence in these cryptonetworks impossible by protecting users privacy with cryptography_. In particular, our aim is to provide the necessary tooling for the political will of network participants to translate outwardly into real political capital, without sacrificing privacy.

## Architecture overview

Data integrity is provided by an Ethereum like Blockchain, data availability is provided by IPFS/Swarm, and p2p messaging is implemented using the distributed messaging protocol Swarm/PSS. The client interface (app or web app) interacts with the P2P network and the Blockchain through Gateways (using WebSockets or HTTP/RPC).

Each organization maintains a list of public keys from their potential voters, either in a database or in a public ledger. Before starting a voting process, the organizer collates a list of those keys belonging to eligible voters. To begin a new process, the organizers derive a single-use public key for each voter based on a process nonce and the original public key. These single-use keys are organized into a Merkle tree. This data structure, referred to as a census, is distributed trough a decentralized filesystem and the process metadata (including the Merkle root of the census, and a process public key for vote encryption) is published on the blockchain.

Once the process has begun, users can vote. In order to satisfy uniqueness and anonymity requirements, each user wraps their ballot in an envelope using either a Zero-Knowledge Proof (ZK-Snark).

The ZK-Snark proof (or Franchise proof) is an easy-to-verify method for proving the eligibility of a voter without revealing their identity. The method allows a user to convince a third party verifier that it belongs in the census and it has not voted twice, without revealing any information about the voter or the vote itself.

A custom Tendermint based blockchain is responsible for validating the vote envelope, for storing and accounting cast ballots. This is referred to at the Voting Chain (_Vochain_). A ballot is mainly composed of three parts:

1. election/process ID
2. encrypted vote content
3. ZK-proof

The user can submit their ballot to any Gateway/fullnode on the Voting Chain blockhain, which will broadcast it to the mempool for validation and inclusion. This approach allows for integration with public blockchains via Substrate or Cosmos, and thereby for binding smart contracts to vote outcomes. 

---

Get started by checking the [Global Architecture](/architecture/general) section.
