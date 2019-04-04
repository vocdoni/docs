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
    address entityAddress;     // The address of the Entity's creator
    string processName;
    string metadataContentUri; // Content URI to fetch the JSON metadata from
    uint256 startTime;         // block.timestamp after which votes can be registered
    uint256 endTime;           // block.timestamp until which votes can be registered
    bytes32 voteEncryptionPublicKey;
    
    address[] relayList;       // Relay addresses to let users fetch the Relay data
    mapping (address => Relay) relays;
    
    mapping (uint64 => string) voteBatches;  // Mapping from [0..N-1] to Content URI's to fetch the vote batches
    uint64 voteBatchCount;                   // N vote batches registered
}

struct Relay {
    bool active;
    string publicKey;
    string relayMessagingUri;
}

mapping (bytes32 => Process) public processes;   // processId => process data
mapping (address => uint) public processCount;   // Amount of processes created by an address

```

Processes are referenced by their `processId`

```solidity
function getNextProcessId(address entityAddress) public view returns (bytes32){
    uint idx = processCount[entityAddress] + 1;
    return keccak256(abi.encodePacked(entityAddress, idx));
}
```

where `processCount` is an auto-incremental nonce per `entityAddress`.

### Methods

**`constructor()`**

* Deploys a new instance

**`create(address entityResolver, address entityAddress, string processName, string metadataContentUri, uint startTime, uint endTime, string voteEncryptionPublicKey)`**

* The `processName` expects a single language version of the process name. Localized versions for every relevant language must be included within the metadata content
* A new and unique `processId` will be assigned to the voting process
* `metadataContentUri` is expected to contain a valid [Content URI](/architecture/protocol/data-origins?id=content-uri)
* The actual content behind the `metadataContentUri` is expected to conform to the [data schema below](#process-metadata-json)

**`get(uint processId)`**

* Fetch the current data from `processId`

**`cancel(uint processId)`**

* Usable by the organizer until `startTime - 1000`

**`addRelay(uint processId, address relayAddress, string publicKey, string relayMessagingUri)`**

* Usable only by the organizer
* `relayAddress` is the Ethereum address that will be allowed to register vote batches
* `publicKey` will be used for vote packages to be encrypted using this key
* `relayMessagingUri` is expected to be a valid [Messaging URI](/architecture/protocol/data-origins?id=messaging-uri)

**`disableRelay(uint processId, address relayAddress)`**

* Usable only by the organizer

**`isActiveRelay(uint processId, address relayAddress)`**

*  Confirms whether a relay is allowed to register vote batches on a process or not

**`getRelayIndex(uint processId)`**

* Provides a list of relay addresses authorized to work on a process

**`getRelay(uint processId, address relayAddress)`**

* Returns the public key and the [Messaging URI](/architecture/protocol/data-origins?id=messaging-uri) for the given relay

**`registerBatch(uint processId, string dataContentUri)`**

* Usable by whitelisted relays only
* Adds a [Content URI](/architecture/protocol/data-origins?id=content-uri) pointing to a vote batch to the given process
* The content behind the [Content URI](/architecture/protocol/data-origins?id=content-uri) is expected to conform to a valid [Vote Batch](/architecture/components/relay?id=vote-batch)

**`getBatchIndex(uint processId)`**

* Returns an array with the vote batches registered for the given processId

**`getBatch(uint processId)`**

* Returns the [Content URI](/architecture/protocol/data-origins?id=content-uri) on which the vote batch can be fetched

**`revealPrivateKey(uint processId, string privateKey)`**

* Usable after `endTime`
* Used by the organizer so that the count process can start and votes can be decrypted

<!-- **`getIndexByOrganizer(address entity)`** -->
<!-- * Get the list of processId's for a given entity -->


## Data schema

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows Relays and Scrutinizers to fetch the technical parameters of a vote.

### Process metadata (JSON)

The creation of this document is critical. Multiple checks should be in place to ensure that the data is choerent (well formatted, all relevant locales present, etc).

The JSON payload below is typically stored on Swarm or IPFS, so anyone can fetch the metadata of a voting process through a decentralized channel.

```json
{
    "version": "1.0",    // Protocol version

    "address": "0x1234...", // Of the vote on the VotingProcesses smart contract
    
    "voteType": "single-choice", // Defines how the UI should allow to choose among the votingOptions.
    "proofType": "zk-snarks",  // Allowed ["zk-snarks", "lrs"]
    
    "name": {
        "en": "Universal Basic Income",
        "ca": "Renda Bàsica Universal"
    },
    "question": {
        "en": "Should universal basic income become a human right?",
        "ca": "Estàs d'acord amb que la renda bàsica universal sigui un dret humà?"
    },
    "voteOptions": [
        {
            "en": "Yes" ,
            "ca": "Sí",
            "value": "1"
        },
        {
            "en": "No",
            "ca": "No",
            "value": "2"
        }
    ],
    "startTime": 10000,   // block timestamp as seconds since unix epoch
    "endTime":  11000,    // block timestamp as seconds since unix epoch
    "meta": {
        "description": {
            "en": "## Markdown text goes here\n### Abstract",
            "ca": "## El markdown va aquí\n### Resum"
        },
        "images": [ "<content uri>", ... ],
        "organizer": {
            "address": "0x1234...",  // Address of the Entity entry on the blockchain
            "resolver": "0x2345...",  // Address of the EntityResolver smart contract
            "metadata": "<content uri>" // Organizer's metadata
        }
    },
    "census": {
        "id": "0x1234...",  // Census ID to use
        "uri": ["<messaging uri>", "..."], // Messaging URI of the Census Services to request data from
        "merkleRoot": "0x1234...",
        "modulusSize": 5000  // Only when type="lrs"
    },

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
