# Voting Process

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows Relays and Scrutinizers to fetch the technical parameters of a vote.

The metadata of voting process is also an aggregate of data from the Blockchain and P2P filesystems. 

The starting point is the **[Voting Process](#smart-contract)** contract, but it is tightly coupled with the **[JSON Process Metadata](#data-schema)** living on P2P filesystems.

## Smart Contract

Used as a registry of voting processes, associated to the entity with the same Ethereum address as the transaction sender.

### Internal structs

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
* `metadataContentUri` is expected to contain a valid [Content URI](/architecture/protocol/data-origins?id=content-uri)
* The actual content behind the `metadataContentUri` is expected to conform to the given [data schema](/architecture/components/process?id=process-metadata-json)

**`get(uint processId)`**

* Fetch the current data from `processId`

**`cancel(uint processId)`**

* Only usable by the organizer before `startBlock`

**`setMetadata(uint processId, string memory metadataContentUri)`**

* Usable until `startblock` has been reached
* Updates the metadata field to point to a new [Content URI](/architecture/protocol/data-origins?id=content-uri)

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
* `relayMessagingUri` is expected to be a valid [Messaging URI](/architecture/protocol/data-origins?id=messaging-uri)

**`removeRelay(uint processId, address relayAddress)`**

* Usable only by the organizer

**`isWhitelisted(uint processId, address relayAddress)`**

*  Confirms whether a relay is allowed to register vote batches on a process or not

**`getRelayIndex(uint processId)`**

* Provides a list of relay addresses authorized to work on a process

**`getRelay(uint processId, address relayAddress)`**

* Returns the public key and the [Messaging URI](/architecture/protocol/data-origins?id=messaging-uri) for the given relay

**`registerBatch(uint processId, string memory dataContentUri)`**

* Usable by whitelisted relays only
* Adds a [Content URI](/architecture/protocol/data-origins?id=content-uri) pointing to a vote batch to the given process
* The content behind the [Content URI](/architecture/protocol/data-origins?id=content-uri) is expected to conform to a valid [Vote Batch](/architecture/components/relay?id=vote-batch)

**`getBatchIndex(uint processId)`**

* Returns an array with the vote batches registered for the given processId

**`getBatch(uint processId)`**

* Returns the [Content URI](/architecture/protocol/data-origins?id=content-uri) on which the vote batch can be fetched


## Data schema

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows Relays and Scrutinizers to fetch the technical parameters of a vote.

### Process metadata (JSON)

The creation of this document is critical. Multiple checks should be in place to ensure that the data is choerent (well formatted, all relevant locales present, etc).

The JSON payload below is typically stored on Swarm or IPFS, so anyone can fetch the metadata of a voting process through a decentralized channel.

```json
{
    "version": "1.0",    // Protocol version

    "name": "Basic income rule", // Human friendly name, not an identifier
    "address": "0x1234...", // Of the vote on the VotingProcesses smart contract
    
    "voteType": "single-choice", // Defines how the UI should allow to choose among the votingOptions.
    "proofType": "zk-snarks",  // Allowed ["zk-snarks", "lrs"]
    
    "question": {
        "default": "Should universal basic income become a human right?",
        "ca": "Estàs d'acord amb que la renda bàsica universal sigui un dret humà?"
    },
    "voteOptions": [
        {
            "default": "Yes" ,
            "ca": "Sí",
            "value": 1
        },
        {
            "default": "No",
            "ca": "No",
            "value": 2
        }
    ],
    "startBlock": 10000,
    "endBlock":  11000,
    "meta": {
        "description": {
            "default": "## Markdown text goes here\n### Abstract",
            "ca": "## El markdown va aquí\n### Resum"
        },
        "images": [ "<content uri>", ... ],
        "organizer": {
            "address": "0x1234...",  // Address of the Entity entry on the blockchain
            "resolver": "0x2345...",  // Address of the EntityResolver smart contract
            "metadata": "<content uri>" // Organizer's metadata
        }
    },
    // List of currently active Relays. This saves a query from the user to the blockchain, once a
    // process has been already fetched.
    // The actually binding list of relays for Voting Process is within the smart contract
    "relays": [
        {
            "address": "0x1234...",     // PSS adress to help routing messages
            "publicKey": "0x23456...",  // Key to encrypt data sent to it
            "uri": "<messaging-uri>"    // Where to send messages. See Data origins > Messaging URI
        }, 
        ...
    ],
    "census": {
        "id": "entity-people-of-legal-age",  // Census ID to use
        "origin": "<messaging uri>", // Messaging URI of the Census Service to request data from
        "merkleRoot": "0x1234...",
        "modulusSize": 5000  // Only when type="lrs"
    },
    "publicKey": "0x1234...", // To encrypt vote packages

    // Only when voteType == "lrs"

    "modulusGroups": [
        { "publicKeyModulus": 0, "source": "<content uri>" },  // Resolves to a ModulusGroupArray (see below)
        { "publicKeyModulus": 1, "source": "<content uri>" },
        { "publicKeyModulus": 2, "source": "<content uri>" },
        ...
    ]
}
```

**Used in:**

- [Voting process creation](/architecture/sequence-diagrams?id=voting-process-creation)
- [Voting process retrieval](/architecture/sequence-diagrams?id=voting-process-retrieval)
- [Casting a vote with ZK Snarks](/architecture/sequence-diagrams?id=casting-a-vote-with-zk-snarks)
- [Casting a vote with Linkable Ring Signatures](/architecture/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

**Related:**

- [Process Smart Contract](https://github.com/vocdoni/dvote-smart-contracts/blob/master/contracts/VotingProcess.sol)
- [Process JS methods](https://github.com/vocdoni/dvote-client/blob/master/src/dvote/process.ts)

**Notes:**

- The `voteType` field indicates the scrutiny method that will be used for the process. Any vote package generated with an invalid voteType will be discarded.
