# Global architechture

## Service architecture and components

To avoid censorship and to provide resilence, the network architecture should accomplish the following requirements:

+ Do not relay on DNS
+ Do not depend on specific IPs
+ Do not depend on any specific company or cloud infrastructure
+ Use p2p network connections when possible
+ Use static web pages, so they can be replicated
+ Allow third parties to add infrastructure

To this end, the Vocdoni platform is composed by the following components.

![Main arquitechture](./arquitechture-main.png "Main arquitechture")

+ The data integrity is provided by a public BlockChain.

+ The data availability is provided by a distributed filesystem such as Swarm or IPFS.

+ The messaging protocol is provided by a distributed message protocol such as Whisper, IPFS/PubSub or Swarm/PSS.

+ The client interface (APP or WebAPP) interacts with the p2p network and blockchain through one or multiple gateways (using WebSockets or HTTP/RPC). These gateways are neutral/agnostic, so any can be used. All cryptography and/or or security should be done in client side, the only function of the gateways is to forward information.

### Components

#### Relay

The relay pool is the group of nodes which are responsible for processing votes, verify the correctness, publish in the BlockChain and keep the data on the p2p filesystem network.

#### Gateway/Web3
The gateways provide an entry point to the p2p network. They allow the client to communicate with the different services (census, relay, etc.) through a WebSocket or HTTP interface.

#### Census
The server which manages the census of a specific entity. It stores the merkletree with the user claims, allow the manager to administrate it (using asymmetric key signature authentication) and the clients to fetch the merkeltree data.

The Census service is a very critical piece of the whole platform so its real IP/location should be hidden as much as possible. Thus ideally it should be only reachable via the p2p messaging protocol.

#### Census registry webapp
A web page provided by the Entity which will be used to verify a user befored including it into the Census. This web is loaded as a webview from the client APP, once the user chooses to subscribe to a specific Entity. The required steps to pass the verification are up to the Entity.

#### Manager
The server providing the entity organizer web page to manage the census and the elections/processes. This server is is only available by the entity administrators.

----

## Client
`The current contents are a work in progress`

#### dvote-client
`The current contents are a work in progress`

#### Web runtime (for React Native)
`The current contents are a work in progress`

## Relay
`The current contents are a work in progress`

#### Snarks validator
`The current contents are a work in progress`

#### go-dvote
`The current contents are a work in progress`

## Process Manager Service
`The current contents are a work in progress`
## Census Service
`The current contents are a work in progress`
## Blockchain
`The current contents are a work in progress`

#### dvote-smart-contracts
`The current contents are a work in progress`

## IPFS/Swarm
`The current contents are a work in progress`

---

This page is a work in progress.
