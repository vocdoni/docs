# Process Overview

Similarly to an operating system, Vocdoni also **runs processes**. An OS process traditionally starts with a system call to the kernel, requesting the execution of a program with flags and permissions.

A voting process looks familiar. An Ethereum transaction (syscall) is made to the [process smart contract](https://github.com/vocdoni/dvote-solidity#process) (kernel), with parameters that define how the election will behave. The transaction will include metadata, the root of the census and [dozens of flags](https://github.com/vocdoni/dvote-solidity#types-and-values) that allow to run processes with powerful features.

An oracle will relay the transaction with the same parameters (and signature) to the Voting blockchain. At this point, the process has been created on the Vochain and valid votes will be accepted from users who belong to the given census.

From a component's perspective, the system can be decoupled in three stages.

## Process creation

Using one of many [census integration methods](census-overview.md), an organization publishes a Census Merkle Tree containing information about the eligible voters for a process. The organization then creates a process itself by pinning the metadata (including this census) to a decentralized filesystem and sending a transaction to the Voting Blockchain to persist the vote details.

<head>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.css">
</head>

```mermaid
graph TD
OG(<center>Vote organizer<br/><br/><i class='fa fa-2x fa-user'/></center>)
DATA(<center>IPFS data<br/><br/><i class='fa fa-2x fa-database'/></center>)
BP(<center>Process contract<br/><br/><i class='fab fa-2x fa-ethereum'/></center>)
CS(<center>Census Module<br/><br/><i class='fa fa-2x fa-address-book'/></center>)

OG --> |Generate user census|CS
OG -.- |Pin metadata and census|DATA
OG --> |Declare voting process|BP

subgraph Decentralized storage
	BP
	DATA
end
```

## Voting

Users need to fetch the metadata of the process, choose the vote options and generate Merkle Proof to bundle a vote package. If the process is private, clients also need to fetch the public keys to use for vote encryption. If the process is anonymous, the user computes a [Zero Knowledge proof](protocol/anonymous-voting/anonymous-voting.md). 

The client submits a Vote envelope (containing the proof and the voting choices) to one or several Gateways. These are connected to the Vochain P2P network, so Gateways will relay the envelope to the blockchain mempool.

The Vochain nodes and miners validate the Census Merkle Proof or Zero Knowledge Proof. If valid, the vote package is added to the next block and becomes available for computing the results.

```mermaid

graph TD
APP(<center>Voter<br/><br/><i class='fa fa-2x fa-mobile-alt'/></center>)
DATA[<center>P2P Filesystem<br/><br/><i class='fa fa-2x fa-database'/></center>]
GW[<center>Gateway<br/><br/><i class='fa fa-2x fa-network-wired'/></center>]
PSS[<center>P2P Messaging<br/><br/><i class='fa fa-2x fa-comments'/></center>]
VN[<center>Vochain node<br/><br/><i class='fa fa-2x fa-cubes'/></center>]
VM[<center>Vochain Miner<br/><br/><i class='fa fa-2x fa-cubes'/></center>]

APP -->|<center>0 Fetch entity's open processes<br/>1 Fetch process metadata<br/>2 Generate census proof or ZKP<br/>3 Submit voting package</center>| GW
GW -->|Get metadata|DATA
GW --> PSS
PSS -->|Relay voting package|VN
VN -->|Add to mempool|VM
VN -.->|Validate proof<br/>Validate vote package|VN

subgraph P2P communication
	VM
	DATA
	PSS
	VN
end

```

## Results

When an encrypted process ends, encryption keys are revealed by the [Keykeepers](/architecture/services/vochain.html#special-actors) so that scrutiny can take place. From this moment on, any node on the network can start counting and validating votes.

At the same time, an Oracle computes the results and submits them to the Process Smart Contract, so that results become available on-chain. 

:::tip
For results on-chain, an Oracle could compute a Zk-Rollup of process results. This [proposal](/architecture/protocol/rollup.html#zk-rollups-proposal) effectively makes the Oracles trustless components and enables anti-coercive, verifiable and binding  results on the Ethereum mainnet. 

The ZK-Rollups functionality may require heavy computational resources and development time until it is available. For this reason, intermediary approaches like Optimistic Rollups may be implemented first and iterated upon later.
:::

```mermaid
graph TD

VM1[<center>Keykeeper 1<br/><br/><i class='fa fa-2x fa-cubes'/></center>]
VM2[<center>Keykeeper 2<br/><br/><i class='fa fa-2x fa-cubes'/></center>]
VOC[<center>Vochain<br/><br/><i class='fa fa-2x fa-cubes'/></center>]
OC(<center>Oracle<br/><br/><i class='fa fa-2x fa-calendar-plus'/></center>)
GW[<center>Gateway<br/><br/><i class='fa fa-2x fa-network-wired'/></center>]
TP(<center>Third party verifier<br/><br/><i class='fa fa-2x fa-user'/></center>)
PC(<center>Process contract<br/><br/><i class='fab fa-2x fa-ethereum'/></center>)

VM1 -->|Reveal decryption key 1|VOC
VM2 -->|Reveal decryption key 2|VOC
VOC -->|Get private keys|OC
VOC -.->|Get private keys|GW
VOC -.->|Get private keys|TP
OC -->|Publish results|PC

subgraph Vochain
	VM1
	VM2
	VOC
end

subgraph Ethereum
	PC
end

```
