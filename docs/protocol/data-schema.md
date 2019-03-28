# Data schema

`The current contents are a work in progress`

## Origins

Many of the schemas below need to point to external data that may be available through different sources and channels.

In order to denominate them and provide a prioritized list of fallbacks in a single place, the following format is used, depending on the type of resource. 

### Content URI

Transfering data files may be done through Swarm, Swarm Feeds, IPFS and http/s. In order to use an ordered list of origins and fallbacks, Vocdoni defines data origins in a single field by using a **comma separated list of URI's** like the examples below:

- `bzz://<content-hash>,https://cloudflare-ipfs.com/ipfs/<your-ipfs-hash-here>`
    - First, try to fetch the given &lt;content-hash&gt; from Swarm
    - In case of error, attempt to fetch &lt;your-ipfs-hash-here&gt; from the IPFS gateway provided by CloudFlare
- `bzz-feed://<feed-hash>,ipfs://<content-hash>,https://<url>/<route>`
    - First, try to fetch the given feed from Swarm
    - In case of error, attempt to fetch the given content hash from IPFS
    - If both failed, attempt to fetch from a centralized fallback server

Supported protocols:

- `bzz://<contentHash>`
- `bzz-feed://<feedHash>`
- `ipfs://<contentHash>`
- `http://<url>/<route>`
- `https://<url>/<route>`

URI order matters:
- Clients are expected to try using URI's from left to right
- In the event of a mismatch, the data from the leftmost functional service is used

### Messaging URI

Intended for two-way communication between two nodes, a Messaging URI field looks similar to a Content URI:

- `pss://<publicKey@address>,pubsub://<topic>,shh://<publicKey>`
    - Attempt to use PSS in the first place, sending an encrypted message to the given address using the given public key
    - In case of error, attempt to post a message to the given topic on IPFS PubSub
    - If both fail, try to post a message to the given public key using Whisper

The messaging protocols supported are PSS, IPFS PubSub and Whisper:

- `pss://<publicKey@address>`
  - Uses Ethereum Swarm/PSS protocol
  - address can be empty
- `pubsub://<topic>`
  - Uses IPFS pubsub protocol
- `shh://<publicKey>`
  - Uses Ethereum Whisper protocol

URI order matters here too:
- Clients are expected to try using URI's from left to right
- In the event of a mismatch, the data from the leftmost functional service is used

## Entity metadata

Entities are able to create voting processes. As such, users need to be able to subscribe to them and retrieve basic information about the organization. 

The metadata of an entity is an aggregate of information living on the Blockchain and P2P filesystems. For a complete reference of every section, see the [Entity Resolver](/protocol/entity-metadata?id=entityresolver) contract and the [Data schema](/protocol/entity-metadata?id=data-schema) on the Entity metatdata chapter.

- [Entity metadata](/protocol/entity-metadata?id=entity-metadata-1)
- [Gateway boot nodes](/protocol/entity-metadata?id=gateway-boot-nodes)
- [Entities list](/protocol/entity-metadata?id=entities-list)
- [Feed](/protocol/entity-metadata?id=feed)
- [Actions](/protocol/entity-metadata?id=actions)

**Used in:**

- [Set Entity metadata](/protocol/sequence-diagrams?id=set-entity-metadata)
- [Entity subscription](/protocol/sequence-diagrams?id=entity-subscription)

**Related:**

