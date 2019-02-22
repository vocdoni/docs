# User stories

(Original content [on the wiki](https://github.com/vocdoni/docs/wiki/MVP-v1#user-stories))

`The current contents are a work in progress`

### Prior to voting

- [Organizer] Register an entity to the blockchain
	- Smart Contract with entity's (@ => metadata)
- [App] Create an identity
- [App] Subscribe to an entity
	- Automatically choose a predefined one
- [App] Register to an entity's census
	- Use the web view to submit predefined actions
	- The web view is custom code
	- By now, submit a captcha
	- Synchronous update to the Census Service

### Voting

- [Organizer] Regenerate the merkle tree from the current census
- [Organizer] Publish the merkle tree to IPFS
- [Organizer] Start a voting process
	- Blockchain + metadata
	- Publish IPFS root hash
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
