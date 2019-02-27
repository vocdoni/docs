# User stories

(Original content [on the wiki](https://github.com/vocdoni/docs/wiki/MVP-v1#user-stories))

`The current contents are a work in progress`

### Prior to voting

- Deployment of the Entity and Process smart contracts
- The **organizer** registers an Entity to the blockchain
- The **user** creates a self-sovereign identity on the app
- The **user** chooses an Entity from a list on the app and subscribes to it
	- Optionally, the Entity can be predefined
- The **user** performs custom requests to the Entity
	- Sign up
	- Submit a picture
	- Make a payment
	- Resolve a captcha
	- Optionally, the organizer:
		- Adds the user to a census
		- Issues a claim

### Voting

- The **organizer** starts a voting process
	- Get the Root Hash of a Census Merkle Tree
	<!-- - Publish the Merkle Tree to Swarm -->
	- Publish the process metadata to Swarm
	- Send a transaction to the blockchain with the name and the metadata origin
- [App] Get the voting processes of an entity
	- Get meta data, relay list, public key, etc
- [App] Verify that the user can vote
	- By now, depending on the Census service (still centralized)
	- Retrieve true/false + merkle proof
  
### After voting

- [App] Generate the vote package
	- Encrypted
	- ~POW~ (not yet)
	- zk Proof
	- Nullifyer
- [App] Send the vote package (PubSub)
- [Relay] Make a batch with N votes
- [Relay] Check incoming vote validity (zkSnark)
- [Relay] Register batch
	- IPFS + Blockchain + PubSub
- [App] Check that the vote is registered
- [Organizer] Vote count and publishing to the blockchain
	- By now, centralized on the Organizer side
	- Anyone else can do it on his/her own
- [App] Get a vote's results via Blockchain
