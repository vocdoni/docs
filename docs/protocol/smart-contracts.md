# Smart Contracts

A decentralized vote within the platform needs to interact with several Smart Contract instances.

In a logical order, entities need to register as such to the **Entity** Smart Contract and make their metadata available on Swarm, IPFS of HTTPS. Afterwards, entities may organize voting processes, which need to be registered in the **Process** Smart Contract. 

Vocdoni will provide its own instance for each one, but organizers are free to deploy their own version on any Ethereum blockchain. Smart Contracts are written in Solidity and need to be compiled into EVM bytecode. 

## Entity

Used as a registry of entity names, assigned to a metadata defined by an origin. 

`create(string memory name, string memory metadataOrigin)`

* Registers an entity with the given name
* The entity name must be unique, otherwise the transaction will fail
* `metadataOrigin` is expected to contain a valid origin as [defined here](/protocol/data-schema?id=content-uri)
* The actual content behind the `metadataOrigin` is expected to conform to the given [data schema](/protocol/data-schema?id=entity-metadata)

`updateMetadataOrigin(string memory metadataOrigin)`

* Updates the metadata origin of the entity behind the account sending the transaction
* If the account has no entity associated, the transaction will fail

`get(address entityAddress)`

* Returns the name and the metadata origin of the given entity (if it exists)

`getIndex()`

* Returns an array of addresses for the existing entities

**Considerations**

* Entities are identified by the adddress of the account that registers the entity (`msg.sender`)
  * This results in a 1:1 mapping between accounts and entities
  * This is a best practice to prevent the accumulation of responsibility (hence risk) into a single account

**Related**
* [Source code](https://github.com/vocdoni/dvote-smart-contracts/blob/master/contracts/VotingEntity.sol)

## Process

Used as a registry of voting processes, associated to the entity with the same address as the transaction sender.

`constructor(bool developmentMode)`

* Deploys a new instance
* When `developmentMode` is true, timestamps checks will be skipped

`create(address entityAddress, string memory processName, string memory metadataOrigin, uint startBlock, uint endBlock, string memory voteEncryptionPublicKey)`

* The `name` expects a single language version of the process name. Localized versions for every relevant language must be included within the metadata content
* A new and unique sequential `processId` will be assigned to the voting process
* `metadataOrigin` is expected to contain a valid origin as [defined here](/protocol/data-schema?id=content-uri)
* The actual content behind the `metadataOrigin` is expected to conform to the given [data schema](/protocol/data-schema?id=process-metadata)

`get(uint processId)`

* Fetch the current data from `processId`

`cancel(uint processId)`

* Only usable by the organizer before `startBlock`

`setMetadata(uint processId, string memory metadataOrigin)`

* Usable until `startblock` has been reached
* Updates the metadata field to point to a new origin

`setEncryptionPublicKey(uint processId, string memory publicKey)`

* Usable until `startBlock`
* Changes the public key that voters must use to encrypt his/her vote

`setEncryptionPrivateKey(uint processId, string memory privateKey)`

* Usable after `endBlock`
* Used by the organizer so that the count process can start and votes can be decrypted

`getIndexByOrganizer(address entity)`

* Get the list of processId's for a given entity

`registerRelay(uint processId, address relayAddress, string memory publicKey, string memory relayOrigin)`

* Usable only by the organizer
* `relayAddress` will the the `msg.sender` authorized to publish vote batches
* `publicKey` will be used for vote packages to be encrypted uwing this key
* `relayOrigin` is expected to be [as stated here](/protocol/data-schema?id=messaging-uri)

`isRegistered(uint processId, address relayAddress)`

*  Confirms whether a relay is registered to work on a process or not

`getRelayIndex(uint processId)`

* Provides a list of relay addresses authorized to work on a process

`getRelay(uint processId, address relayAddress)`

* Returns the public key and the messaging origin for the given relay

`registerBatch(uint processId, string memory dataOrigin)`

* Usable by registered relays only
* Adds a data origin pointing to a vote batch to the given process
* The content behind the data origin is expected to conform to this [data schema](/protocol/data-schema?id=vote-batch)

`getBatchIndex(uint processId)`

* Returns an array with the vote batches registered for the given processId

`getBatch(uint processId)`

* Provides the data origin on which a given vote batch can be fetched

