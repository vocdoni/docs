# Process overview

From a component's perspective, the system can be decoupled in three stages.

## Creating a process

Given the current user database, the organizer builds a census Merkle tree with the public keys that are eligible to vote. 

To start a process, the process metadata is pinned on a decentralized filesystem and a transaction is sent to the blockchain to persist the vote details.

```mermaid
graph TD

APP(<center>Voting user<br/><br/><i class='fa fa-2x fa-mobile-alt'/></center>)
CR[<center>Census Registry<br/><br/><i class='fa fa-2x fa-users-cog'/></center>]
OG(<center>Organizer<br/><br/><i class='fa fa-2x fa-user'/></center>)
PM(<center>Entity Manager<br/><br/><i class='fa fa-2x fa-desktop'/></center>)
DATA[<center>Swarm or IPFS<br/><br/><i class='fa fa-2x fa-database'/></center>]
BP[<center>Blockchain Process<br/><br/><i class='fab fa-2x fa-ethereum'/></center>]
CS[<center>Census Service<br/><br/><i class='fa fa-2x fa-address-book'/></center>]

APP --> | registers| CR
OG --> PM
CR --> PM
PM --> CR
PM --> |export census|CS
PM -.- |add process metatada and census hash|DATA
PM --> |create voting process|BP

subgraph 
	BP
	DATA
end
```

## Casting a vote

The user needs the Entity process metadata and its Merkle Proof to generate the vote package. 

If the process is private the Entity will publish a temporary election public key to encrypt the vote.

After fetching all the required data, the user generates a Zero Knowledge proof that will demostrate he belongs to a census. 

The client submits the Zero Knowledge proof and its voting choise to one or several Gateway(s).

Gateways are connected to the Vochain P2P network, which is a specific blockchain only for casting votes. Thus the Gateway will forward the voting package to the mempool.

The Vochain nodes and miners then, validate the Zero Knowledge proof. If valid, the vote package is stored in the Vochain and will be accounted on the results phase.

```mermaid
graph TD

APP(<center>User APP<br/><br/><i class='fa fa-2x fa-mobile-alt'/></center>)
DATA[<center>p2p Filesystem<br/><br/><i class='fa fa-2x fa-database'/></center>]
BP[<center>Blockchain Process<br/><br/><i class='fab fa-2x fa-ethereum'/></center>]
GW[<center>Gateway<br/><br/><i class='fa fa-2x fa-network-wired'/></center>]
PSS[<center>p2p Transport Layer<br/><br/><i class='fa fa-2x fa-comments'/></center>]
CS[<center>Census Service<br/><br/><i class='fa fa-2x fa-address-book'/></center>]
RL[<center>Vochain node<br/><br/><i class='fa fa-2x fa-cubes'/></center>]

APP --> |<center>0 Fetch entity <br/>open processes</center>| GW
APP -->|<center>1 Fetch process metadata<br/>2 Get census proof<br/>3 Generate Zero Knowledge<br/>4 Submit voting package</center>| GW
GW -->|<center>Get metadata</center>|DATA
GW -.- PSS
PSS -.-|Get/Check census proof|CS
PSS -.-|Deliver voting package|RL
RL -->|Register checkpoint|BP

subgraph 
	BP
	DATA
	PSS
	RL
	CS
end

```

## Process scrutiny

After a process ends, the organizer publishes the private key to decrypt the submitted vote packages (if any) in Ethereum.  From this moment, any node on the Vochain network can start counting and validating votes. However an Oracle will act as scrutinizer and publish the results to Ethereum so the users can quickly see them (if they trust the Oracle).


```mermaid
graph TD

OG(<center>Organizer<br/><br/><i class='fa fa-2x fa-user'/></center>)
PM(<center>Process Manager<br/><br/><i class='fa fa-2x fa-desktop'/></center>)
SC(<center>Oracle<br/><br/><i class='fa fa-2x fa-calendar-plus'/></center>)
DATA[<center>Vochain<br/><br/><i class='fa fa-2x fa-cubes'/></center>]
BP[<center>Ethereum<br/><br/><i class='fab fa-2x fa-ethereum'/></center>]


OG -->|Publish vote private key|PM
PM -->|Make transaction to smart contract|BP
BP -->|<center>Get private key</center>| SC
DATA -->|<center>Fetch process data <br/>and decypt votes</center>| SC
SC -->|Write results| BP

subgraph 
	BP
	DATA
end

```

