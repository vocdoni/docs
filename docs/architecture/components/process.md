# Voting Process

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows validators to fetch the technical parameters of a vote.

The starting point is the **[Voting Process](#smart-contract)** contract, but it is tightly coupled with the **[JSON Process Metadata](#data-schema)** living on P2P filesystems.

## Smart Contract

Used as a registry of voting processes, associated to the entity with the same Ethereum address as the transaction sender.

### Internal structs

```solidity
struct Process {
    bytes32 entityId;                  // Id of the Entity creating the process
    address entityResolver;            // A pointer to the Entity's resolver instance to fetch metadata
    string processMetadataHash;        // IPFS hash to fetch the JSON metadata from
    string voteEncryptionPrivateKey;   // Key revealed after the vote ends so that scrutiny can start
    bool canceled;                     // Can be used by organization to cancel the project
    string resultsHash;                // IPFS hash published once results are computed
}

string version;                        // Version of the protocol
string [] validators;                  // Votchain validators public keys
string [] oracles;                     // Oracles public keys
string genesis;                        // Genesis block hash of the Votchain
int chainId;                           // Votechain chainId

Process[] public processes;            // Array of Process structs
mapping (bytes32 => uint) public entityProcessCount;   // Amount of processes created by an address
```


Processes are referenced by their `processId`

```solidity
function getNextProcessId(address entityAddress) public view returns (bytes32){
    // From 0 to N-1, the next index is N
    uint idx = entityProcessCount[entityAddress];
    return keccak256(abi.encodePacked(entityAddress, idx,genesis, chainId));
}
```

where `entityProcessCount` is an auto-incremental nonce per `entityAddress`.

### Methods

**`constructor()`**
- Deploys a new instance

**`create(bytes32 entityId, address entityResolver, string metadataHash,)`**
- A new and unique `processId` will be assigned to the voting process
- `metadataHash` is an IPFS hash.
- The actual content behind the `metadataHash` is expected to conform to the [data schema below](#process-metadata-json)

**`get(bytes32 processId)`**
- Fetch the current data from `processId`

**`cancel(bytes32 processId)`**
- Usable by the organizer

**`addValidator(string validatorPublicKey)`**
- Usable only by contract owner
- `validatorPublicKey` is the ECDSA public key that will be allowed to update the census

**`addOracle(string oraclePublicKey)`**
- Usable only by contract owner
- `oraclePublicKey` is the ECDSA public key that will be allowed to update the census
**`getCensusManagerIndex(bytes32 processId)`**

**`revealPrivateKey(bytes32 processId, string privateKey)`**
* Usable after `endTime`
* Used by the organizer so that the count process can start and votes can be decrypted

**`publishResults(bytes32 processId, string resultsHash)`**
* Usable after `voteEncryptionPrivateKey`
* Used by the organizer so that the count process can start and votes can be decrypted

## Data schema

### Process metadata (JSON)

The creation of this document is critical. Multiple checks should be in place to ensure that the data is choerent (well formatted, all relevant locales present, etc).

The JSON payload below is stored on IPFS.

```json
{
    "version": "1.0", // Protocol version
    "startBlock": 10000, // Block number on the votchain since the process will be open
    "numberOfBlocks": 400,
    "census": {
        "id": "0x1234...", // Census ID to use for the vote
        "merkleRoot": "0x1234...",
        "messagingUris": [
            "<messaging uri>",
            "..."
        ] // Messaging URI of the Census Services to request data from
    },
    "processType": "snarks-voting-01", //defines details
    "details": {
        "encryptionKey":"0x1123",
        "title": {
            "en": "Universal Basic Income",
            "ca": "Renda Bàsica Universal"
        },
        "description": {
            "en": "## Markdown text goes here\n### Abstract",
            "ca": "## El markdown va aquí\n### Resum"
        },
        "headerImage": [
            "<content uri>"
        ],
        "questions": [
            {
                "questionType": "single-choice", // Defines how the UI should allow to choose among the votingOptions.
                "question": {
                    "en": "Should universal basic income become a human right?",
                    "ca": "Estàs d'acord amb que la renda bàsica universal sigui un dret humà?"
                },
                "description": {
                    "en": "## Markdown text goes here\n### Abstract",
                    "ca": "## El markdown va aquí\n### Resum"
                },
                "voteOptions": [
                    {
                        "en": "Yes",
                        "ca": "Sí",
                        "value": "1"
                    },
                    {
                        "en": "No",
                        "ca": "No",
                        "value": "2"
                    }
                ]
            }
        ]
    }
}
```
