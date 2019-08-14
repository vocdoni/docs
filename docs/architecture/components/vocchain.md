# VocChain

The VocChain is a *Proof-of-Authorithy* blockchain network that uses [Tendermint](https://tendermint.com/) as a consensus algorithm. The main purpose of VocChain is to register polls, votes and backing processes in a decentralized and verifiable way.

You can think in VocChain as a voting specific blockchain. VocChain has not cryptocurrency, gas or any kind of smart contract, it just has the core logic represented as a state machine that any participation process needs to follow.


## Overall

Many VocChains could exist, some might be ephemeral and others might be permanent.
It is important to mention that the details of each VocChain are indexed and lives on Ethereum mainnet.

Vocdoni uses Ethereum as the source of truth and with that we can do some cool things like having a versioning system for each blockchain or being able to prune all past and finished processes until the point of just having one hash representing all the history. Also we can use some interchain comunication in order to pass messages between blockchains and trigger some actions.

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vocchain-overall.png" alt="Vocchain overall architecture"/>
</div>

For the current version only one VocChain handling all processes will exist.

## How it works ?

The nicest thing with tendermint is that the [core](https://tendermint.com/docs/tendermint-core/) handles the network and consensus layers, so you only need to implement the logic of the application (the state machine itself).

And what the state machine must accomplish ?
- Creation of a process
- Vote casting
- Vote accounting
- Processes accounting and validation

Imagine a regular voting process ... You need to identify yourself in order to know if you have the right to participate, then you go to you phisical/digital polling station and you cast a vote. Once done, at some point the process will end and the votes are counted one by one.

So that is exactly what VocChain does plus the processes storage.

In the context of the VocChain things are going like this:
- The basic info for starting a process live in the Ethereum Mainnet and it can be created by an entity.
- At least one permissioned account (representing an entity) is permissioned to set the process attributes in a Ethereum smart-contract.
- A trusted oracle will see this new information and it will send a message `newProcessTx` to the Tendermint blockchain to add the new process
- Once the process starts any person/organization which is in the entity census can cast a vote from his/her/its smartphone `voteTx`.
- The vote is sent to the gateway and at some point it will be added to the Tendermint blockchain (if complies with the requeriments, e.g: valid vote from a valid ID included in the census of a valid entity).
- In the future this process will finish and casting new votes will be disabled.
- When the process is finished, an authorized will eventually upload the process encryption keys for decripting the votes.
- At this point the whole process can be acounted, verified and will live in the blockchain forever (at least its merkle root if some pruning is applied).

VocChain also has some special transactions that allow to:
- Update the validator list of tendermint
- Add or remove the trusted oracle list (the ones who can comunicate with both Ethereum and Tendermint)

## Network

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vocchain-network.png" alt="Vocchain network schema"/>
</div>

## Transaction Data Schemas

The following are data payloads that are packaged by a client app and be eventually persisted.

**Example**

```json
{
    "method": "validMethod",
    "args": {
        "a": "1", 
        "b": "2", 
        "c": "2"
    }
}

```

**Valid messages and args**

- `newProcessTx`
```json
{
    "method": "newProcessTx",
    "args": {
        "processId": "0x1",
        "entityResolver": "0x1234...",
        "metadatahash": "0x1234..."
    }
}
```
- `voteTx`
```json
{
    "method": "voteTx",
    "args": {
        "nullifier": "0x1",
        "payload": "0x1234...",
        "censusProof": "0x1234..."
    }
}
```
- `addTrustedOracleTx`
```json
{
    "method": "addTrustedOracleTx",
    "args": {
        "address": "0x1234..."
    }
}
```
- `removeTrustedOracleTx`
```json
{
    "method": "removeTrustedOracleTx",
    "args": {
        "address": "0x1234..."
    }
}
```
- `addValidatorTx`
```json
{
    "method": "addValidatorTx",
    "args": {
        "address": "0x1234..."
    }
}
```
- `removeValidatorTx`
```json
{
    "method": "removeValidatorTx",
    "args": {
        "address": "0x1234..."
    }
}
```

The info stored in Ethereum lives in a smart contract, defined [here](architecture/components/process?id=smart-contract) 

## Trusted Oracle

The Oracle is a trusted machine that enables bidirectional comunication between VocChain like blockchains and specific process smart contracts living in Ethereum.