# VocChain

The VocChain is a special Vocdoni PoA blockchain used to cast votes, polls and backing processes.

- [Data Schemas](#data-schemas)
- [JSON API schemas](#json-api-schemas)

## Overall

The VocChain is a Tendermint/Cosmos based blockchain. Many could exist, some might be ephemeral and others might be permanent. The details of each VocChain are indexed into Ethereum.

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vocchain-overall.png" alt="Vocchain overall architecture"/>
</div>

## Network

<div style="padding: 20px; background-color: white;">
	<img src="architecture/components/vocchain-network.png" alt="Vocchain network schema"/>
</div>

## Transaction Data Schemas

The following are data payloads that are packaged by a client app and be eventually persisted.

### Vote Package

#### Vote Package - ZK Snarks

```json
{
    "version": "1.0",    // Protocol version
    "type": "zk-snarks-vote",
    "processId": "0x1234...",
    "nullifier": "0x1234...",
    "vote": "0x1234...",
    "proof": "0x1234..."
}
```

It is encrypted within the corresponding [Vote Envelope](#vote-envelope-zk-snarks)

**Used in:**

- [Casting a vote with ZK Snarks](/architecture/sequence-diagrams?id=casting-a-vote-with-zk-snarks)
- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

#### Vote Package - Ring Signature

```json
{
    "version": "1.0",    // Protocol version
    "type": "lrs-vote",
    "processId": "0x1234...",
    "censusProof": "0x1234...",
    "vote": "0x1234...",
    "signature": "0x1234..."
}
```

It is encrypted within the corresponding [Vote Envelope](#vote-envelope-ring-signature)

**Used in:**

- [Casting a vote with Linkable Ring Signatures](/architecture/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

