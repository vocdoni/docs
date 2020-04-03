# Vochain

Vochain is a *Proof-of-Authorithy* blockchain network that uses [Tendermint](https://tendermint.com/) as a consensus algorithm. The main purpose of Vochain is to register polls, votes, and backing processes in a decentralized and verifiable way.

You can think of Vochain as a blockchain specific to voting. Vochain has no cryptocurrency, gas, nor any kind of smart contract; it just has the core logic represented as a state machine that any participation process needs to follow.


## Overall

Many Vochains could exist, some might be ephemeral, and others might be permanent.
It is important to mention that the details of each Vochain are indexed and live on the Ethereum mainnet.

Vocdoni uses Ethereum as the source of truth. That has several advantages, like having a versioning system for each blockchain, and being able to prune all past and finished processes leaving only one hash representing all the history. We can also use interchain communication in order to pass messages between blockchains and trigger certain actions.

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vochain-overall.png" alt="Vochain overall architecture"/>
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
- The basic info for starting a process lives in the Ethereum Mainnet and it can be created by an entity.
- At least one permissioned account (representing an entity) is permissioned to set the process attributes in a Ethereum smart-contract.
- A trusted oracle will see this new information and will send a `newProcessTx` transaction to the Tendermint blockchain in order to add the new process.
- Once the process starts at some block (`startBlock`), any person/organization who is in the entity census can cast a `voteTx` vote from their smartphone.
- The vote is sent to the gateway, and at some point it will be added to the Tendermint blockchain (if it complies with the requirements, such as being a valid vote from a valid ID included in the census of a valid entity).
- At some point in the near future, the process will finish and casting of new votes will be disabled.
- Once the process is finished, an authorized can upload the process encryption keys to decrypt the votes.
- At this point the whole process can be accounted and verified, and will live in the blockchain forever (or just its merkle root if any pruning is done).

Vochain also has some special transactions for oracles, which allow them to:
- Update the Tendermint validator list: `AdminTx: Add/Remove Validator`
- Add or remove the trusted oracle list: `AdminTx: Add/Remove Oracle` (the ones who can communicate with both Ethereum and Tendermint)
- Cancel an already existing voting process created by an entity: `cancelProcessTx`

## Transaction Data Schemas

The following are data payloads that are packaged by a client app or an oracle, to be eventually persisted.


**Valid messages and args**

- `Create a process`
```json
{
    "encryptionPublicKeys": ["0x1234", "0x2345", "0x3456"],
    "entityId": "0x1234",
    "mkRoot": "0x1234",
    "mkUri": "ipfs://1234",
    "numberOfBlocks": 1000,
    "processId": "0x1234",
    "processType": "processType",
    "signature": "signature of all process the data made by an oracle",
    "startBlock": 10,
    "type": "newProcess"
}
```
- `Cancel a process`
```json
{
    "processId": "0x1234",
    "signature": "signature of all process the data made by an oracle",
    "type": "cancelProcess"
}
```
- `Submit an envelope to a process`
```json
{
    "nonce": "0x1234",
    "nullifier": "0x1234",
    "processId": "0x1234",
    "proof": "0x1234",
    "signature": "signature of all the data made by the client",
    "type": "vote",
    "vote-package": "the envelope itself encoded in b64"
}
```
- `Add an oracle`
```json
{
    "address": "0x1234",
    "nonce": "0x1234",
    "signature": "signature of all data made by the oracle",
    "type": "addOracle"
}
```
- `Remove an oracle`
```json
{
    "address": "0x1234",
    "nonce": "0x1234",
    "signature": "signature of all data made by the oracle",
    "type": "removeOracle"
}
```
- `Add a validator`
```json
{
    "address": "0x1234",
    "nonce": "0x1234",
    "power": "10",
    "signature": "signature of all data made by the oracle",
    "type": "addValidator"
}
```
- `Remove a validator`
```json
{
    "address": "0x1234",
    "nonce": "0x1234",
    "signature": "signature of all data made by the oracle",
    "type": "removeValidator"
}
```

The data stored in Ethereum lives in a [smart contract](architecture/components/process?id=smart-contract)


## Trusted Oracle

The Oracle is a trusted machine that enables bidirectional communication between Vochain-like blockchains and specific-process smart contracts living in Ethereum. Specifically, the oracle is a full node within both  ethereum and tendermint, and also acts as a decentralized storage machine which enables:

- Vochain and Ethereum events reading. The events are:
    - A new process is created.
    - An existing process is canceled.
    - An oracle address is added.
    - An oracle address is removed.
    - A tendermint miner address is added.
    - A tendermint miner address is removed.
    - The vochain genesis has changed.
    - The encryption private key for a process is published.
    - The results of a process are published.

- Decentralized storage census imports. Once a process is created, the census is imported from the decentralized storage.

*To be extended in a different page*

## Overall connections

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vochain-conn.png" alt="Vochain connections schema"/>
</div>
