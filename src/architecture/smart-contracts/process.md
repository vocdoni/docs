# Process Contract

A process is the building block around which governance is made in Vocdoni. Similarly to an Operating System, think of the Processes contract like a Kernel that receives syscalls to spawn a new governance process.

Governance processes span across three different components: the Ethereum smart contract, IPFS to ditribute [the vote metadata](/architecture/data-schemes/process.html#process-metadata) and the [Vochain](/architecture/services/vochain).

Processes follow a declarative fashion. The expected behavior is declared on the smart contract for integrity and then the voting blockchain (called [Vochain](/architecture/services/vochain)) reacts according to the current settings.

The instance of the Voting process contract is resolved from `processes.vocdoni.eth` on the ENS registry.

- [Contract structs](#contract-structs)
- [Process ID](#process-id)
- [Methods](#methods)
- [Getters](#getters)
- [Flags](#flags)
- [Status](#process-status)
- [Transparent upgrades](#transparent-upgrades)

### Contract structs

```solidity

// GLOBAL STRUCTS

struct Process {
    uint8 mode; // The selected process mode. See: https://vocdoni.io/docs/#/architecture/smart-contracts/process.html#flags
    uint8 envelopeType; // One of valid envelope types, see: https://vocdoni.io/docs/#/architecture/smart-contracts/process.html#flags
    CensusOrigin censusOrigin; // How the census proofs are computed (Off-chain vs EVM Merkle Tree)

    address entity; // The address of the Entity (or contract) holding the process
    uint32 startBlock; // Vochain block number on which the voting process starts
    uint32 blockCount; // Amount of Vochain blocks during which the voting process should be active

    string metadata; // Content Hashed URI of the JSON meta data (See Data Origins)
    string censusRoot; // Hex string with the Census Root. Depending on the census origin, it will be a Merkle Root or a public key.
    string censusUri; // Content Hashed URI of the exported Merkle Tree (not including the public keys)

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

    uint256 evmBlockHeight; // EVM block number to use as a snapshot for the on-chain census

    bytes32 paramsSignature; // entity.sign({...}) // fields that the oracle uses to authenticate process creation
}
```

### Process ID

Processes are uniquely identified by their `processId`

It is the result of combining and hashing these three values:
- `entityAddress`
- `processCountIndex`
- `namespace`

```solidity
function getNextProcessId(address entityAddress) public view override returns (bytes32) {
    // From 0 to N-1, the next index is N
    uint256 processCount = getEntityProcessCount(entityAddress);
    return getProcessId(entityAddress, processCount, namespaceId, ethChainId);
}

function getProcessId(address entityAddress, uint256 processCountIndex, uint32 namespaceIdNum, uint32 ethereumChainId) public pure override returns (bytes32) {
    return keccak256(abi.encodePacked(entityAddress, processCountIndex, namespaceIdNum, ethereumChainId));
}
```

Where:
- `entityAddress` is the Ethereum address that creates the process (or the token address)
- `entityProcessCount` is an incremental nonce per `entityAddress`
- `ethereumChainId` is the Ethereum chain Id where this contract has been deployed to
- `namespaceId` is a number that the process contract is assigned when it is deployed. See the [Namespace contract](/architecture/smart-contracts/namespace)

### Methods

- `newProcess()`
    - Sets the parameters of a new process to be run on the Vochain
    - If `processPrice` is defined to prevent spam, the transaction must include a `value` with at least such amount.
- `setStatus()`
    - With the appropriate flags, the creator can set the process to be `READY`, `ENDED`, `CANCELED` or `PAUSED`.
    - See [process status](#status) below
- `incrementQuestionIndex()`
    - With the appropriate flags, the creator can define the question that can be voted on
- `setCensus()`
    - With the appropriate flags, the creator can update the census for long lasting polls

For more details, you can see the [implementation here](https://github.com/vocdoni/dvote-solidity/blob/main/contracts/processes.sol)

### Getters

- `get()`
    - Retrieves all the parameters and flags defined for the given process
- `getParamsSignature()`
    - Retrieves the signature of the parameters above
- `getCreationInstance()`
    - Returns the address of the process contract where the given process is hosted
    - Useful to determine where an update needs to be sent to (see Transparent upgrades next)

### Flags

When a process is created, the entity needs to define what options apply to it. The combination of them produces:

- The process `mode`
    - It determines the external behavior of the process, when it starts, what can be updated, etc.
- The `envelopeType`
    - Determines the internal behavior of the votes sent by participants.
- The `censusOrigin`
    - Determines the way to compute and validate the voter's census proofs

There is the case where the entity wants to start the process as soon as possible. Because of the nature
of a blockchain it is not possible to know at which block a transaction will be mined/sealed and selecting
an approximate block number in the future could not work if the block number selected is very close to the current
block number. 
For these cases an entity can use a special block number `startBlock = 1` if the process mode flag `AUTO_START` is
set to `true`. If a process is created with this flags the `startBlock` of the process will be changed by the Oracles
sending the transaction to the Vochain and will be set to the current Vochain block plus some delay to ensure the
that the `startBlock` is never less than the current Vochain block.
The process will be ready to receive votes as soon as the transaction sended by the Oracles is mined.

#### Process Mode

The process mode affects both the Vochain, the contract itself and even the metadata. Its value is generated by combining the flags below.

```
0b00011111
     |||||
     ||||`- autoStart
     |||`-- interruptible
     ||`--- dynamicCensus
     |`---- encryptedMetadata
     `----- preRegister
```

##### AUTO_START

- `false` ⇒ The process needs to be set to `READY` by the creator before it can start. Processes start `PAUSED` by default.
- `true` ⇒ Votes will be processes starting at block `startBlock`.

`newProcess()` enforces `startBlock` > 0 accordingly

##### INTERRUPTIBLE

- `false` ⇒ The Vochain will `END` the process when the block `startBlock + blockCount` is reached
- `true` ⇒ In addition to the above, the admin can `END`, `PAUSE` and `CANCEL` it
    - Pausing a process prevents votes from being received and `blockCount` stays unchanged by now

##### DYNAMIC_CENSUS

- `false` ⇒ The census is immutable
- `true` ⇒ The census can be edited during the life-cycle of the process. Allowing to add, subtract new keys, or change the census entirely, to a process that has already started.
    - Intended for low stake, long-term polls only
    - Warning: The admin would have the opportunity to cheat by enabling keys and then removing them later on

##### ENCRYPTED_METADATA

- `false` ⇒ The processMetadata should be in plain text
- `true` ⇒ The questions and options of a process should be encrypted, so an observer of the network won't be able to see what the process is about unless he/she has the key.

It requires a prior process to share the encryption key with the users with the right to read the data. This will be likely be handled by the `User Registry`.

##### PRE_REGISTER
- `false` ⇒ The `CensusRoot` will be defined through a phase where the users need to register, using the `CensusRegisterProof` depending on the `CensusOrigin` of the process.
- `true` ⇒ The `CensusRoot` is directly defined in the `newProcessTx`.

#### Envelope Type

The envelope type tells how the vote envelope is formatted and handled. Its value is generated by combining the flags below.

```
0b00011111
     |||||
     ||||`- serial
     |||`-- anonymous
     ||`--- encryptedVote
     |`---- uniqueValues
      `---- costFromWeight 
```

##### SERIAL

- `false` A single envelope is expected with all votes in it
- `true` An envelope needs to be sent for each question, as `questionIndex` is incremented

##### ANONYMOUS

- `false` The voter identity (public key) can be known and therefore, the vote is pseudonymous. If an observer can correlate the voter public key with personal data, the voter could be identified.
- `true` The voter public key can't be known. Instead, the voter will submit a ZK-snark proof, ensuring that:
  - He/she belongs to the census of the process
  - He/she has not already voted on the process

##### ENCRYPTED_VOTE

- `false` Votes are sent in plain text. Results can be seen in real time.
- `true` The vote payload will be encrypted. The results will become available once the encryption key is published at the end of the process by the miners.

##### UNIQUE_VALUES

- `false` The same vote value can be chosen more than once
- `true` Choices must be unique across a field

##### COST_FROM_WEIGHT

- `true` On EVM-based census processes (weighted), the user's balance will be used as the `maxCost`. This allows splitting the voting power among several choices, even including quadratic voting scenarios.
- `false` The max cost will be taken from the value on the smart contract, being the same for everyone.

#### Census Origin

The census origin is an unsigned integer holding a value defined by the following enumeration:

- `OFF_CHAIN_TREE` (1)
    - An exhaustive Merkle Tree contains the list of (hashed) keys allowed to vote and its root is stored on `censusRoot`.
- `OFF_CHAIN_TREE_WEIGHTED` (2)
    - An exhaustive Merkle Tree contains the list of (hashed) keys allowed to vote and their respective voting power. Its root is also stored on `censusRoot`.
- `OFF_CHAIN_CA` (3)
    - A certification authority issues signatures for all eligible voters on a per-process basis. The public key of the CA is stored on `censusRoot`.
- `ERC20` (11)
    - All the token holders of an ERC20 token (under the contract at the address of `entity`) are eligible to vote. `censusRoot` contains the storage (Merkle) root of the token contract at the `evmBlockHeight`.
- `ERC721` (12)
    - Same as the ERC20 case, but for ERC721 contracts
- `ERC1155` (13)
    - Same as the ERC20 case, but for ERC1155 contracts
- `ERC777` (14)
    - Same as the ERC20 case, but for ERC777 contracts
- `MINI_ME` (15)
    - Same as the ERC20 case, but for MiniMe (ERC20) contracts

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
  - Set by the Oracle from the Results contract as soon as the tally of a process has become available

### Transparent upgrades

Even if there are tools to deploy upgradeable smart contracts, we believe that newer versions of a contract should not be able to alter any of processes stored in the past. Existing data should remain intact, independently of future contract versions. In order to enforce transparency and full auditability:

- Upcoming contract versions allow to keep historical data by forking and chaining new instances
- A common interface is available between old and new instances, so that backwards compatibility is preserved
- When a new instance is deployed, it can have a **predecessor**, which can `activate` the new version as its **successor**
- New processes can only be created on the last successor of the chain
- From successors, clients can navigate back in time transparently and read processes stored on old instances

This behavior is encapsulated [into the `Chained`](https://github.com/vocdoni/dvote-solidity/blob/main/contracts/base.sol#L22) base contract. 

However:
- [Due to security concerns](https://solidity.readthedocs.io/en/v0.6.0/security-considerations.html#tx-origin), updates on a process coming from a successor are not acceptable
- Updates on legacy processes need to be sent directly to the original contract instance
- Use `getCreationInstance(processId)` to retrieve the appropriate address


