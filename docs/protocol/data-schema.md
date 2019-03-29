# Data schema

Traditional systems like API's present simple scenarios, in which a centralized service defined how data should be encoded.

However, decentralized ecosystems like a distributed vote system need much stronger work on defining every interaction between any two peers on the network.

- [Data origins](#data-origins)
- [Entity Metadata](#entity-metadata)
- [Process Metadata](#process-metadata)
- [Modulus group list](#modulus-group-list)
- [Vote Package](#vote-package)
- [Vote Envelope](#vote-envelope)
- [Vote Batch](#vote-batch)
- [Vote Summary](#vote-summary)
- [Vote List](#vote-list)
- [JSON Feed](#json-feed)
- [Census Service requests](#census-service-requests)
- [Gateway requests](#gateway-requests)
- [Relay requests](#relay-requests)

## Data origins

Many of the schemas descussed below need to point to external data that may be available through various channels.

In order to denominate them and provide a prioritized list of fallbacks in a single place, **Content URI's** or **Messaging URI's** are used, depending on the type of resource. 

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
- `https://<url>/<route>`
- `http://<url>/<route>`

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

Entities are able to create voting processes. As such, users need to be able to subscribe to them and retrieve basic information about the entities they care about. 

The metadata of an entity is an aggregate of information living on the Blockchain and P2P filesystems. 
- Data on the blockchain provides durability and ensures integrity checking
- Data on P2P filesystems allows to transfer larger data objects in a more flexible way

The starting point is the **[Entity Resolver](/protocol/entity-metadata?id=entity-resolver)** contract, but it is tightly coupled with the **[JSON Entity Metadata](/protocol/entity-metadata?id=data-schema)** living on P2P filesystems.

**Please, refer to the [Entity Metadata](/protocol/entity-metadata?id=entity-metadata) section to get the full details on how an Entity works.**

**Used in:**

- [Set Entity metadata](/protocol/sequence-diagrams?id=set-entity-metadata)
- [Entity subscription](/protocol/sequence-diagrams?id=entity-subscription)

**Related:**

- [Entity Smart Contract](https://github.com/vocdoni/dvote-solidity/blob/master/contracts/VotingEntity.sol)
- [Entity JS methods](https://github.com/vocdoni/dvote-js/blob/master/src/dvote/entity.ts)

--------------------------------------------------------------------------------

## Process Metadata

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows Relays and Scrutinizers to fetch the technical parameters of a vote.

The metadata of voting process is also an aggregate of data from the Blockchain and P2P filesystems. 

The starting point is the **[Voting Process](/smart-contracts?id=voting-process)** contract, but it is tightly coupled with the **[JSON Process Metadata](/protocol/process-metadata)** living on P2P filesystems.

**Please, refer to the [Process Metadata](/protocol/process-metadata) section to get the full details on how a Process works.**

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

## Modulus group list

As [explained here](/protocol/franchise-proof?id=_2-create-census-rings), Linkable Ring Signatures allow to anonymize a signature within a group of keys. However, signing with the entire census for every single vote would mean storing and transfering very large amounts of data. 

A solution is to break a large census into smaller groups and anonymize signatures within groups of 800~1000 keys instead of any greater values. 

To this end, public keys are grouped by the modulus of dividing them by a predefined number. To store and fetch a specific array of keys from the Process Metadata, the following schema is used:

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

It is encrypted within the corresponding [Vote Envelope](#vote-envelope-zk-snarks)

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

It is encrypted within the corresponding [Vote Envelope](#vote-envelope-ring-signature)

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
    "encryptedPackage": "0x1234...",  // Serialized + encrypted payload of the JSON Vote Package
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
    "encryptedPackage": "0x1234...",  // Serialized + encrypted payload of the JSON Vote Package
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

## JSON Feed

Similar to RSS, official news and unidirectional rich content is expected to conform to the specs of a [JSON Feed](https://jsonfeed.org/) and be accessible through a [Content URI](#content-uri). 

## Census Service requests

Requests sent to the census service may invoke different operations.

Depending on the `method`, certain parameters are expected or optional:

### Census Service addClaim

```json
{
    "method": "addClaim",
    "censusId": "string",       // Where to add the claim
    "claimData": "string",      // Typically, a public key
    "signature": "string"
}
```
```json
{
    "error": false,
    "response": "string"
}
```

**Used in:**

- [Adding users to a census](/protocol/sequence-diagrams?id=adding-users-to-a-census)

### Census Service addClaimBulk

```json
{
    "method": "addClaimBulk",
    "censusId": "string",       // Where to add the claims
    "claimData": "string",      // Typically, a comma-separated list of public keys
    "signature": "string"
}
```
```json
{
    "error": false,
    "response": "string"
}
```

### Census Service getRoot

```json
{
    "method": "getRoot",
    "censusId": "string"
}
```
```json
{
    "error": false,
    "response": "string"
}
```

**Used in:**

- [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)

### Census Service setParams

```json
{
    "method": "setParams",
    "censusId": "string",       // Where to apply the new settings
    "processId": "string",
    "maxSize": "string",
    "signature": "string"
}
```
```json
{
    "error": false,
    "response": "string"
}
```

Used in LRS only.

**Used in:**

- [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)

### Census Service generateProof

```json
{
    "method": "generateProof",
    "censusId": "string",
    "claimData": "string",
    "rootHash": "optional-string"  // from a specific version
}
```
```json
{
    "error": false,
    "response": "string"
}
```

**Used in:**

- [Check census inclusion](/protocol/sequence-diagrams?id=check-census-inclusion)
<!-- - [Casting a vote with ZK Snarks](/protocol/sequence-diagrams?id=casting-a-vote-with-zk-snarks) -->

<!-- ### Census Service getChunk

```json
{
    "method": "getChunk",
    "censusId": "string",
    "rootHash": "optional-string",  // from a specific version
    "publicKeyModulus": 4321
}
```
```json
{
    "error": false,
    "response": "string"
}
```

**Used in:**

- [Casting a vote with Linkable Ring Signatures](/protocol/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
-->

<!-- ### Census Service checkProof

```json
{
    "method": "checkProof",
    "censusId": "string",
    "claimData": "string",
    "rootHash": "optional-string",  // from a specific version
    "proofData": "string"
}
```
```json
{
    "error": false,
    "response": "string"
}
```
-->

<!-- ### Census Service getIdx

```json
{
    "method": "getIdx",
    "censusId": "string",
    "claimData": "string",
    "rootHash": "optional-string"
}
```
```json
{
    "error": false,
    "response": "string"
}
```
-->

### Census Service dump

```json
{
    "method": "dump",
    "censusId": "string",
    "rootHash": "optional-string",
    "signature": "string"
}
```
```json
{
    "error": false,
    "response": "string"
}
```

**Used in:**

- [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)

Requests may be sent over HTTP/HTTPS, as well as PSS or IPFS pub/sub.

**Related:**

- [Census service API specs](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp#api)


## Gateway requests

### Add Census Claim
```json
{
  "method": "addCensusClaim",
  "censusId": "hexString",
  "censusOrigin": "hexString",
  "claimData": "hexString"
}
```
```json
{
  "error": bool
}
```
**Used in:**
- [Adding users to a census](vocdoni.io/docs/#/protocol/sequence-diagrams?id=adding-users-to-a-census)

### Get Census Root
```json
{
  "method": "getCensusRoot",
  "censusId": "hexString"
}
```
```json
{
  "error": bool,
  "rootHash": "hexString"
}
```
**Used in:**
- [Voting process creation](http://vocdoni.io/docs/#/protocol/sequence-diagrams?id=voting-process-creation)

### Census Dump
```json
{
  "method":"censusDump",
  "censusId": "hexString",
  "signature": "hexString"
}
```
```json
{
  "error": bool,
  "merkleTree": "hexString"
}
```
**Used in:**
- [Voting process creation](http://vocdoni.io/docs/#/protocol/sequence-diagrams?id=voting-process-creation)


### Fetch Census Proof
```json
{
  "method": "fetchCensusProof",
  "censusRootHash": "hexString",
  "publicKey": "hexString"
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

### Fetch Census Ring
```json
{
  "method": "fetchCensusRing",
  "processId": "hexString",
  "publicKeyModulus": int
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

### Submit Vote Envelope
```json
{
  "method": "submitVoteEnvelope",
  "type": "zk-snarks-envelope",  // valid: ["zk-snarks-envelope", "lrs-envelope"]
  "processId": "hexString",
  "content": "voteEnvelope",
  "relayPublicKey": "hexString"
}
```
```json
{
  "error": bool,
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
  "type": "ipfs/swarm",
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

## Relay requests

`Work in progress`

### Relay Vote Envelope (to the Blockchain)

...

### Confirm vote registration (to the client app)

...

**Notes:**

- See [Vote Package](/protocol/data-schema?id=vote-package) above
