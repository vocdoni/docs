# Voting Process

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows validators to fetch the technical parameters of a vote.

The starting point is the **[Voting Process](#smart-contract)** contract, but it is tightly coupled with the **[JSON Process Metadata](#data-schema)** living on P2P filesystems.

## Smart Contract

Used as a registry of voting processes, associated to the entity with the same Ethereum address as the transaction sender.

### Internal structs

```solidity
struct Process {
    bytes32 entityId;                       // Id of the Entity creating the process
    string metadataContentUri;              // Content URI to fetch the JSON metadata from
    string metadataHash;                    // SHA3-256 hash of the metadataContentUri contents
    string voteEncryptionPrivateKey;        // Private Key revealed after the vote ends so that scrutiny can start
    bool canceled;                          // Can be used by organization to cancel the project
    string resultsContentUri;               // Content URI to fetch the results once they are computed
    string resultsHash;                     // SHA3-256 of the resultsContentUri contents
}

string [] validators;                       // Vocchain validators public keys
string [] oracles;                          // Oracles public keys
string genesis;                             // Genesis block hash of the Vocchain
int chainId;                                // Votechain chainId

Process[] public processes;                 // Array of Process struct
mapping (bytes32 => uint) processesIndex;   // Mapping of processIds with processess idx

mapping (bytes32 => uint) public entityProcessCount;   // Amount of processes created by an address

```

Processes are uniquely identified by their `processId`

To guarantee its uniqueness is generated out of:
- `entityId`
- `idx`
- `genesis`
- `chainId`

```solidity
function getNextProcessId(address entityAddress) public view returns (bytes32){
    // From 0 to N-1, the next index is N
    uint nextIdx = entityProcessCount[entityAddress];
    return keccak256(abi.encodePacked(entityAddress, nextIdx, genesis, chainId));
}
```

where `entityProcessCount` is an incremental nonce per `entityAddress`.

### Methods

**`constructor(uint chainIdValue)`**
- Deploys a new instance and sets the chainId to the given one

**`create(string memory metadataContentUri, string memory metadataHash)`**
- Register a new voting process
- `metadataContentUri` points to the place(s) to fetch the metadata from
- The actual content behind the `metadataContentUri` is expected to conform to the [data schema below](#process-metadata-json)
- `metadataHash` is the SHA3-256 hash of the content behind `metadataContentUri`

**`get(bytes32 processId)`**
- Fetch the current data from `processId`

**`cancel(bytes32 processId)`**
- Usable by the organizer

**`addValidator(string validatorPublicKey)`**
- Usable only by contract owner
- `validatorPublicKey` is the ECDSA public key that will be allowed to update the census

**`removeValidator(int idx, string validatorPublicKey)`**
- Usable only by contract owner
- Usable only by contract owner

**`getValidators()`**

**`addOracle(string oraclePublicKey)`**
- Usable only by contract owner
- `oraclePublicKey` is the ECDSA public key of the oracle

**`removeOracle(int idx, string oraclePublicKey)`**
- Usable only by contract owner

**`getOracless()`**

**`publishPrivateKey(bytes32 processId, string privateKey)`**
* Used by the organizer so that the count process can start and votes can be decrypted
* Nacl Box key

**`getPrivateKey()`**

**`publishResults(bytes32 processId, string memory resultsContentUri, string memory resultsHash)`**
* Usable after `voteEncryptionPrivateKey`
* Used by the organizer so that the count process can start and votes can be decrypted

**`getResults()`**

## Data schema

### Process metadata (JSON)

The creation of this document is critical. Multiple checks should be in place to ensure that the data is choerent (well formatted, all relevant locales present, etc).

The JSON payload below is stored on IPFS.

```json
{
    "version": "1.0", // Protocol version
    "type": "snark-vote", // One of: snark-vote, snark-poll, snark-petition
    "startBlock": 10000, // Block number on the vocchain since the process will be open
    "numberOfBlocks": 400,
    "census": {
        "id": "0x1234...", // Census ID to use for the vote
        "merkleRoot": "0x1234...",
        "messagingUris": [
            "<messaging uri>",
            "..."
        ] // Messaging URI of the Census Services to request data from
    },
    "details": {
        "encryptionPublicKey":"01234...",  // Nacl Box public key: https://godoc.org/golang.org/x/crypto/nacl/box
        "title": {
            "en": "Universal Basic Income",
            "ca": "Renda Bàsica Universal"
        },
        "description": {
            "en": "## Markdown text goes here\n### Abstract",
            "ca": "## El markdown va aquí\n### Resum"
        },
        "headerImages": [
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
