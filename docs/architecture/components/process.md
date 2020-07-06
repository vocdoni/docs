# Voting Process

- [Voting Process](#voting-process)
  - [Smart Contract](#smart-contract)
    - [Internal structs](#internal-structs)
    - [Process ID](#process-id)
    - [Methods](#methods)
    - [Getters](#getters)
    - [Flags](#flags)
    - [Status](#status)
    - [Versioning](#versioning)
  - [Data schema](#data-schema)
    - [Process metadata (JSON)](#process-metadata-json)
    - [Vote Envelope](#vote-envelope)
      - [Containing Snark votes](#containing-snark-votes)
      - [Containing Poll votes](#containing-poll-votes)
    - [Vote Package](#vote-package)
      - [Snark Vote](#snark-vote)
      - [Poll Vote](#poll-vote)
      - [Petition Sign](#petition-sign)
    - [Results (JSON)](#results-json)
  - [Future work](#future-work)
    - [Define a versioning system](#definie-a-versioning-system)
    - [Define sanity checks](#define-sanity-checks)
    - [Oracles protocol](#oracles-protocol)
    - [Support multi-layer vote encryption](#support-multi-layer-vote-encryption)

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. 

The starting point is the **[Voting Process](#smart-contract)** contract, but it is tightly coupled with the **[JSON Process Metadata](#data-schema)** living on P2P filesystems.

## Smart Contract

A process is the building block around which governance is made in Vocdoni. As in an operating system, look at the process contract as a Kernel syscall that allows you to spawn a new governance process.

The ENS address of the Voting process contract instance is resolved from `voting-process.vocdoni.eth` (soon replaced by `process.vocdoni.eth` and `process.dev.vocdoni.eth`) on the registry.

While the process contract is the source of truth, the governance process itself will take place on the [Vochain](/architecture/components/vochain). Processes are parameterized and controlled from Ethereum, but real actions will not happen there.

### Internal structs

```solidity

// GLOBAL STRUCTS

struct Process {
    uint8 mode; // The selected process mode. See: https://vocdoni.io/docs/#/architecture/components/process
    uint8 envelopeType; // One of valid envelope types, see: https://vocdoni.io/docs/#/architecture/components/process
    address entityAddress; // The Ethereum address of the Entity
    uint64 startBlock; // Tendermint block number on which the voting process starts
    uint32 blockCount; // Amount of Tendermint blocks during which the voting process should be active
    string metadata; // Content Hashed URI of the JSON meta data (See Data Origins)
    string censusMerkleRoot; // Hex string with the Merkle Root hash of the census
    string censusMerkleTree; // Content Hashed URI of the exported Merkle Tree (not including the public keys)
    Status status; // One of 0 [ready], 1 [ended], 2 [canceled], 3 [paused], 4 [results]
    uint8 questionIndex; // The index of the currently active question (only assembly processes)

    // How many questions are available to vote
    // questionCount >= 1
    uint8 questionCount;

    // How many choices can be made for each question.
    // 1 <= maxCount <= 100
    uint8 maxCount;

    // Determines the acceptable value range.
    // N => valid votes will range from 0 to N (inclusive)
    uint8 maxValue;

    uint8 maxVoteOverwrites; // How many times a vote can be replaced (only the last one counts)

    // Choices for a question cannot appear twice or more
    bool uniqueValues;

    // Limits up to how much cost, the values of a vote can add up to (if applicable).
    // 0 => No limit / Not applicable
    uint16 maxTotalCost;

    // Defines the exponent that will be used to compute the "cost" of the options voted and compare it against `maxTotalCost`.
    // totalCost = Σ (value[i] ** costExponent) <= maxTotalCost
    //
    // Exponent range:
    // - 0 => 0.0000
    // - 10000 => 1.0000
    // - 65535 => 6.5535
    uint16 costExponent;

    // Self-assign to a certain namespace.
    // This will determine the oracles that listen and react to it.
    // Indirectly, it will also determine the Vochain that hosts this process.
    uint16 namespace;

    bytes32 paramsSignature; // entity.sign({...}) // fields that the oracle uses to authentify process creation
    
    string results; // string containing the results
}

// PER-PROCESS DATA

struct ProcessCheckpoint {
    uint256 index; // The index of this process within the entity's history, including parent instances
}

mapping(address => ProcessCheckpoint[]) internal entityCheckpoints; // Array of ProcessCheckpoint indexed by entity address
mapping(bytes32 => Process) internal processes; // Mapping of all processes indexed by the Process ID
```

### Process ID

Processes are uniquely identified by their `processId`

It is the result of combining and hashing these three values:
- `entityAddress`
- `processCountIndex`
- `namespace`

```solidity
function getNextProcessId(address entityAddress, uint16 namespace) public view returns (bytes32){
    // From 0 to N-1, the next index is N

    uint256 processCount = getEntityProcessCount(entityAddress);
    return getProcessId(entityAddress, processCount, namespace);
}

function getProcessId(address entityAddress, uint256 processCountIndex, uint16 namespace) public view returns (bytes32) {
    return keccak256(abi.encodePacked(entityAddress, processCountIndex, namespace));
}
```

Where:
- `entityAddress` is the Ethereum address that creates the process
- `entityProcessCount` is an incremental nonce per `entityAddress`
- `namespace` is the number to which a process self assigns itself. See [Namespaces](/architecture/components/namespaces)

### Methods

- `newProcess()`
    - Sets the parameters of a new process to be run on the Vochain
- `setStatus()`
    - With the appropriate flags, the creator can set the process to be `READY`, `ENDED`, `CANCELED` or `PAUSED`.
    - See [process status](#status) below
- `incrementQuestionIndex()`
    - With the appropriate flags, the creator can define what question can currently be voted on
- `setCensus()`
    - With the appropriate flags, the creator can update the census for long lasting polls
- `setResults()`
    - Once the scrutiny is completed, registered Oracles can set the results of a process

For more details, see the [implementation here](https://gitlab.com/vocdoni/dvote-solidity/raw/master/contracts/process.sol)

### Getters

- `get()`
    - Retrieves all the parameters and flags defined for the given process
- `getParamsSignature()`
    - Retrieves the signature of the parameters above
- `getResults()`
    - If available, returns the output of the scrutinizer uploaded by the Oracles
- `getCreationInstance()`
    - Returns the address of the process contract where the given process is hosted
    - Useful to determine where an update needs to be sent to (see Versioning next)

### Flags

When a process is created, the entity needs to define what options apply to it. The combination of them produces:

- The process `mode`
    - It determines the external behaviour of the process, when it starts, what can be updated, etc.
- The `envelopeType`
    - Determines the internal behaviour of the votes sent by participants.

#### Process Mode

The process mode affects both the Vochain, the contract itself and even the metadata. Its value is generated by combining the flags below.

```
0x00011111
     |||||
     ||||`- AUTO_START
     |||`-- INTERRUPTIBLE
     ||`--- DYNAMIC_CENSUS
     |`---- ALLOW_VOTE_OVERWRITE
     `----- ENCRYPTED_METADATA
```

##### AUTO_START

- `false` ⇒ Needs to be set to `READY` by the creator. Starts `PAUSED` by default.
- `true` ⇒ Will start by itself at block `startBlock`.

`newProcess()` enforces `startBlock` > 0 accordingly

##### INTERRUPTIBLE

- `false` ⇒ Only the Vochain can `END` the process at block `startBlock + blockCount`
- `true` ⇒ In addition to the above, the admin can `END`, `PAUSE` and `CANCEL`
    - Pausing a process prevents votes from being received, `blockCount` stays unchanged by now

##### DYNAMIC_CENSUS

- `false` ⇒ Census is immutable
- `true` ⇒ Census can be edited during the life-cycle of the process. Allowing to add, subtract new keys, or change the census entirely, to a process that has already started.
    - Intended for long-term polls
    - Warning: The admin has the opportunity to obscurely cheat by enabling keys and then removing them

##### ALLOW_VOTE_OVERWRITE

- `false` ⇒ Only the first vote is counted
- `true` ⇒ The last vote is counted. The previous vote can be overwritten up to `maxVoteOverwrites` times.

##### ENCRYPTED_METADATA

- `false` ⇒ The processMetadata should be in plain text
- `true` ⇒ The questions and options of a process should be encrypted, so an observer of the network won't be able to see what the process is about unless he/she has the key.

It requires a prior process to share the encryption key with the users with the right to read the data. This will be likely be handled by the `User Registry`.

#### Envelope Type

The envelope type tells how the vote envelope is formatted and handled. Its value is generated by combining the flags below.

```
0x00000111
       |||
       ||`- SERIAL
       |`-- ANONYMOUS
       `--- ENCRYPTED_VOTE
```

##### SERIAL

- `false` A single envelope is expected with all votes in it
- `true` An envelope needs to be sent for each question, as `questionIndex` increases

##### ANONYMOUS

- `false` The voter identity (public key) can be known and therefore, the vote is pseudonymous. If an observer can correlate the voter public key with personal data, the voter could be identified.
- `true` The voter public key can't be known. Instead, the voter will submit a ZK-snark proof, ensuring that:
  - He/she belongs to the census of the process
  - He/she has not already voted on the process

##### ENCRYPTED_VOTE

- `false` Votes are sent in plain text. Results can be seen in real time.
- `true` The vote payload will be encrypted. The results will become available once the encryption key is published at the end of the process by the miners.

### Process Status
The status of a process is a simple enum, defined as follows:

- `READY` (0)
  - The process is marked as ready. It is intended as a **passive authorization** to open the process
  - Vochain nodes will accept incoming votes if `AUTO_START` is disabled
  - Otherwise, they will accept votes when the Vochain block number reaches `startBlock`
- `ENDED` (1)
  - Tells the Vochain to stop accepting votes and start computing the results (if not already available)
  - Only when `INTERRUPTIBLE` is set
- `CANCELED` (2)
  - Tells the Vochain to stop accepting votes and drop the existing data. No results will be published.
  - Only when `INTERRUPTIBLE` is set
- `PAUSED` (3)
  - Tells the Vochain to stop processing votes temporarily. The process might be resumed in the future.
  - Only when `INTERRUPTIBLE` is set, or after creation if `AUTO_START` is not set
- `RESULTS` (4)
  - Set by the Oracle as soon as the results of a process have become available

### Versioning

Even if there are tools to deploy upgradeable smart contracts, we believe that newer versions of a contract should not be able to alter any of processes stored in the past. Data should remain available independently of future contract versions. In order to enforce transparency and full auditability:

- The upcoming contract version allows to keep historical data by forking and chaining new instances
- A common interface is available between old and new instances, so that compatibility is preserved
- When a new instance is deployed, it can have a **predecessor**, which may `activate` it as a **successor**
- From successors, clients can navigate back and read processes stored on old instances transparently
- New processes can only be created on the most recent successor

However:
- [Due to security concerns](https://solidity.readthedocs.io/en/v0.6.0/security-considerations.html#tx-origin), updates on a process coming from a successor are not acceptable
- Updates on legacy processes need to be sent directly to the original contract instance
- Use `getCreationInstance(processId)` to retrieve the appropriate address

## Data schema

### Process metadata (JSON)

The creation of this document is critical. Multiple checks should be in place to ensure that the data is coherent (well formatted, all relevant locales present, etc).

The JSON payload below is stored on IPFS.

```json
{
    "version": "1.0", // Protocol version
    "type": "snark-vote", // One of: snark-vote, poll-vote, encrypted-poll, petition-sign
    "startBlock": 10000, // Vochain block number to start the voting process
    "blockCount": 400,
    "census": {
        "merkleRoot": "0x1234...",
        "merkleTree": "ipfs://1234,https://server/file.dat!sha3-hash" // Content Hashed URI of the exported Merkle Tree
    },
    "details": {
        "entityId": "0x123",
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
                        "title": {
                            "en": "Yes",
                            "ca": "Sí"
                        },
                        "value": "1"
                    },
                    {
                        "title": {
                            "en": "No",
                            "ca": "No"
                        },
                        "value": "2"
                    }
                ]
            }
        ]
    }
}
```

### Vote Envelope

The Vote Envelope wraps different types of vote packages and features certain fields, depending on the underlying Vote Package Type

#### Containing Snark Votes

```json
{
    "processId": "0x1234567890...",
    "proof": "0x1234...",  // ZK Proof
    "nonce": "1234567890",  // Unique number per vote attempt, so that replay attacks can't reuse this payload
    "nullifier": "0x1234...",   // Hash of the private key + processId
    "encryptionKeyIndexes": [0, 1, 2, 3, 4],  // (optional) On encrypted votes, contains the (sorted) indexes of the keys used to encrypt
    "votePackage": "base64-vote-package"  // base64(jsonString) or base64( encrypt(jsonString) )
}
```

#### Containing Poll votes

The Vote Envelope of a Poll vote features the process ID, the Census Merkle Proof of the user, a nonce to prevent replay attacks and a Base64 representation of the Vote Package. The signature should be generated from a JSON object containing the keys in ascending alphabetical order.

```json
{
    "processId": "0x1234567890...",
    "proof": "0x1234...",  // Merkle Proof
    "nonce": "1234567890",  // Unique number per vote attempt, so that replay attacks can't reuse this payload
    "encryptionKeyIndexes": [0, 1, 2, 3, 4],  // (optional) On encrypted polls, contains the (sorted) indexes of the keys used to encrypt
    "votePackage": "base64-vote-package",  // base64(jsonString) or base64( encrypt(jsonString) )
    "signature": "0x12345678...",  // sign( JSON.stringify( { processId, proof, nonce, encryptionKeyIndexes?, votePackage } ), privateKey )
}
```

The `nullifier` to identify the vote in the blockchain is computed as follows: 

`nullifier = keccak256(bytes(hex(addr(signature))) + bytes(hex(processId)))`

### Vote Package

Is the actual data contained within a vote Envelope.

#### Snark Vote

Used for anonymous votes using ZK Snarks to restrict voters to only those on the Merke Tree.

```json
{
    "type": "snark-vote",
    "nonce": "01234567890abcdef", // 8+ byte random string to prevent guessing the encrypted payload before the reveal key is released
    "votes": [  // Direclty mapped to the `questions` field of the metadata
        1, 3, 2
    ]
}
```

- On encrypted votes, public keys must be used in ascending order.

#### Poll Vote

Non-anonymous votes, where the Merkle Proof and the signature are enough.

```json
{
    "type": "poll-vote",
    "nonce": "01234567890abcdef", // 8+ byte random string to prevent guessing the encrypted payload before the reveal key is released
    "votes": [  // Direclty mapped to the `questions` field of the metadata
        1, 3, 2
    ]
}
```

- The `nonce` is mandatory if the poll is encrypted. Can be omitted otherwise.
- On encrypted polls, public keys must be used in ascending order.

#### Petition Sign

(Coming soon)

<!--

(Petition signing)

```json
{
    "type": "petition-sign", // One of: snark-vote, poll-vote, encrypted-poll, petition-sign
    "nullifier": "0x1234...",   // Hash of the private key
    "votes": [  // Direclty mapped to the `questions` field of the metadata
        1
    ]
}
```

-->

### Results (JSON)

- Its hash is published in the voting-process smart-contract
- Sorting must match the `ProcessMetadata` questions.

```json

{
    "questions":[
        {
            "invalid": 0, 
            "results": [
                {
                    "count": 12342,
                    "value": "0" // Mataches the value in voteOption in ProcessMetadata
                },
                {
                    "count": 4321,
                    "value": "1"
                }
            ]
        },
        {
            "invalid": 0,
            "results": [
                {
                    "count": 12342,
                    "value": "0" 
                },
                {
                    "count": 4321,
                    "value": "1"
                }
            ]
        }
    ]
}

```

## Future work

### Define a versioning system
### Define sanity checks
There are serveral events where the process may be invalid.

- Process-metadata can't be fetched from IPFS
- Process-metadata field can't be parsed or does not exist
- Block-times have an invalid range. Define how far in the future they want the

Oracles must report them, and action should be taken if there is consensus.

### Oracles protocol

Most of the sanity check logic can't no longer be in the ethereum blockchain, therefore we need to define process/consensus mechanism for the oracles to report to the ethereum smart-contracts.

Oracles therefore must have an ethereum account, and it should be registered together with its public key

Oracles can complain when there is a problem.
```
complain(uint reason){}
```

If a pre-defined percentage of oracles agrees on a problem of a specific reason, the process can be invalidated.

```
invalidate(uint reason){}
```

Before the user is shown a process, it should've been validated that the process is all good. Therefore is probably a good idea that the validators approve the process at the beginning.

```
complain(0);
```

The same logic should be used for reporting the results

```
reportResults(string resultsHash){}
```

```
validateResults(){}
````

### Support multi-layer vote encryption

Define how multiple entities can publish the public and private key for vote encryption. So no single entity has privilege information.
