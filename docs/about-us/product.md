# Product

Our main products are the [code repositories](https://github.com/vocdoni) that allow for anyone to make use of our work, with or without us :)

Once we have developed a full technical solution, our goal is to materialize it into a platform.

There are four important pieces in the platform.

### Client

- Manages the user's soverign identity
- Executes signing and proof generation locally
- Exists initially in the form of Android and iOs app
- Exists eventually also as a web version
  - To extend accesiblity
  - To prevent potential censor-ship from AppStores
  - To provide more transparent verification mechanisms such as checksums of the code or data
  
### BlockChain

- Used for coordination and data integrity
- Designed to work on top of any Ethereum-like blockchain.
  - It could potentially run on the main-net
  - It could potentially run on a private Ethereum PoA blockchain

### Network

- Peer-to-peer network layer to avoid censorship and to allow network-based privacy
- Provides data availability and messaging
- Most of the network pieces are neutral/agnostic so they might be added by third-parties to avoid dependency on a single entity or group
- Eventually, trustless and fully decentralized with appropriate consensus mechanism and incentive/reward structure

### Process Manager

- Exists as a web tool for organizations
- Manages organization details
  - Customize organization view
  - Create new voting processes
  - Manage the census
  - Provides an interface to link the soverign identities with the organization internal ids.