- [Entity Smart Contract](https://github.com/vocdoni/dvote-solidity/blob/master/contracts/VotingEntity.sol)
- [Entity JS methods](https://github.com/vocdoni/dvote-js/blob/master/src/dvote/entity.ts)

--------------------------------------------------------------------------------

## Process Metadata

It holds all the details to display so that users can make a choice about a vote and allows Relays and Scrutinizers to fetch the technical parameters of a vote.

The creation of this document is critical. Multiple checks should be in place to ensure that the data is choerent (well formatted, all relevant locales present, etc).

The JSON payload below is typically stored on Swarm or IPFS, so anyone can fetch the metadata of a voting process through a decentralized channel.

```json
{
    "version": "1.0",    // Protocol version

    "name": "Basic income rule", // Human friendly name, not an identifier
    "address": "0x1234...", // Of the vote on the VotingProcesses smart contract
    
    "voteType": "single-choice", // Defines how the UI should allow to choose among the votingOptions.
    "proofType": "zk-snarks",  // Allowed ["zk-snarks", "lrs"]
    
    "question": {
        "default": "Should universal basic income become a human right?",
        "ca": "Estàs d'acord amb que la renda bàsica universal sigui un dret humà?"
    },
    "voteOptions": [
        {
            "default": "Yes" ,
            "ca": "Sí",
            "value": 1
        },
        {
            "default": "No",
            "ca": "No",
            "value": 2
        }
    ],
    "startBlock": 10000,
    "endBlock":  11000,
    "meta": {
        "description": {
            "default": "## Markdown text goes here\n### Abstract",
            "ca": "## El markdown va aquí\n### Resum"
        },
        "images": [ "<content uri>", ... ],
        "organizer": {
            "address": "0x1234...",  // Address of the Entity entry on the blockchain
            "resolver": "0x2345...",  // Address of the EntityResolver smart contract
            "metadata": "<content uri>" // Organizer's metadata
        }
    },
    "census": {
        "id": "entity-people-of-legal-age",  // Census ID to use
        "origin": "<messaging uri>", // Messaging URI of the Census Service to request data from
        "merkleRoot": "0x1234...",
        "modulusSize": 5000  // Only when type="lrs"
    },
    "publicKey": "0x1234...", // To encrypt vote packages

    // Only when voteType == "lrs"

    "modulusGroups": [
        { "publicKeyModulus": 0, "source": "<content uri>" },  // Resolves to a ModulusGroupArray (see below)
        { "publicKeyModulus": 1, "source": "<content uri>" },
        { "publicKeyModulus": 2, "source": "<content uri>" },
        ...
    ]
}
```

**Used in:**

- [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)
- [Voting process retrieval](/protocol/sequence-diagrams?id=voting-process-retrieval)
- [Casting a vote with ZK Snarks](/protocol/sequence-diagrams?id=casting-a-vote-with-zk-snarks)
- [Casting a vote with Linkable Ring Signatures](/protocol/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
- [Vote Scrutiny](/protocol/sequence-diagrams?id=vote-scrutiny)

**Related:**

- [Process Smart Contract](https://github.com/vocdoni/dvote-smart-contracts/blob/master/contracts/VotingProcess.sol)
- [Process JS methods](https://github.com/vocdoni/dvote-client/blob/master/src/dvote/process.ts)

**Notes:**

- The `type` field indicates the scrutiny method that will be used for the process. Any vote package generated with the wrong type will be discarded.
- The list of authorized relays is available on the Process smart contract

## Modulus Group Array

Linkable Ring Signatures allow to anonymize a signature within a group of keys. However, signing with the entire census for every single vote would mean storing and transfering very large amounts of data. 

A solution is to break a large census into smaller groups and anonymize signatures within groups of 500~1000 keys instead of any greater values. 

To this end, public keys are grouped by the modulus of dividing them by a predefined number. In order to store and fetch an array of keys from the Process Metadata, the following schema is used:

```json
{
    "publicKeyModulus": int,
    "publicKeys": [
        "0x1234...",
        "0x2345...",
        "0x3456...",
        ...
    ]
}
```

## Vote Package

### Vote Package - ZK Snarks

```json
{
    "version": "1.0",    // Protocol version
    "type": "zk-snarks-vote",
    "processAddress": "0x1234...",
    "nullifier": "0x1234...",
    "vote": "2"
}
```

It is encrypted within the corresponding [Vote Envelope](/protocol/data-schema?id=vote-envelope-zk-snarks)

**Used in:**

- [Casting a vote with ZK Snarks](/protocol/sequence-diagrams?id=casting-a-vote-with-zk-snarks)
- [Vote Scrutiny](/protocol/sequence-diagrams?id=vote-scrutiny)

### Vote Package - Ring Signature

```json
{
    "version": "1.0",    // Protocol version
    "type": "lrs-vote",
    "processAddress": "0x1234...",
    "nullifier": "0x1234...",
    "vote": "1"
}
```

It is encrypted within the corresponding [Vote Envelope](/protocol/data-schema?id=vote-envelope-ring-signature)

**Used in:**

- [Casting a vote with Linkable Ring Signatures](/protocol/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
- [Vote Scrutiny](/protocol/sequence-diagrams?id=vote-scrutiny)

## Vote Envelope

### Vote Envelope - ZK Snarks

```json
{
    "version": "1.0",    // Protocol version
    "type": "zk-snarks-envelope",
    "processAddress": "0x1234...",
    "encryptedPackage": "0x1234...",  // Serialized + encrypted payload of the vote package JSON
    "nullifier": "0x1234...",
    "proof": "01234...",
    "censusMerkleRoot": "0x1234..."
}
```

**Used in:**

- [Casting a vote with ZK Snarks](/protocol/sequence-diagrams?id=casting-a-vote-with-zk-snarks)
- [Vote Scrutiny](/protocol/sequence-diagrams?id=vote-scrutiny)

### Vote Envelope - Ring Signature

```json
{
    "version": "1.0",    // Protocol version
    "type": "lrs-envelope",
    "processAddress": "0x1234...",
    "encryptedPackage": "0x1234...",  // Serialized + encrypted payload of the vote package JSON
    "signature": "0x1234...", // The ring signature over the processAdress
    "publicKeyModulus": 4321,
    "censusMerkleRoot": "0x1234..."  // To identify the census version used
}
```

**Used in:**

- [Casting a vote with Linkable Ring Signatures](/protocol/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
- [Vote Scrutiny](/protocol/sequence-diagrams?id=vote-scrutiny)

## Vote Batch

```json
{
    "version": "1.0",    // Protocol version
    "type": "lrs", // or zk-snarks
    "relay": {
        "publicKey": "0x1234..."
    },
    "votes": [ // Vote Package, see above
        { ... },
        { ... },
        { ... }
    ]
}
```

**Used in:**

- [Registering a Vote Batch](/protocol/sequence-diagrams?id=registering-a-vote-batch)
- [Checking a submitted vote](/protocol/sequence-diagrams?id=checking-a-submitted-vote)
- [Vote Scrutiny](/protocol/sequence-diagrams?id=vote-scrutiny)

## Vote Summary

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

- [Vote Scrutiny](/protocol/sequence-diagrams?id=vote-scrutiny)

## Vote List

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

- [Vote Scrutiny](/protocol/sequence-diagrams?id=vote-scrutiny)

**Notes:**

- The current payload may lead to a size of several Gigabytes of data, which may not be suitable for mobile devices

## Content Data

Used to contain news and data posts.

```json
[{
    "guid": "123",
    "title": "New voting process available",
    "description": "Universal Basic Income announced",
    "pubDate": "2019-01-01T10:00:00.000Z",
    "content": "<h2>Universal Basic Income</h2><p>HTML content goes here</p>",
    "language": "en"
}]
```

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

- [Adding users to a census](/protocol/sequence-diagrams?id=adding-users-to-a-census)

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

- [Census service API specs](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp#api)

#### Census addBulk

`TODO`

#### Census setParams

`TODO`

Used in LRS to define the processId (useful to derive keys) and the maxSize of a census.


### Census Service response payload

```json
{
    "error": false,
    "response": "string"
}
```

## Gateway requests payload

### Fetch Census Proof
```json
{
  "method": "fetchCensusProof",
  "censusRootHash": "hexString",
  "pubKey": "hexString"
}
```
```json
{
  "error": bool,
  "response": ["iden3MkproofHexString"]
}
```
**Used in:**
- [Voting with zksnarks](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=casting-a-vote-with-zk-snarks)

### Fetch Process Ring
```json
{
  "method": "fetchProcessRing",
  "processId": "hexString",
  "modulus": int,
}
```
```json
{
  "error": bool,
  "response": ["pubKey1", "pubKey2", ...]
}
```
**Used in:**
- [Voting with LRS](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)

### Submit Ballot
```json
{
  "method": "submitVote",
  "type": "LRS/Snarks",
  "processId": "hexString",
  "content": "voteEnvelope",
  "relayPubKey": "hexString"
}
```

```json
{
  "error":bool,
  "response": []
}
```
**Used in:**
- [Voting with zksnarks](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=casting-a-vote-with-zk-snarks)
- [Voting with LRS](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)

### Check Vote Status
```json
{
  "method": "getVoteStatus",
  "processId": "hexString",
  "voteId": "hexString"
}
```

```json
{
  "error": bool,
  "response": ["status"]
}
```
**Used in:**
- [Checking a submitted vote](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=checking-a-submitted-vote)

### Fetch File
```json
{
  "method": "fetchFile",
  "uri": "uri"
}
```

```json
{
  "error": bool,
  "response": ["base64File"]
}
```
**Used in:**
- [Entity subscription](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=entity-subscription)
- [Voting process retrieval](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=voting-process-retrieval)
- [Checking a submitted vote](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=checking-a-submitted-vote)
- [Vote scrutiny](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=vote-scrutiny)

### Add File
Available only post-auth on trusted gateways
```json
{
  "method": "addFile",
  "type": "ipfs/swarm"
  "content": "base64File"
}
```

```json
{
  "error": bool,
  "response": ["uri"]
}
```
**Used in:**
- [Set Entity metadata](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=set-entity-metadata)
- [Voting process creation](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=voting-process-creation)
- [Vote scrutiny](https://vocdoni.io/docs/#/protocol/sequence-diagrams?id=vote-scrutiny)

...

## Relay requests payload

`Work in progress`

### Relay Vote Envelope (to the Blockchain)

...

### Confirm vote registration (to the client app)

...

**Notes:**

- See [Vote Package](/protocol/data-schema?id=vote-package) above
