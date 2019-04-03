# Relay

`Abstract here`

- [Data Schemas](#data-schemas)
- [Request and response schemas](#request-and-response-schemas)

## Data Schemas

The following are data payloads that are packaged by a client app and be eventually persisted.

### Vote Package

#### Vote Package - ZK Snarks

```json
{
    "version": "1.0",    // Protocol version
    "type": "zk-snarks-vote",
    "processAddress": "0x1234...",
    "nullifier": "0x1234...",
    "vote": "2"
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
    "processAddress": "0x1234...",
    "nullifier": "0x1234...",
    "vote": "1"
}
```

It is encrypted within the corresponding [Vote Envelope](#vote-envelope-ring-signature)

**Used in:**

- [Casting a vote with Linkable Ring Signatures](/architecture/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

### Vote Envelope

#### Vote Envelope - ZK Snarks

```json
{
    "version": "1.0",    // Protocol version
    "type": "zk-snarks-envelope",
    "processAddress": "0x1234...",
    "encryptedPackage": "0x1234...",  // Serialized + encrypted payload of the JSON Vote Package
    "nullifier": "0x1234...",
    "proof": "01234...",
    "censusMerkleRoot": "0x1234..."
}
```

**Used in:**

- [Casting a vote with ZK Snarks](/architecture/sequence-diagrams?id=casting-a-vote-with-zk-snarks)
- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

#### Vote Envelope - Ring Signature

```json
{
    "version": "1.0",    // Protocol version
    "type": "lrs-envelope",
    "processAddress": "0x1234...",
    "encryptedPackage": "0x1234...",  // Serialized + encrypted payload of the JSON Vote Package
    "signature": "0x1234...", // The ring signature over the processAdress
    "publicKeyModulus": 4321,
    "censusMerkleRoot": "0x1234..."  // To identify the census version used
}
```

**Used in:**

- [Casting a vote with Linkable Ring Signatures](/architecture/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

### Vote Batch

```json
{
    "version": "1.0",    // Protocol version
    "type": "lrs", // or zk-snarks
    "relay": {
        "publicKey": "0x1234...",
        "signature": "0x2345..."   // signed hash of the strinfigied array data from "votes"
    },
    "votes": [ // Vote Package, see above
        { ... },
        { ... },
        { ... }
    ]
}
```

**Used in:**

- [Registering a Vote Batch](/architecture/sequence-diagrams?id=registering-a-vote-batch)
- [Checking a submitted vote](/architecture/sequence-diagrams?id=checking-a-submitted-vote)
- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

### Vote Summary

```json
{
    "version": "1.0",    // Protocol version
    "process": {
        "name": "Basic income rule",
        "address": "0x1234...", // on the blockchain
        "question": "Should basic income be a human right?",
        "voteOptions": [
            { "name": "Yes", "value": 1 },
            { "name": "No", "value": 2 },
            { "name": "I don't know", "value": 3 }
        ],
    },
    "organizer": {
        "address": "0x1234...",  // Address of the Entity entry on the blockchain
        "metadata": "<content uri>" // Organizer's metadata on Swarm
    },
    "results": {
        "1": 12345678,
        "2": 23456789,
        "3": 34567890
    }
}
```

**Used in:**

- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

### Vote List

```json
{
    "version": "1.0",    // Protocol version
    "process": {
        "name": "Basic income rule",
        "address": "0x1234...", // on the blockchain
        "question": "Should basic income be a human right?",
        "voteOptions": [
            { "name": "Yes", "value": 1 },
            { "name": "No", "value": 2 },
            { "name": "I don't know", "value": 3 }
        ],
    },
    "organizer": {
        "address": "0x1234...",  // Address of the Entity entry on the blockchain
        "metadata": "<content uri>" // Organizer's metadata on Swarm
    },
    "votes": {
        "valid": [{
            "nullifier": "0x1234...",
            "vote": 1,
            "batchId": "0x1234..."
        }],
        "invalid": [{
            "reason": "invalid-relay",
            "package": { ... }  // original vote package
        }, {
            "reason": "duplicate-vote",
            "batchId": "0x1234...",
            "package": { ... }  // original vote package
        }, {
            "reason": "invalid-proof",
            "batchId": "0x1234...",
            "package": { ... }  // original vote package
        }, {
            "reason": "invalid-signature",
            "batchId": "0x1234...",
            "package": { ... }  // original vote package
        }, {
            "reason": "invalid-vote-value",
            "batchId": "0x1234...",
            "package": { ... }  // original vote package
        }]
    }
}
```

**Used in:**

- [Vote Scrutiny](/architecture/sequence-diagrams?id=vote-scrutiny)

**Notes:**

- The current payload may lead to a size of several Gigabytes of data, which may not be suitable for mobile devices

---

## Request and response schemas

`TODO: Define the format of incoming requests`
