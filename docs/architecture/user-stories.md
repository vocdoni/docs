# User stories

To understand how a decentralized voting process works, we need to define the sequence of actions that are expected to happen.

### Prior to voting

- Vocdoni deploys the [Entity Resolver](/architecture/components/entity?id=entity-resolver) and [Voting Process](/architecture/components/process?id=smart-contract) smart contracts
  - Optionally, other organizations can deploy their own instances
- The **organizer** registers an [Entity](/architecture/components/entity) to the blockchain
- The **user** creates a self-sovereign identity on a mobile app
  - Identified by a friendly name
  - Optionally, he/she created additional identities
- The **user** restores an identity
	- Importing a recovery mnemonic
	- Using an encrypted back up (QR)
- The **user** subscribes to an [Entity](/architecture/components/entity)
	- The [Entity](/architecture/components/entity) could be predefined in the parameters of the app in compile time
	- Entities can also be fetched from a list of boot entities
		- The app gets the default [Entity Resolver](/architecture/components/entity?id=entity-resolver) address and the Entity ID of Vocdoni from `dvote-js`
		- The app fetches the boot entities of Vocdoni and displays them
		- It is also possible to use other instances and fetch the bootnodes of a specific Entity instead
	- The user can also subscribe to an Entity by following a deep link with the [Entity Resolver](/architecture/components/entity?id=entity-resolver) address and the Entity ID
- The **user** protects his/her identity with a visual pattern or a pin
<!-- - The **user** unlocks the app to access the content -->
- The **user** exports an encrypted backup of his/her identity
- The **app** checks the pending actions of the user
	- For every Entity's action on the metadata, it fetches their visibility status
- The **user** performs custom requests with the Entity's backend
	- Sign up
		- Proove that the user owns the private/public key
		- Provide personal information
	- Submit a picture
		- Run a KYC process with a selfie and ID card pictures
	- Make a payment
	- Resolve a captcha
	- Etc.
- Eventually, the **organizer** may add the user to one or more census
- The **organizer** manages the user registry
	- View and edit personal details
	- Manage the attributes of a public key or account
	- Trigger a census update when a user's flags are changed
- The **organizer** manages a certain census
	- Manage a census
		- Define the filters that a user must satisfy to be included in such census
		- Send a transaction to the [Entity Resolver](/architecture/components/entity?id=entity-resolver), stating that the [Census Service](/architecture/general?id=census-service) has to manage a certain Census Id and allowing certain public keys to alter it
	- Dropping census
- The **organizer** manages public content to be consumed on the client app
- The **user** accesses the public content of the Entity
	- Display the entity's details, related organizations, read official content.

### Voting

- The **organizer** starts a voting process
	- Choose the Census Id
	- Get the Merkle Root Hash
	<!-- - Publish the Merkle Tree to Swarm -->
	- On ZK Snarks processes:
		- Push the eligible public keys to the [Census Service](/architecture/general?id=census-service)
	- With Linkable Rring Signatures:
		- Push the eligible public keys to the [Census Service](/architecture/general?id=census-service)
		- Push the settings of the new census so that group modulus can be created (process Id and maximum group size)
		- Get the modulus number and the [Content URI](/architecture/protocol/data-origins?id=content-uri)'s where the [Census Service](/architecture/general?id=census-service) is pinning every [modulus group](/architecture/protocol/franchise-proof?id=_2-create-census-rings)
	- Pin the entire [Process Metadata](/architecture/components/process?id=process-metadata-json) (Swarm, IPFS, etc)
	- Send a transaction to the blockchain with the core data of the process and a [Content URI](/architecture/protocol/data-origins?id=content-uri) to the[ Process Metadata](/architecture/components/process?id=process-metadata-json) file
	- Update the list of voting processes on the [Entity Resolver](/architecture/components/entity?id=entity-resolver) smart contract
- The **App user** fetches the active voting processes of an **Entity**
	- Read the description and review the options to vote
- The **App user** checks that he/she is part of a process' census
- The **App user** casts a vote
	- Using **ZK Snarks**
		- The app requests the census proof to the **[Census Service](/architecture/general?id=census-service)**
			- The **[Census service](/architecture/general?id=census-service)** replies with the merkle proof
		- The app computes the nullifier
		- The app encrypts the **Vote Value** and a nonce with the public key of the voting process
		- The app fetches the proving and verification keys and generates the **Zero-Knowledge Proof** that he/she is eligible to cast a valid vote
		- The app generates the [Vote Package](/architecture/components/relay?id=vote-package-zk-snarks)
		<!-- - ~POW~ -->
		- The app chooses a **Relay** among the available ones
		- The app encrypts the [Vote Package](/architecture/components/relay?id=vote-package-zk-snarks) with the public key of the Relay to get the [Vote Envelope](/architecture/components/relay?id=vote-envelope-zk-snarks)
		- The app submits the [Vote Envelope](/architecture/components/relay?id=vote-envelope-zk-snarks) to a **Gateway**
		- The **Gateway** broadcasts the [Vote Envelope](/architecture/components/relay?id=vote-envelope-zk-snarks) to the Relay's public key
		- The **Relay** receives the **Gateway** message and sends back an ACK message
	- Using **Ring Signatures**
		- The app requests the chunk of census ([modulus group](/architecture/protocol/franchise-proof?id=_2-create-census-rings)) where he/she belongs from the given [Content URI](/architecture/protocol/data-origins?id=content-uri) defined on the metadata
		- The app encrypts the **Vote Value** and a nonce with the public key of the voting process
		- The app signs the [Vote Package](/architecture/components/relay?id=vote-package-ring-signature) with the **Ring Signature**
		<!-- - ~POW~ -->
		- The app chooses a **Relay** among the available ones
		- The app encrypts the signed [Vote Package](/architecture/components/relay?id=vote-package-ring-signature) with the public key of the Relay to get the [Vote Envelope](/architecture/components/relay?id=vote-envelope-ring-signature)
		- The app submits the [Vote Envelope](/architecture/components/relay?id=vote-envelope-ring-signature) to a **Gateway**
		- The **Gateway** broadcasts the [Vote Envelope](/architecture/components/relay?id=vote-envelope-ring-signature) to the Relay's public key
		- The **Relay** receives the **Gateway** message and sends back an ACK message
