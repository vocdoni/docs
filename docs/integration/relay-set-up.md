# Relay set up

`This section will explain how to start and configure a relay service`



------



`This content needs to be reviewed and adapted to the latest protocol specification`

### dvote-relay packages

- data: provides IPFS access (publish and retreival)
	* publish(json)
	* retrieve(batchID): returns batch json identified by batchID
  
  
- net: provides network listener socket (HTTP?) to retrive votes
	* listen(port)
	* close()
	* fetch(): returns the list of queued votes to process
  

- batch: provides the data structure and the functions related to the batch
	* type votePacket
	* create(): returns batch json of queued votes
  

- pow: provides the Proof-of-Work check (not needed yet?)
	* verify(votePacket)
  

- chain: provides access to Ethereum web3/SmartContract interaction
	* link(batchID)
  

- franchise: provides functions to theck the Zk-snark proof (for the moment using an external service?)
	* verify(votePacket)
 

- keys: provides functions to manage the private/public keys of the relay
	* generate()
	* load(path)
  
### main flow

1. network listen on port N
2. when a new packet arrives
	1. Check correctness of the data structure
	2. Check PoW
	3. Decrypt packet (if encrypted)
	4. Check franchise Proof
3. Wait X minutes or to receive a maximum of Y packages
4. Create a batch with the current, not-registered, votes
5. Publish the batch into IPFS
6. Register the link to the BlockChain

### technologies to use

- ipfs
- leveldb
- iden3 merkleTree
- web3











