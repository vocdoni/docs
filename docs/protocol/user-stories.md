# User stories

### Prior to voting

- Deployment of the Entity and Process smart contracts
- The **organizer** registers an Entity to the blockchain
- The **user** creates a self-sovereign identity on the app
  - Allow to add a second identity
  - Identified by a friendly name
- The **user** restores an identity
	- Import mnemonic
	- Encrypted back up (QR)
	- Lead the user into registering again with the new identity
- The **user** chooses an Entity from a list on the app and subscribes to it
	- Optionally, the Entity can be predefined
- The **user** protects his/her identity with a pattern or a pin
<!-- - The **user** unlocks the app to access the content -->
- The **user** exports an encrypted backup of his/her identity
- The **app** checks the pending actions of the user
	- For every Entity's action on the metadata, it fetches their visibility status
- The **user** performs custom requests to the Entity
	- Sign up
	  - Proove that the user owns the private/public key
	- Submit a picture
	- Make a payment
	- Resolve a captcha
	- Optionally, the organizer:
		- Adds the user to a census
- The **organizer** manages the user registry
	- Reattach the attributes of a public key/account to another one
	- View and edit personal details
	- Add or revoke attributes
	  - When a user's flags are changed, a census update is triggered
- The **organizer** manages the census list
	- Manage a census
		- Publish the censusId + public key to the Entity blockchain
		- Define the filters that a user must satisfy to be in the census
	- Drop a census
- The **organizer** manages public content
  - Create posts
  - Hide posts
- The **user** accesses the public content of the Entity
	- Access the list
	- Access a specific post

### Voting

- The **organizer** starts a voting process
	- Choose the census Id
	- Get the Merkle Root Hash
	<!-- - Publish the Merkle Tree to Swarm -->
	- Publish the process metadata to Swarm
	- Send a transaction to the blockchain with the name and the metadata origin
- The **App user** gets the voting processes of an **Entity**
	- Get metadata, relay list, encryption public key, etc.
- The **App user** checks that he/she is part of a process' census
	- Retrieve true/false
- The **App user** wants to cast a vote
	- Using **ZK Snarks**
		- The app requests the census proof to the **Census Service**
			- The **Census service** replies with the merkle proof
		- The app computes the nullifier
		- The app encrypts the **vote value** and a nonce with the public key of the voting process
		- The app fetches the proving and verification keys and generates the **Zero-Knowledge Proof** that he/she is eligible to cast a valid vote
		- The app generates the **vote package**
		<!-- - ~POW~ -->
		- The app selects a **Relay** among the available ones and encrypts the vote package
		- The app submits the vote package to a **Gateway**
		- The **Gateway** broadcasts the vote package to the Relay's public key
		- The **Relay** receives the **Gateway** message and sends back an ACK message
	- Using **Ring Signatures**
		- The app requests the chunk of census where he/she belongs to the **Census Service**
			- The **Census Service** replies with the public key set
		- The app encrypts the **vote value** and a nonce with the public key of the voting process
		- The app signs the **vote package** with the **Ring Signature**
		<!-- - ~POW~ -->
		- The app selects a **Relay** among the available ones and encrypts the signed vote package
		- The app submits the vote package to a **Gateway**
		- The **Gateway** broadcasts the vote package to the Relay's public key
		- The **Relay** receives the **Gateway** message and sends back an ACK message
- A **Relay** processes an incoming vote package
	- The **Relay** decrypts the vote package
	- The **Relay** checks that none if its batches includes the current nullifier or none of the previous signatures is linked to the  new one
	- The **Relay** checks that the current timestamp is within the start/end blocks
	- If the vote package contains a **ZK Proof**, the **Relay** checks that it is valid
	- If the vote package contains a **Ring Signature**, the **Relay** checks that the signature belongs to the census	
	- The **Relay** adds the vote package into its next batch
- A **Relay** registers a vote batch
	- The **Relay** adds a set of vote packages on Swarm/IPFS
	- The **Relay** broadcasts a blockchain transaction to the **Process** smart contract to register the origin of the current vote batch
  
### After voting

- The **App User** checks that his/her vots is registered
	- The app asks a **Gateway** for the batchId from a transaction including his/her nullifier (ZK Snarks) or signature (Linkable Ring Signatures)
	- The **Gateway** broadcasts the expected Relay
	- If the **Relay** has sent a transaction to the blockchain with the nullifier/signature in a batch, it replies with the batch submission Id and the batch origin. NACK otherwise.
	- The app fetches the value of the given batchId on the Blockchain
	- The app fetches the contents of the Vote Batch on Swarm at the given origin
	- The app checks that the nullifier/signature is indeed registered
- The organizing **Entity** publishes the private key to the blockchain so that the vote count can start and newer batch submissions are rejected
- A **Scrutinizer** does the vote count
	- The **Scrutinizer** fetches the process metadata and the private key
	- The **Scrutinizer** fetches the list of batchId's from the `processAddress` on the Blockchain
	- The **Scrutinizer** fetches the data of every batch registered
	- The **Scrutinizer** ensures that vote batches come from trusted Relays, correspond to the given processAddress and contain votes with the right  `type` of verification
	- The **Scrutinizer** merges the batch votes into a single list
	- The **Scrutinizer** detects duplicate nullifiers or singatures
		- It only keeps the vote submitted in the latest batch
	- On ZK votes:
		- The **Scrutinizer** validates the given ZK Snark proof and checks that the given censusMerkleRoot matches the process' metadata
	- On LRS votes: 
		- The **Scrutinizer** groups the votePackages by their publicKeyModulus
		- For every group, the **Scrutinizer** checks the given ring signature against the rest of the group's votes
	- The **Scrutinizer** decrypts the encrypted vote of the valid votes and computes the sum of appearences of every vote value
		- Any non-valid vote values is considered as a null vote
- The **organizer** broadcasts the results of the voting process and the actual vote values

**Potential alternatives:**
- Let Scrutinizers publish their vote count after staking ether
