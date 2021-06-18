# User stories

To see how a decentralized election works, let's see the sequence of actions that need to take place.

### Prior to voting

- Vocdoni deploys the [smart contracts](https://github.com/vocdoni/dvote-solidity#contracts) to Ethereum
- The **organizer** registers an [Entity](/architecture/smart-contracts/entity-resolver) to the blockchain
	- The metadata of the entity is pinned on IPFS
	- The reference is declared on the ENS resolver of the entity
- The **app user** creates a self-sovereign identity on a mobile app
- The **app user** imports an identity (optional)
	- Importing a recovery mnemonic
	- Using an encrypted back up
- The **app user** visits an [Entity](/architecture/smart-contracts/entity-resolver)
	- The user can open a deep link or scan a QR code
- The **app user** protects the identity
	- Using a visual pattern or pin
	- Using biometric authentication
- The **app user** unlocks an identity
- The **app user** exports an encrypted backup of his/her identity
- The **app** checks the pending actions of the user
	- For every Entity's action on the metadata, it fetches their visibility status
<!-- - The **app user** performs custom requests with the Entity's backend -->
<!--	 - Sign up -->
<!--		 - Prove that the user owns the private/public key -->
<!--		 - Provide personal information -->
<!--	 - Submit a picture -->
<!--		 - Run a KYC process with a selfie and ID card pictures -->
<!--	 - Make a payment -->
<!--	 - Resolve a captcha -->
<!--	 - Etc. -->
- The user registers to an organization and the public key is stored on its DB
	- By receiving an email with a one time password
	- By scanning a one time QR code
- The **organizer** manages the user registry
- The **organizer** creates a census snapshot at a given point in time
	- A set of internal filters determine what members will be included in the snapshot
- The **organizer** manages public content to be consumed on the client app
- The **App user** views the public content of the Entity
	- Display the news feed, voting processes, etc.

### Voting

- The **organizer** creates a voting process
	- Select the census snapshot to use
	- Get the census Merkle Root
	- Pin the Merkle Tree on IPFS or similar
	- Push the eligible public keys to the [Census Service](/architecture/services/census-service)
	- Pin the [Process Metadata](/architecture/data-schemes/process) on IPFS
	- Send a transaction to the process smart contract, including [Content URI](/architecture/protocol/data-origins?id=content-uri)'s pointing to the [Process Metadata](/architecture/data-schemes/process) and the [Census Merkle Tree](/architecture/census-overview), along with the rest of parameters
	- Update the list of voting processes on the [ENS Resolver](/architecture/smart-contracts/entity-resolver?id=entity-resolver) contract for the entity
- The **app user** fetches the active processes of an **Entity**
	- Read the description and review the options to vote
- The **app user** checks that the identity is part of the process' census
- The **app user** casts a vote
	- The app requests a proof to the **[Census Service](/architecture/services/census-service)**
		- The **[Census service](/architecture/services/census-service)** replies with the census Merkle proof if the public key belongs to it
	- The app computes the user's nullifier for the vote
	- The app generates the [Vote Package](/architecture/smart-contracts/process?id=vote-package-zk-snarks) with the election choices
	- On encrypted processes:
		- The app fetches the encryption public keys to the **Gateway**
		- The app encrypts the [Vote Package](/architecture/smart-contracts/process?id=vote-package-zk-snarks) with the public keys of the voting process
	- On anonymous processes:
		- The app fetches the proving and verification keys and then generates the **Zero-Knowledge Proof**
		- The ZK Proof proves that:
			- The voter knows a private key, whose public key belongs to the census
			- The provided nullifier matches the current process ID and the user's private key
	<!-- - ~POW~ -->
	- The app generates the [Vote Envelope](/architecture/data-schemes/process?id=vote-envelope-zk-snarks)
	- The app selects a **Gateway** among the available ones and submits the [Vote Envelope](/architecture/data-schemes/process?id=vote-envelope-zk-snarks)
	- The **Gateway** submits the [Vote Envelope](/architecture/data-schemes/process?id=vote-envelope-zk-snarks) to the mempool of the Vochain
- A **Vochain miner** processes an incoming [Vote Envelope](/architecture/data-schemes/process?id=vote-envelope)
	- The **Vochain miner** checks that the current block is within the process start/end blocks
	- The **Vochain miner** checks that the given nullifier has not been used before
	- If the process is anonymous:
		- The **Vochain miner** checks that the **ZK Proof** of the [Vote Envelope](/architecture/data-schemes/process?id=vote-envelope) is valid
	- If the process is not anonymous
		- The **Vochain miner** checks that the **Merkle Proof** of the [Vote Envelope](/architecture/data-schemes/process?id=vote-envelope) matches the vote signature and the Merkle root
	- The **Vochain miner** adds the [Vote Envelope](/architecture/data-schemes/process?id=vote-envelope) to the next block

### After voting

- The **app User** checks that their vote is registered
	- The app asks a **Gateway** for the envelope status of his/her nullifier
- The **organizer** ends the process
	- The **organizer** sends a transaction to the process contract and sets the state of the process as ended
	- An oracle relays the transaction to the Vochain
	- Further envelope submissions are rejected
	- On encrypted processes:
		- Miners create a transaction revealing their private key for the process
- The process end block is reached
	- An oracle sends a transaction to the Vochain to signal that a process has ended
	- Further envelope submissions are rejected
	- On encrypted processes:
		- Miners create a transaction revealing their private key for the process
- An **observer** computes the results
	- The **observer** fetches the [Process Metadata](/architecture/data-schemes/process) from the process contract and IPFS
	- On encrypted votes, the **observer** requests the encryption private keys to the **Gateway**
	- The **observer** fetches all the [Vote Envelopes](/architecture/data-schemes/process?id=vote-envelope) registered for the process
	- The **observer** checks their ZK Proofs or Merkle Proofs, the [Vote Package](/architecture/smart-contracts/process?id=vote-package-zk-snarks) contents and the restrictions imposed by the process flags
	- On encrypted votes, the **observer** decrypts the [Vote Package](/architecture/smart-contracts/process?id=vote-package-zk-snarks)
	- The **observer** counts the number of appearances of every single vote value
		- Any vote value beyond the ones defined in the [Process Metadata](/architecture/data-schemes/process) is discarded
- An **observer** publishes the vote results
	<!-- - The **observer** deposits an amount as stake to the contract -->
	- An **observer** computes the results on its own
	- The **observer** computes a ZK Rollup, proving that the given results have been correctly computed from valid vote envelopes and that the results include the choices of `N` valid voter
	- The **observer** submits a transaction to the process smart contract, including the results and the ZK Rollup proof of the computation results
- For some reason, the **observer** skips counting valid votes
	<!-- - A **third party** deposits an amount of stake higher than the one of the observer -->
	- The **third party** computes the results including all valid votes available
	- The **third party** submits a transaction to the process contract, including a higher vote count that the one currently available
	- The contract validates the proof and updates the results
	<!-- - The contract validates the proof, updates the results and the stake of the **observer** is slashed -->
- Process results settlement
	- After a period of time, nobody else submits result transactions with higher vote counts
	- Results become final


