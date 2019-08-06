# Voting Process

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows Relays and Scrutinizers to fetch the technical parameters of a vote.

The metadata of voting process is also an aggregate of data from the Blockchain and P2P filesystems.

The starting point is the **[Voting Process](#smart-contract)** contract, but it is tightly coupled with the **[JSON Process Metadata](#data-schema)** living on P2P filesystems.

## Smart Contract

Used as a registry of voting processes, associated to the entity with the same Ethereum address as the transaction sender.

### Internal structs

```solidity
struct Process {
    bytes32 entityId;                  // The ID of the Entity creating the process
    address entityResolver;            // A pointer to the Entity's resolver instance to fetch metadata
    string metadataContentUri;         // Content URI to fetch the JSON metadata from
    uint256 startTime;                 // block.timestamp before which metadata changes can be made on Ethereum
    uint256 endTime;                   // block.timestamp after which the decryption key can be published on Ethereum
    string voteEncryptionPublicKey;
    string voteEncryptionPrivateKey;   // Key revealed after the vote ends so that scrutiny can start
    bool canceled;

    address[] censusManagerPublicKeys;  // Public key of the nodes that can manage the census of the vote
    address[] chainValidatorPublicKeys; // Public key of the nodes that can validate transactions on the Tendermint chain

    mapping(uint => uint) result;       // Mapping of the final vote count for each vote option
}

mapping (bytes32 => Process) public processes;   // processId => process data
mapping (bytes32 => uint) public entityProcessCount;   // Amount of processes created by an address

event ProcessScheduled(bytes32 indexed entityAddress, bytes32 processId);
event ProcessCanceled(bytes32 indexed processId);
event CensusManagerUpdated(bytes32 indexed processId, address node);
event ChainValidatorUpdated(bytes32 indexed processId, address node);
event PrivateKeyRevealed(bytes32 indexed processId);

```

Processes are referenced by their `processId`

```solidity
function getNextProcessId(address entityAddress) public view returns (bytes32){
    // From 0 to N-1, the next index is N
    uint idx = entityProcessCount[entityAddress];
    return keccak256(abi.encodePacked(entityAddress, idx));
}
```

where `entityProcessCount` is an auto-incremental nonce per `entityAddress`.

### Methods

**`constructor()`**

* Deploys a new instance

**`create(bytes32 entityId, address entityResolver, string metadataContentUri, uint startTime, uint endTime, string voteEncryptionPublicKey)`**

* A new and unique `processId` will be assigned to the voting process
* `metadataContentUri` is expected to contain a valid [Content URI](/architecture/protocol/data-origins?id=content-uri)
* The actual content behind the `metadataContentUri` is expected to conform to the [data schema below](#process-metadata-json)

**`get(bytes32 processId)`**

* Fetch the current data from `processId`

**`cancel(bytes32 processId)`**

* Usable by the organizer until `startTime - 1000`

**`addCensusManager(bytes32 processId, bytes32 managerPublicKey)`**

* Usable only by the organizer
* `managerPublicKey` is the ECDSA public key that will be allowed to update the census

**`disableCensusManager(bytes32 processId, uint arrayIndex)`**

* Usable only by the organizer

**`getCensusManagerIndex(bytes32 processId)`**

* Provides a list of census manager public keys

**`addChainValidator(bytes32 processId, bytes32 validatorPublicKey)`**

* Usable only by the organizer
* `validatorPublicKey` is the ECDSA public key that will be allowed to validate blocks

**`disableChainValidator(bytes32 processId, uint arrayIndex)`**

* Usable only by the organizer

**`getChainValidatorIndex(bytes32 processId)`**

* Provides a list of chain validator public keys

**`revealPrivateKey(bytes32 processId, string privateKey)`**

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

    "processId": "0x1234...", // Of the vote on the VotingProcesses smart contract
    
    "voteType": "single-choice", // Defines how the UI should allow to choose among the votingOptions.
    "proofType": "zk-snarks",  // Allowed ["zk-snarks", "lrs"]
    
    "startTime": 10000,   // Block number on the vote chain since the process will be open
    "endTime":  11000,    // Block number on the vote chain until which, the process will be open
    "metadata": {
        "title": {
            "en": "Universal Basic Income",
            "ca": "Renda Bàsica Universal"
        },
        "question": {
            "en": "Should universal basic income become a human right?",
            "ca": "Estàs d'acord amb que la renda bàsica universal sigui un dret humà?"
        },
        "description": {
            "en": "## Markdown text goes here\n### Abstract",
            "ca": "## El markdown va aquí\n### Resum"
        },
        "images": [ "<content uri>", ... ],
        "organizer": {
            "entityId": "0x1234...",  // ID of the Entity on the blockchain
            "resolverAddress": "0x2345...",  // Address of the EntityResolver smart contract
            "metadata": "<content uri>" // Entity's metadata Content URI
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
        ]
    },
    "census": {
        "id": "0x1234...",  // Census ID to use for the vote
        "merkleRoot": "0x1234...",
        "messagingUris": ["<messaging uri>", "..."], // Messaging URI of the Census Services to request data from
        "modulusSize": 5000  // Only when type="lrs"
    },

    // Only when voteType == "lrs"

    "modulusGroups": [
        { "publicKeyModulus": 0, "uri": "<content uri>" },  // Resolves to a ModulusGroupArray (see below)
        { "publicKeyModulus": 1, "uri": "<content uri>" },
        { "publicKeyModulus": 2, "uri": "<content uri>" },
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
