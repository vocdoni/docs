# Smart contracts

Voting ecosystems will need to interact with two different Smart Contracts on the Blockchain:
* **Entity Resolver**
    * Decentralized registry of entities and their corresponding metatada
* **Voting Process**
    * Registry of voting processes created by the entities defined above

## Entity Resolver

The Entity Resolver is a standard ENS resolver contract. Its purpose is to provide a key/value store of `Text` records following a naming convention.

For reference about **standard ENS Resolvers**:
- https://docs.ens.domains/contract-api-reference/publicresolver

For reference about the naming convention of Text records within an **Entity Resolver**:
- See [Entity Metadata - Resolver](/protocol/entity-metadata?id=entity-resolver)

## Voting Process

Used as a registry of voting processes, associated to the entity with the same Ethereum address as the transaction sender.

### Data structs

```solidity
struct Process {
    address entityResolver;    // A pointer to the Entity's resolver instance to fetch metadata
    address entityAddress;     // The address of the creator's Entity
    string processName;
    string metadataContentUri; // Content URI to fetch the JSON metadata from
    uint startBlock;
    uint endBlock;
    bytes32 voteEncryptionPublicKey;
    mapping (uint64 => string) voteBatches;  // Array of Content URI's to fetch the vote batches
    uint64 voteBatchCount;
}


mapping (bytes32 => Process) public processes;
mapping (address => uint) public processIndexes;

```

Processes are indexed by the `processId`

```solidity
bytes32 processId = keccak256(abi.encodePacked(entityAddress, processIndex))
```

where `processIndex` is an auto-incremental nonce per `entityAddress`.

### Methods

**`constructor(bool developmentMode)`**

* Deploys a new instance
* When `developmentMode` is true, timestamps checks will be skipped

**`create(address entityResolver, string memory processName, string memory metadataContentUri, uint startBlock, uint endBlock, string memory voteEncryptionPublicKey)`**

* The `processName` expects a single language version of the process name. Localized versions for every relevant language must be included within the metadata content
* A new and unique sequential `processId` will be assigned to the voting process
* `metadataContentUri` is expected to contain a valid [Content URI](/protocol/data-schema?id=content-uri)
* The actual content behind the `metadataContentUri` is expected to conform to the given [data schema](/protocol/data-schema?id=process-metadata)

**`get(uint processId)`**

* Fetch the current data from `processId`

**`cancel(uint processId)`**

* Only usable by the organizer before `startBlock`

**`setMetadata(uint processId, string memory metadataContentUri)`**

* Usable until `startblock` has been reached
* Updates the metadata field to point to a new [Content URI](/protocol/data-schema?id=content-uri)

**`setEncryptionPublicKey(uint processId, string memory publicKey)`**

* Usable until `startBlock`
* Changes the public key that voters must use to encrypt his/her vote

**`setEncryptionPrivateKey(uint processId, string memory privateKey)`**

* Usable after `endBlock`
* Used by the organizer so that the count process can start and votes can be decrypted

<!-- **`getIndexByOrganizer(address entity)`** -->
<!-- * Get the list of processId's for a given entity -->

**`whitelistRelay(uint processId, address relayAddress, string memory publicKey, string memory relayMessagingUri)`**

* Usable only by the organizer
* `relayAddress` is the Ethereum address that will be allowed to register vote batches
* `publicKey` will be used for vote packages to be encrypted uwing this key
* `relayMessagingUri` is expected to be a valid [Messaging URI](/protocol/data-schema?id=messaging-uri)

**`removeRelay(uint processId, address relayAddress)`**

* Usable only by the organizer

**`isWhitelisted(uint processId, address relayAddress)`**

*  Confirms whether a relay is allowed to register vote batches on a process or not

**`getRelayIndex(uint processId)`**

* Provides a list of relay addresses authorized to work on a process

**`getRelay(uint processId, address relayAddress)`**

* Returns the public key and the [Messaging URI](/protocol/data-schema?id=messaging-uri) for the given relay

**`registerBatch(uint processId, string memory dataContentUri)`**

* Usable by whitelisted relays only
* Adds a [Content URI](/protocol/data-schema?id=content-uri) pointing to a vote batch to the given process
* The content behind the [Content URI](/protocol/data-schema?id=content-uri) is expected to conform to a valid [Vote Batch](/protocol/data-schema?id=vote-batch)

**`getBatchIndex(uint processId)`**

* Returns an array with the vote batches registered for the given processId

**`getBatch(uint processId)`**

* Returns the [Content URI](/protocol/data-schema?id=content-uri) on which the vote batch can be fetched

