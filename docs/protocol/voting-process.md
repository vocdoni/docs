# Voting Process

The voting process can be decoupled in three steps.

## Starting a vote
Given the current user database, the organizer builds a census Merkle tree with the public keys that are eligible to vote. 

To start a process, the process metadata is pinned on a decentralized filesystem and a transaction is sent to the blockchain to persist the vote details.

```mermaid
graph TD

OG(<center>Organizer<br/><br/><i class='fa fa-2x fa-user'/></center>)
PM(<center>Process Manager<br/><br/><i class='fa fa-2x fa-desktop'/></center>)
DATA[<center>Swarm or IPFS<br/><br/><i class='fa fa-2x fa-database'/></center>]
BP[<center>Blockchain Process<br/><br/><i class='fab fa-2x fa-ethereum'/></center>]
CS[<center>Census Service<br/><br/><i class='fa fa-2x fa-address-book'/></center>]

OG --> PM

PM -->|fetch census Id's|CS
PM -->|<center>fetch the Merkle<br/>root hash</center>|CS
PM -.-|<center>pin process metatada<br/>+ pin census</center>| DATA
PM --> |send creation transaction| BP

subgraph 
	BP
	DATA
end

```

## Casting a vote (LRS)

Using Linkable Ring Signatures, the user needs the process metadata and the chunk of the census where he or she is grouped. 

After packaging a vote with the LR signature, the client submits the package to a Gateway, which using PSS forwards it to a Relay. 

The Relay then, validates the external payload and groups votes together. When enough votes are ready, it pins the vote batch data on Swarm and finally, it registers the batch on the blockchain. 

```mermaid
graph TD

APP(<center>Voting user<br/><br/><i class='fa fa-2x fa-mobile-alt'/></center>)
DATA[<center>Swarm or IPFS<br/><br/><i class='fa fa-2x fa-database'/></center>]
BP[<center>Blockchain Process<br/><br/><i class='fab fa-2x fa-ethereum'/></center>]
GW[<center>Gateway<br/><br/><i class='fa fa-2x fa-network-wired'/></center>]
PSS[<center>PSS or IPFS<br/>pub sub<br/><br/><i class='fa fa-2x fa-comments'/></center>]
CS[<center>Census Service<br/><br/><i class='fa fa-2x fa-address-book'/></center>]
RL[<center>Relay<br/><br/><i class='fa fa-2x fa-address-book'/></center>]

APP --> |<center>fetch entity <br/>voting processes</center>| BP
APP -->|<center>1 check census inclusion<br/>2 fetch process metadata<br/>3 fetch census chunk<br/>4 submit voting package</center>| GW
GW -->|<center>2 fetch metadata<br/>3 census chunk</center>|DATA
GW -.- |<center>1 check census inclusion<br/>4 forward voting package</center>|PSS
PSS -.-|1 check census inclusion|CS
PSS -.-|4 deliver voting package|RL
RL -.-|pin vote batch data|DATA
RL -->|submit vote batch|BP

subgraph 
	BP
	DATA
	PSS
	RL
end

```

## Process scrutiny

After a process ends, the organizer publishes the private key to decrypt the submitted vote packages. From this moment, any node on the network can start counting and validating votes. 


```mermaid
graph TD

OG(<center>Organizer<br/><br/><i class='fa fa-2x fa-user'/></center>)
PM(<center>Process Manager<br/><br/><i class='fa fa-2x fa-desktop'/></center>)
SC(<center>Scrutinizer<br/><br/><i class='fa fa-2x fa-calendar-plus'/></center>)
DATA[<center>Swarm or IPFS<br/><br/><i class='fa fa-2x fa-database'/></center>]
BP[<center>Blockchain Process<br/><br/><i class='fab fa-2x fa-ethereum'/></center>]


OG -->|publish vote private key|PM
PM -->|publish vote private key|BP
SC -->|<center>get process info<br/>get private key<br/>get batch origins</center>| BP
SC -->|<center>fetch process metadata<br/>fetch census chunks<br/>fetch vote batches</center>| DATA


subgraph 
	BP
	DATA
end

```

