# Vochain

Vochain is a *Proof-of-Authorithy* blockchain network that uses [Tendermint](https://tendermint.com/) as a consensus algorithm. The main purpose of Vochain is to register polls, votes, and backing processes in a decentralized and verifiable way.

You can think of Vochain as a blockchain specific to voting. Vochain has no cryptocurrency, gas, nor any kind of smart contract; it just has the core logic represented as a state machine that any participation process needs to follow.


## Overall

Many Vochains could exist, some might be ephemeral, and others might be permanent.
It is important to mention that the details of each Vochain are indexed and live on the Ethereum mainnet.

Vocdoni uses Ethereum as the source of truth. That has several advantages, like having a versioning system for each blockchain, and being able to prune all past and finished processes leaving only one hash representing all the history. We can also use interchain communication in order to pass messages between blockchains and trigger certain actions.

<div style="padding: 20px; background-color: white;">
	<img src="https://github.com/vocdoni/design/raw/main/docs/vochain-overall.png" alt="Vochain overall architecture"/>
</div>

For the current version, only one Vochain exists, which handles all processes.

## How does it work

The nicest thing about tendermint is that the [core](https://docs.tendermint.com/) handles the network and consensus layers, so you only need to implement the logic of the application - the state machine itself.

What must the state machine accomplish?
- Creation of a voting process
- Cancellation of an existing voting process
- Vote casting
- Vote accounting
- Process accounting and validation

Imagine a regular voting process. You first need to identify yourself to know if you have the right to participate. Then you visit your physical/digital polling station to cast your vote. Once done, at some point the process finishes and the votes are counted one by one.

Vochain does exactly the same, plus storing the processes.

The workflow from creating a process, voting, and finalizing the process, is:
- The basic info for starting a process lives in the Ethereum Mainnet or any other valid source.
- A trusted oracle will see this new information and will send a `newProcessTx` transaction to the Tendermint blockchain in order to add the new process, identified by `processId`.
- Once the process starts at some block (`startBlock`), any person/organization who is in the entity census can cast a `voteTx` vote from their smartphone.
- The vote is sent to a fullnode gateway, and at some point it will be added to the Tendermint blockchain (if it complies with the requirements, such as being a valid vote from a valid ID included in the census of a valid entity).
- Once the process is finished (by number of blocks) no more votes can be casted for the specific `processId`
- At this point the whole process can be accounted and verified, and will live in the blockchain.

Vochain also has some special transactions for oracles, which allow them to:
- Update the Tendermint validator list: `AdminTx: Add/Remove Validator`
- Add or remove the trusted oracle list: `AdminTx: Add/Remove Oracle` (the ones who can communicate with both Ethereum and Tendermint)
- Cancel an already existing voting process created by an entity: `cancelProcessTx`

A minimum of N/M oracle transactions are required in order to execute some functions (such as the ones below).

## Transaction Data Schemas

The following are data payloads that are packaged by a client app or an oracle, to be eventually persisted.


**Valid messages and args**

- `Create a process`
```json
{
    "entityId": "0x1234",
    "mkRoot": "0x1234",
    "mkUri": "ipfs://Qmp1234",
    "numberOfBlocks": 1000,
    "processId": "0x1234",
    "processType": "processType",
    "signature": "oracle signature",
    "startBlock": 10,
    "type": "newProcess"
}
```
- `Cancel a process`
```json
{
    "processId": "0x1234",
    "signature": "oracle signature",
    "type": "cancelProcess"
}
```
- `Submit an envelope to an on-going process`
```json
{
    "nonce": "0x1234",
    "nullifier": "0x1234",
    "processId": "0x1234",
    "proof": "0x1234",
    "encryptionKeyIndexes": [1,2,5],
    "signature": "voter signature",
    "type": "vote",
    "votePackage": "the envelope itself encoded in b64"
}
```
- `Add an oracle`
```json
{
    "address": "0x1234",
    "nonce": "0x1234",
    "signature": "oracle signature",
    "type": "addOracle"
}
```
- `Remove an oracle`
```json
{
    "address": "0x1234",
    "nonce": "0x1234",
    "signature": "oracle signature",
    "type": "removeOracle"
}
```
- `Add a validator`
```json
{
    "address": "0x1234",
    "nonce": "0x1234",
    "power": "10",
    "signature": "oracle signature",
    "type": "addValidator"
}
```
- `Remove a validator`
```json
{
    "address": "0x1234",
    "nonce": "0x1234",
    "signature": "oracle signature",
    "type": "removeValidator"
}
```

The data stored in Ethereum lives in a [smart contract](/architecture/components/process?id=smart-contract)


## Special actors

<div style="padding: 20px; background-color: white;">
	<img src="https://github.com/vocdoni/design/raw/main/docs/vochain-actors.png" alt="Vochain actors"/>
</div>


### Miner

As any other blockchain, Vochain requires a set of nodes able to include new transactions on the chain that will modify the state.
However all nodes of the network (miners or not) will execute the same transactions in the same way the miner does, so if there is something that does not follow the rules implemented on the Vochain logic, a new state will be computed and the chain will diverge (fork).

Currently as Vochain is proof-of-authority, only a set of nodes will be able to propose and include new blocks on the blockchain. These nodes (identified by a public key) are listed in the genesis file (the initial set) and later the list can be modified by executing the required transactions for doing so.

In the future, miners would get reward for validating new blocks and they would also be required to keep an economic stake on Ethereum in order to demonstrate its commitment for good behaviour.

### Oracle

The Oracle is a trusted identity that enables bidirectional communication between Vochain-like blockchains and specific-process smart contracts living in Ethereum. Specifically, the oracle is a full node within both  ethereum and tendermint, and also acts as a decentralized storage machine which enables Vochain and Ethereum events reading. The events are:

- A new process is created.
- An existing process is canceled.
- An oracle address is added.
- An oracle address is removed.
- A tendermint miner address is added.
- A tendermint miner address is removed.
- The vochain genesis has changed.
- The encryption private key for a process is published.
- The results of a process are published.
- ... more events comming with new features


*To be extended in a different page*

### KeyKeeper

The KeyKeeper is a trusted identity that act as temporary cryptographic key administrators. If an election is private or anonymous, keykeepers initially publish an addProcessKey transaction with a set of newly generated keys. At the end of the voting process, these keys will be revealed through a revealProcessKey transaction. As long as at least one keykeeper maintains integrity, no keykeepers will be able to act against the system’s specifications, maliciously or otherwise.

*To be extended in a different page*

### Scrutinizer

The scrutinizer is the component that tallies and decode/decrypt (if needed) each vote stored in the voting blockchain for each process of each entity. 

See the [Scrutinizer](/architecture/services/vochain/scrutinizer) section.

## Transaction lifecycle

In the following diagram the vote transaction lifecycle is shown. ChecTX, DeliverTX and Commit are the main steps of the Vochain. The first decides if a new transaction should be included in the mempool (and broadcasted to other peers), the second decides if a transaction that is going to be included in the next block is valid and the last makes the changes permanent and updates the state.

<div style="padding: 20px; background-color: white;">
	<img src="https://github.com/vocdoni/design/raw/main/docs/vochain-transaction-lifecicle.png" alt="Vochain transaction cicle"/>
</div>


### Coming next

See the [Census Service](/architecture/services/census-service) section.
