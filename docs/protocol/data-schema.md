# Data schema

`The current contents are a work in progress`

## Origins

The metadata of entities and voting process may refer to data origins. Data can come from various origins, including decentralized filesystems as well as traditional HTTPS endpoints. Messaging can also come from PSS or IPFS PubSub nodes.

The list of potential origins can be as follows:

### Messaging URI

Referd as `<messaging uri>` from now on.

- `pss://<publicKey@address>`
    - Uses Ethereum Swarm/PSS protocol
    - address can be empty
- `pubsub://<topic>`
    - Uses IPFS pubsub protocol
- `shh://<publicKey>`
    - Uses Ethereum Whisper protocol

### Content URI

Referd as `<content uri>` from now on.

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
            "censusOrigin": "<messaging uri>",
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
    "question": "Should basic income be a human right?",
    "voteOptions": [
        { "name": "Yes", "value": 1 },
        { "name": "No", "value": 2 },
        { "name": "I don't know", "value": 3 }
    ],
    "startBlock": 10000,
    "endBlock":  11000,
    "meta": {
        "description": "## Markdown text goes here\n### Abstract",
        "images": [ "<content uri>", ... ],
        "organizer": {
            "address": "0x1234...",  // Address of the Entity entry on the blockchain
            "metadata": "<content uri>" // Organizer's metadata on Swarm
        }
    },
    "census": {
        "id": "the-entity-main-census",  // Census ID to use
        "origin": "<messaging uri>", // Census service to request data from
        "merkleRoot": "0x1234..."
    },
    "publicKey": "0x1234...", // To encrypt vote packages
    "relays": [{
        "origin": "<messaging uri>"
    }],
}
```

**Used in:**
* [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)

**Related:**
* [Process Smart Contract](https://github.com/vocdoni/dvote-smart-contracts/blob/master/contracts/VotingProcess.sol)
* [Process JS methods](https://github.com/vocdoni/dvote-client/blob/master/src/dvote/process.ts)


## Vote Package

### ZK Snarks Vote Package

`Work in progress`

### Ring Signature Vote Package

`Work in progress`

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
    "rootHash": "optional-string"
}
```

**Used in:**
- [Check census inclusion](/protocol/sequence-diagrams?id=check-census-inclusion)
- [Get the Census Merkle Proof](/protocol/sequence-diagrams?id=get-the-census-merkle-proof)

#### Census checkProof
```json
{
    "method": "checkProof",
    "censusId": "string",
    "claimData": "string",
    "rootHash": "optional-string",
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
