# Voting Process

- [Voting Process](#voting-process)
  - [Smart Contract](#smart-contract)
    - [Internal structs](#internal-structs)
    - [ProcessId](#processid)
    - [Current implementation](#current-implementation)
  - [Data schema](#data-schema)
    - [Process metadata (JSON)](#process-metadata-json)
    - [Process metadata (JSON)](#process-metadata-json-1)
  - [Future work](#future-work)
    - [Definie a versioning system](#definie-a-versioning-system)
    - [Define sanity checks](#define-sanity-checks)
    - [Oracles protocol](#oracles-protocol)
    - [Support multi-layer vote encryption](#support-multi-layer-vote-encryption)

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows validators to fetch the technical parameters of a vote.

The starting point is the **[Voting Process](#smart-contract)** contract, but it is tightly coupled with the **[JSON Process Metadata](#data-schema)** living on P2P filesystems.

## Smart Contract

Used as a registry of voting processes, associated to the entity with the same Ethereum address as the transaction sender.

### Internal structs

```solidity

// GLOBAL STRUCTS

struct Process {
    address entityAddress;             // The Ethereum address of the Entity
    string metadataContentHashedUri;   // Content Hashed URI of the JSON metadata (See Data Origins)
    string voteEncryptionPrivateKey;   // Key published after the vote ends so that scrutiny can start
    bool canceled;                     // Can be used by organization to cancel the project
    string resultsContentHashedUri;    // Content Hashed URI of the results (See Data Origins)
}

// GLOBAL DATA

address contractOwner;
string[] validators;
string[] oracles;
string genesisContentHashedUri;
uint chainId;

// PER-PROCESS DATA

Process[] public processes;                 // Array of Process struct
mapping (bytes32 => uint) processesIndex;   // Mapping of processIds with processess idx
mapping (address => uint) public entityProcessCount;   // index of the last process for a given address

```

### ProcessId

Processes are uniquely identified by their `processId`

To guarantee its uniqueness is generated out of:
- `entityId`
- `idx`
- `genesisContentHashedUri`
- `chainId`

```solidity
function getNextProcessId(address entityAddress) public view returns (bytes32){
    // From 0 to N-1, the next index is N
    uint nextIdx = entityProcessCount[entityAddress];
    
    return keccak256(abi.encodePacked(entityAddress, nextIdx, genesisContentHashedUri, chainId));
}

function getProcessId(address entityAddress, uint processCountIndex) public view returns (bytes32) {
    return keccak256(abi.encodePacked(entityAddress, processCountIndex, genesisContentHashedUri, chainId));
}

```

where `entityProcessCount` is an incremental nonce per `entityAddress`.

### Current implementation

[VotingProcess.sol](https://gitlab.com/vocdoni/dvote-solidity/raw/master/contracts/VotingProcess.sol)

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
        "entityId": "0x123",
        "encryptionKey":" 0x1123",
        "title": {
            "en": "Universal Basic Income",
            "ca": "Renda Bàsica Universal"
        },
        "description": {
            "en": "## Markdown text goes here\n### Abstract",
            "ca": "## El markdown va aquí\n### Resum"
        },
        "headerImage": "<content uri>",
        "questions": [
            {
                "type": "single-choice", // Defines how the UI should allow to choose among the votingOptions.
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
                        "name": {
                            "en": "Yes",
                            "ca": "Sí",
                        },
                        "value": "1"
                    },
                    {
                        "name": {
                            "en": "No",
                            "ca": "No",
                        },
                        "value": "2"
                    }
                ]
            }
        ]
    }
}
```


## Future work

### Definie a versioning system
### Define sanity checks
There are serveral events where the process may be invalid.

- Process-metadata can't be fetched from IPFS
- Process-metadata field can't be parsed or does not exist
- voteEncryptionPrivateKey is invalid is not correct
- Block-times are have an valid range. Define how far in the future they want the

Oracles must report them, and action should be taken if there is concensus.

### Oracles protocol

Most of the sanity check logic can't no longer be in the ethereum blockchain, therefore we need to define process/concensus mechanism for the oracles to report to the ethereum smart-contracts.

Oracles therefor must have an ethereum account, and it should be registered together with its public key

Oracles can complain when there is a problem.
```
complain(uint reason){}
```

If a pre-defined percentage of oracles agrees on a problem of a specific reason, the process can be invalidated.

```
invalidate(uint reason){}
```

Before the user is shown a process, it should've been validated that the process is all good. Therfore is probably a good idea that the validators approve the process at the begining.

```
complain(0);
```

The same logic should be used for the reporting the results

```
reportResults(string resultsHash){}
```

```
validateResults(){}
````
In case of the `voteEncryptionPrivateKey` it is more complex, specially if there are multiple actors.

### Support multi-layer vote encryption

Define how multiple entities can publish the public and private key for vote encryption. So no single entity has privliedge information.