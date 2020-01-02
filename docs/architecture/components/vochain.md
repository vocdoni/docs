# Vochain

The Vochain is a *Proof-of-Authorithy* blockchain network that uses [Tendermint](https://tendermint.com/) as a consensus algorithm. The main purpose of Vochain is to register polls, votes and backing processes in a decentralized and verifiable way.

You can think in Vochain as a voting specific blockchain. Vochain has not cryptocurrency, gas or any kind of smart contract, it just has the core logic represented as a state machine that any participation process needs to follow.


## Overall

Many Vochains could exist, some might be ephemeral and others might be permanent.
It is important to mention that the details of each Vochain are indexed and lives on Ethereum mainnet.

Vocdoni uses Ethereum as the source of truth and with that we can do some cool things like having a versioning system for each blockchain or being able to prune all past and finished processes until the point of just having one hash representing all the history. Also we can use some interchain comunication in order to pass messages between blockchains and trigger some actions.

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vochain-overall.png" alt="Vochain overall architecture"/>
</div>

For the current version only one Vochain handling all processes will exist.

## How it works ?

The nicest thing with tendermint is that the [core](https://docs.tendermint.com/) handles the network and consensus layers, so you only need to implement the logic of the application (the state machine itself).

And what the state machine must accomplish ?
- Creation of a voting process
- Cancelation of an existing voting process
- Vote casting
- Vote accounting
- Processes accounting and validation

Imagine a regular voting process ... You need to identify yourself in order to know if you have the right to participate, then you go to you phisical/digital polling station and you cast a vote. Once done, at some point the process will end and the votes are counted one by one.

So that is exactly what Vochain does plus the processes storage.

The workflow from creating a process, voting and finalize the process is:
- The basic info for starting a process live in the Ethereum Mainnet and it can be created by an entity.
- At least one permissioned account (representing an entity) is permissioned to set the process attributes in a Ethereum smart-contract.
- A trusted oracle will see this new information and it will send a transaction `newProcessTx` to the Tendermint blockchain in order to add the new process.
- Once the process starts at some block (`startBlock`) any person/organization which is in the entity census can cast a vote from his/her/its smartphone `voteTx`.
- The vote is send to the gateway and at some point it will be added to the Tendermint blockchain (if complies with the requeriments, e.g: valid vote from a valid ID included in the census of a valid entity).
- At some point in the nearly future this process will finish and casting new votes will be disabled.
- When the process is finished, an authorized will eventually upload the process encryption keys for decripting the votes.
- At this point the whole process can be acounted, verified and will live in the blockchain forever (at least its merkle root if some pruning is applied).

Vochain also has some special transactions (can only be done by oracles) that allow to:
- Update the Tendermint validator list `AdminTx: Add/Remove Validator`.
- Add or remove the trusted oracle list `AdminTx: Add/Remove Oracle`(the ones who can comunicate with both Ethereum and Tendermint).
- Cancel an already existing voting process `cancelProcessTx` created by an entity.

## Network

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vochain-network.png" alt="Vochain network schema"/>
</div>

## Transaction Data Schemas

The following are data payloads that are packaged by a client app or an oracle and be eventually persisted.


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
- `Submit envelope to a process`
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

The info stored in Ethereum lives in a smart contract, defined [here](architecture/components/process?id=smart-contract)


## Trusted Oracle

The Oracle is a trusted machine that enables bidirectional comunication between Vochain like blockchains and specific process smart contracts living in Ethereum. Specifically the oracle is an ethereum and tendermint full node and also a decentralized storage machine that enables:

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

- Decentralized storage census imports. Once a process is created the census is imported from the decentralized storage.

*To be extended in a different page*

## Overall connections

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vochainconn.png" alt="Vochain connections schema"/>
</div>