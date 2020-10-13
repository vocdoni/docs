# Global architecture

Digital voting processes represent a great social and tech challenge. An official binding vote with standard requirements should at least be able to:

+ Enforce vote anonimity
+ Rely on an opensource platform
+ Be 100% transparent, auditable and verifiable
+ Use uncensorable communication channels
+ Ensure that voters from a census can only vote once without revealing anyone's identity

Vocdoni defines an open architecture and the protocols to empower large communities to exercise full democracy with the aforementioned guarantees. 

A functional implementation of Vocdoni will typically involve two types of services. 

**Decentralized**: A public Ethereum blockchain, Gateways, Census Service, voting blockchain Miners, Oracles, and decentralized storage systems<br/>
**Private**: Private custom services so that Entities can maintain a census of users (with personal data that should not be disclosed)

## Service architecture

To provide resilence and avoid any kind of censorship, the network architecture should accomplish the following requirements:

+ Do not depend on any specific company or cloud infrastructure
+ Do not depend on specific IPs
+ Do not rely on DNS
+ Use P2P network connections when possible
+ Use static web pages, so they can be replicated
+ Allow third parties to contribute to the infrastructure

### Key components
A voting process makes use of the following components:

<!-- ![Main architecture](./architecture-main.svg "Main architecture") -->
<div style="padding: 20px;">
	<img src="/img/architecture-main.png" alt="Main architecture"/>
</div>

- Mobile app users create a key pair (identity) an sign up to the Registry DB of an organization
- The Registry DB creates a Merkle Tree with a snapshot of the census and publishes it through IPFS
- Voting processes are declared on an Ethereum Smart Contract
	- It acts as the source of truth and contains pointers to the metadata, census root and parameters defining how a process should behave
- Metadata is obtained from distributed filesystems like IPFS or similar
	- If at least one peer of the network has the requested data, everybody can have access to it
- Requests and P2P messaging are handled by Gateways
	- They provide access to Web3, File, Census and Vote operations on HTTP/WS
	- Any third party can run an instance of his own
- Mobile or web clients
	- Can interact with P2P services without joining the network as a peer
	- Can interact with (private) organizations to sign up and be part of its census
- Election processes are handled in a Proof-of-Authority Blockchain
	- Voting anonymity is achieved using ZK-Snarks
	- Multiple voting is prevented using deterministic nullifiers
- Gateways are a neutral piece, since cryptography is used on the peer side
	- The only intent of a Gateway is to act as a P2P proxy for clients that can't open sockets by themselves (web browsers)
