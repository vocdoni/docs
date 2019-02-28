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
        "merkleRoot": "0x1234..."
    },
    "publicKey": "0x1234...", // To encrypt vote packages
    "relays": [{
        "origin": "pss://<publicKey>"
        // "origin": "pss://<publicKey>@<address>"
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


### Census Service request payload

Requests sent to the census service may invoke different operations (`method`).

Depending on the method, certain parameters are expected:

```json
{ "method": "addClaim", "censusId": "string", "claimData": "string", "signature": "string" }
{ "method": "getRoot", "censusId": "string" }
{ "method": "genProof", "censusId": "string", "claimData": "string", "rootHash": "optional-string" }
{ "method": "checkProof", "censusId": "string", "claimData": "string", "rootHash": "optional-string", "proofData": "string" }
{ "method": "getIdx", "censusId": "string", "claimData": "string", "rootHash": "optional-string" }
{ "method": "dump", "censusId": "string", "rootHash": "optional-string", "signature": "string" }
```

Requests may be sent over HTTP/HTTPS, as well as PSS or IPFS pub/sub.

* [Census service API specs](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp#api)

**Used in:**
* [Adding users to a census](/protocol/sequence-diagrams?id=adding-users-to-a-census)


### Gateway request payload

`Work in progress`

### Relay request payload

`Work in progress`