- A **Relay** processes an incoming [Vote Envelope](/architecture/components/relay?id=vote-envelope)
	- The **Relay** decrypts the [Vote Envelope](/architecture/components/relay?id=vote-envelope) to get the [Vote Package](/architecture/components/relay?id=vote-package)
	- The **Relay** checks that none if its batches includes the current nullifier or none of the previous signatures is linked to the  new one
	- The **Relay** checks that the current timestamp is within the start/end blocks
	- If the [Vote Package](/architecture/components/relay?id=vote-package) contains a **ZK Proof**, the **Relay** checks that the proof is valid
	- If the [Vote Package](/architecture/components/relay?id=vote-package) contains a **Ring Signature**, the **Relay** checks that the signature belongs to the [modulus group](/architecture/protocol/franchise-proof?id=_2-create-census-rings), and the modulus grouop belongs to the census
	- The **Relay** adds the [Vote Package](/architecture/components/relay?id=vote-package) into its next batch
- A **Relay** registers a [Vote Batch](/architecture/components/relay?id=vote-batch)
	- The **Relay** adds a set of [Vote Packages](/architecture/components/relay?id=vote-package) on Swarm/IPFS
	- The **Relay** broadcasts a blockchain transaction to the **Process** smart contract to register the [Content URI](/architecture/protocol/data-origins?id=content-uri) of the current [Vote Batch](/architecture/components/relay?id=vote-batch)
  
### After voting

- The **App User** checks that his/her vots is registered
	- The app asks a **Gateway** for the batchId from a transaction including his/her nullifier (ZK Snarks) or signature (Linkable Ring Signatures)
	- The **Gateway** broadcasts the expected Relay
	- If the **Relay** has sent a transaction to the blockchain with the nullifier/signature in a batch, it replies with the batch submission Id and the batch's [Content URI](/architecture/protocol/data-origins?id=content-uri). NACK otherwise.
	- The app fetches the value of the given batchId on the Blockchain
	- The app fetches the contents of the [Vote Batch](/architecture/components/relay?id=vote-batch) on Swarm at the given [Content URI](/architecture/protocol/data-origins?id=content-uri)
	- The app checks that the nullifier/signature is indeed registered
- The organizing **Entity** publishes the private key to the blockchain so that the vote count can start and newer batch submissions are rejected
- A **Scrutinizer** does the vote count
	- The **Scrutinizer** fetches the [Process Metadata](/architecture/components/process?id=process-metadata-json) and the private key
	- The **Scrutinizer** fetches the list of batchId's from the `processAddress` on the Blockchain
	- The **Scrutinizer** fetches the data of every [Vote Batch](/architecture/components/relay?id=vote-batch) registered
	- The **Scrutinizer** ensures that [Vote Batches](/architecture/components/relay?id=vote-batch) come from trusted Relays, correspond to the given processAddress and contain votes with the right `type` of verification
	- The **Scrutinizer** merges the batch votes into a single list
	- The **Scrutinizer** detects duplicate nullifiers or singatures
		- It only keeps the vote submitted in the latest batch
	- On ZK votes:
		- The **Scrutinizer** validates the given ZK Snark proof and checks that the given censusMerkleRoot matches the one in the [Process Metadata](/architecture/components/process?id=process-metadata-json)
	- On LRS votes: 
		- The **Scrutinizer** groups the [Vote Packages](/architecture/components/relay?id=vote-package) by their [publicKeyModulus](/architecture/protocol/franchise-proof?id=_2-create-census-rings)
		- For every group, the **Scrutinizer** checks the given ring signature against the rest of the group's votes
	- The **Scrutinizer** decrypts the encrypted vote of the valid votes and computes the sum of appearences of every Vote Value
		- Any Vote Value other than the ones defined in the [Process Metadata](/architecture/components/process?id=process-metadata-json) is counted as a **null vote**
- The **organizer** broadcasts the results of the voting process and the actual Vote Values

**Potential alternatives:**
- Let Scrutinizers publish their vote count after staking ether
