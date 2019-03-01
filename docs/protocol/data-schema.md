# Data schema

`The current contents are a work in progress`

## Origins

The metadata of entities and voting process may refer to data origins. Data can come from various origins, including decentralized filesystems as well as traditional HTTPS endpoints. Messaging can also come from PSS or IPFS PubSub nodes.

The list of potential origins can be as follows:

### Messaging URI

- `pss://<publicKey>`
- `pss://<publicKey>@<address>`
- `pubsub://<topic>`

### Content URI

- `bzz://<contentHash>`
- `bzz-feed://<feedHash>`
- `ipfs://<contentHash>`
- `http://<url>/<route>`
- `https://<url>/<route>`

## Entity metadata

The JSON payload below is to be stored on Swarm or IPFS, so anyone can fetch the metadata of an entity through a decentralized channel.

```json
{
    "address": "0x1234...",
    "name": "The Entity",
    "home": "https://www.the-entity.org/",
    "actions": [{
        "name": "Sign up to The Entity", // Optional array of custom actions
        "type": "browser",
        "url": "https://process-manager.domain/sign-up/",
        "parameters": {
            // Tell our custom Process Manager what census service
            // to use when registering users
            "censusOrigin": "pss://<publicKey>",
            "censusId": "the-entity-main-census"
        }
    }]
}
```

**Used in:**
* [Entity creation](/protocol/sequence-diagrams?id=entity-creation)
* [Entity subscription](/protocol/sequence-diagrams?id=entity-subscription)

**Related:**
* [Entity Smart Contract](https://github.com/vocdoni/dvote-smart-contracts/blob/master/contracts/VotingEntity.sol)
* [Entity JS methods](https://github.com/vocdoni/dvote-client/blob/master/src/dvote/entity.ts)

## Process metadata

The JSON payload below is to be stored on Swarm or IPFS, so anyone can fetch the metadata of a voting process through a decentralized channel.

```json
{
    "name": "Basic income rule",
    "address": "0x1234...", // on the blockchain
    "question": "Should basic income be a human right?",
    "voteOptions": [
        { "name": "Yes", "value": 1 },
        { "name": "No", "value": 2 },
        { "name": "I don't know", "value": 3 }
    ],
    "type": "zk-snarks",  // Allowed ["zk-snarks", "lrs"]
    "startBlock": 10000,
    "endBlock":  11000,
    "meta": {
        "description": "## Markdown text goes here\n### Abstract",
        "images": [
            "bzz://<contentHash>",
            "bzz-feed://<feedHash>",
            "ipfs://<contentHash>",
            "http://<url>/image.jpg",
            "https://<url>/image.jpg"
        ],
        "organizer": {
            "address": "0x1234...",  // Address of the Entity entry on the blockchain
            "metadata": "bzz-feed://<feedHash>" // Organizer's metadata on Swarm
        }
    },
    "census": {
        "id": "the-entity-main-census",  // Census ID to use
        "origin": "pss://<publicKey>", // Census service to request data from
        // "origin": "pss://<publicKey>@<address>",
        // "origin": "https://<census-service-host>/",
        "merkleRoot": "0x1234...",
        "modulusSize": 5000           // Only when type="lrs"
    },
    "publicKey": "0x1234...", // To encrypt vote packages
    "relays": [{
        "origin": "pss://<publicKey>",
        // "origin": "pss://<publicKey>@<address>",
        "publicKey": "0x1234..."
    }],
    "gateways": [{
        "origin": "https://<url>/<route>"
    }]
}
```

**Used in:**
* [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)

**Related:**
* [Process Smart Contract](https://github.com/vocdoni/dvote-smart-contracts/blob/master/contracts/VotingProcess.sol)
* [Process JS methods](https://github.com/vocdoni/dvote-client/blob/master/src/dvote/process.ts)

**Notes:**
- The `type` field indicates the scrutiny method that will be used for the process. Any vote package generated with the wrong type will be discarded. 

## Vote Package

### Vote Package - ZK Snarks

```json
{
    "type": "zk-snarks",
    "processAddress": "0x1234...",
    "encryptedVote": "0x1234...",
    "nullifyer": "0x1234...",
    "proof": "01234...",
    "censusMerkleRoot": "0x1234..."
}
```

**Used in:**
- [Casting a vote with ZK Snarks](/protocol/sequence-diagrams?id=casting-a-vote-with-zk-snarks)

### Vote Package - Ring Signature

```json
{
    "type": "lrs",
    "processAddress": "0x1234...",
    "encryptedVote": "0x1234...",
    "signature": "0x1234...", // The ring signature over the processAdress
    "publicKeyModulus": 4321,
    "censusMerkleRoot": "0x1234..."
}
```

**Used in:**
- [Casting a vote with Linkable Ring Signatures](/protocol/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)

## Vote Batch

```json
{
    "type": "lrs", // or zk-snarks
    "relay": {
        "publicKey": "0x1234..."
    },
    "batch": [ // Vote Package, see above
        { ... },
        { ... },
        { ... }
    ]
}
```

**Used in:**
- [Registering a Vote Batch](/protocol/sequence-diagrams?id=registering-a-vote-batch)

## Census Service

### Census Service request payload

Requests sent to the census service may invoke different operations.

Depending on the `method`, certain parameters are expected or optional:

#### Census addClaim
```json
{
    "method": "addClaim",
    "censusId": "string",
    "claimData": "string",
    "signature": "string"
}
```

**Used in:**
* [Adding users to a census](/protocol/sequence-diagrams?id=adding-users-to-a-census)

#### Census getRoot
```json
{
    "method": "getRoot",
    "censusId": "string" 
}
```

**Used in:**
- [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)

#### Census genProof
```json
{
    "method": "genProof",
    "censusId": "string",
    "claimData": "string",
    "rootHash": "optional-string"  // from a specific version
}
```

**Used in:**
- [Check census inclusion](/protocol/sequence-diagrams?id=check-census-inclusion)
- [Casting a vote with ZK Snarks](/protocol/sequence-diagrams?id=casting-a-vote-with-zk-snarks)

#### Census getChunk
```json
{
    "method": "getChunk",
    "censusId": "string",
    "rootHash": "optional-string",  // from a specific version
    "publicKeyModulus": 4321
}
```

**Used in:**
- [Casting a vote with Linkable Ring Signatures](/protocol/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)

#### Census checkProof
```json
{
    "method": "checkProof",
    "censusId": "string",
    "claimData": "string",
    "rootHash": "optional-string",  // from a specific version
    "proofData": "string"
}
```

#### Census getIdx
```json
{
    "method": "getIdx",
    "censusId": "string",
    "claimData": "string",
    "rootHash": "optional-string"
}
```

#### Census dump
```json
{
    "method": "dump",
    "censusId": "string",
    "rootHash": "optional-string",
    "signature": "string"
}
```

**Used in:**
- [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)

Requests may be sent over HTTP/HTTPS, as well as PSS or IPFS pub/sub.

**Related:**

* [Census service API specs](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp#api)

### Census Serice response payload

```json
{
    "error": false,
    "response": "string"
}
```

### Gateway request payload

`Work in progress`

### Relay request payload

`Work in progress`

**Notes:**
- See [Vote Package](/protocol/data-schema?id=vote-package) above
