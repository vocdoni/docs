# Global architecture

Digital voting represents a great social and technological challenge. An official binding vote with standard requirements should at least be able to:

+ Enforce vote anonymity
+ Rely on an open source platform
+ Be 100% transparent, auditable and verifiable
+ Use censorship-resistant communication channels
+ Ensure that voters from a census can only vote once, without revealing anyone's identity
+ Process tens of thousands of vote transactions per minute

Vocdoni defines an open architecture and the protocols to empower large communities to exercise full democracy with the aforementioned guarantees. 

A functional implementation of Vocdoni relies mainly on a set of **Decentralized** services: A public Ethereum blockchain, Gateways, Census Service, voting blockchain Miners, Oracles, and decentralized storage systems<br/>


The core voting protocol can be extended to include user management with a set of **Private** services: A private database that Entities can use to maintain a census of users (with personal data that should not be disclosed)

## Service architecture

To provide resilience and avoid any kind of censorship, the network architecture should accomplish the following requirements:

+ Do not depend on any specific company or cloud infrastructure
+ Do not depend on specific IPs
+ Do not rely on DNS
+ Use P2P network connections when possible
+ Use static web pages, so they can be replicated
+ Allow third parties to contribute to the infrastructure

### Key components
A voting process makes use of the following components:

<div style="padding: 20px; background-color: white;">
	<img src="https://raw.githubusercontent.com/vocdoni/design/main/docs/main-architecture.svg" alt="Main architecture"/>
</div>

- A Merkle Tree is generated with a snapshot of the census and published to IPFS. The census can be generated in one of many ways, including:
  - Mobile app users create a key pair (self-sovereign identity) and sign up to a Registry DB for an organization with their public key. Users in the registry can be filtered on different attributes, and their public keys are included in the Merkle Tree. Users can prove their census inclusion with the private key they own. 
  - The organization creates a CSV spreadsheet containing voter information (i.e. name, ID number, etc). This information is encrypted to create a key pair for each eligible user, the public key of which is added to the Merkle Tree. Web client users can enter their correct information to ephemerally generate their one-time private key and prove census inclusion.
- Voting processes are declared on an Ethereum Smart Contract
	- This acts as the source of truth and contains pointers to the metadata, census root and parameters defining how a process should behave
- Metadata is obtained from distributed filesystems such as IPFS
	- If at least one peer of the network has the requested data, everybody can have access to it
- Requests and P2P messaging are handled by Gateways
	- These provide access to Web3, File, Census and Vote operations on HTTPS/WSS
	- Any third party can run an instance of their own
- Mobile or web clients
	- Can interact with P2P services without joining the network as a peer
	- Can interact with (private) organizations to sign up and be part of their census
- Election processes are handled on a Proof-of-Authority Blockchain
	- Voting anonymity is achieved using ZK-Snarks
	- Multiple voting is prevented using deterministic nullifiers
- Gateways are trustless, since cryptography is used on the peer side
	- The only intent of a Gateway is to act as a P2P proxy for clients that can't open sockets by themselves (web browsers)

