## A decentralized self sovereign governance system

Vocdoni is a universally verifiable, censorship-resistant and anonymous governance system, designed to be scalable and and easy to use on modest devices. The goal is to provide the foundation to run national elections, general shareholders meetings, assemblies, etc.

Our main aim is a trustless voting system, where people can speak their voice and everything can be audited. We are engineering the building blocks for a permissionless, private and censorship resistant democracy. 

The algorithms, systems and software that we build are intended to be a contribution toward making _violence in these cryptonetworks impossible by protecting users privacy with cryptography_. In particular, our aim is to provide the tools for the political will of network participants to translate outwardly into real political capital, without sacrificing privacy.

## Architecture overview

- **Data integrity** is provided by a programmable Blockchain like [Ethereum](https://ethereum.org/en/), using [Smart Contracts](https://ethereum.org/en/learn/#smart-contracts)
- **Data availability** is provided by decentralized file transfer system like [IPFS](https://ipfs.io/)
- **Messaging** is implemented using a decentralized pool of Gateways, that anyone can run
- **Voting** is handled by a custom blockchain made on top of [Tendermint](https://tendermint.com/)

**Client** apps or browsers do not need to join decentralized networks themselves. They can connect to any of the discoverable Gateways and retrieve data from the smart contracts, IPFS and the voting blockchain, without the need to open P2P connections on their own.

<!-- ![Main architecture](./architecture-main.svg "Main architecture") -->
<div style="padding: 20px; text-align: center;">
        <img src="/img/vocdoni-family.png" alt="Vocdoni Family"/>
</div>

### Election requirements
Organizations maintain a list of public keys from their community, either in a database or in a public ledger. 
The organizer of an election selects the group of people who are eligible to vote. Their public keys are hashed using a [ZK-Snark](https://z.cash/technology/zksnarks/) friendly function (_Mimc7_ or _Poseidon_), added to a **[Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree)** and distributed through a decentralized file system (_IPFS_).

The _Merkle Tree_ is used as the **[Census](/architecture/census)** of the voting process. The [Process Metadata](/architecture/components/process?id=process-metadata-json) is the subject on which people can vote, and it is also distributed through IPFS. 

The census and metadata pointers are submitted to the [Voting smart contract](/architecture/components/process?id=smart-contract) and the parameters of the new vote become carved in stone on the Ethereum blockchain.

### Voting process
Once the process has begun, users can start submitting their votes to the [Voting blockchain](/architecture/components/vochain). In order to enforce uniqueness and anonymity, users wrap their ballot in an envelope using a [Zero-Knowledge Proof (ZK-Snark)](/architecture/protocol/franchise-proof).

The ZK-Snark proof (or Franchise proof) is an easy-to-verify way of proving that a voter belongs to the census Merkle Tree, without revealing the underlying identity. It also allows to prove to any third party that the user has not voted twice.

The custom [Tendermint based blockchain](/architecture/components/vochain) validates the vote envelope and its franchise proof. It stores all valid votes on the public ledger and allows any third party to fetch it and verify its correctness. It is referred to as the Voting Chain (_Vochain_).

A [ballot](/architecture/components/process?id=vote-envelope) contains mainly three parts:

1. Election ID
2. Vote values (encrypted or unencrypted)
3. ZK-proof

Users can submit their ballots to any [Gateway or fullnode](/architecture/components/gateway) on the Voting blockchain, which will broadcast it to the mempool for further validation and eventual inclusion.

This approach allows for future integration with public blockchains via [Substrate](https://substrate.dev/) or [Cosmos](https://cosmos.network/), and thereby enables binding smart contracts to election results. 


---

### Coming next

Get started by checking the [Global Architecture](/architecture/general) section.
