# Data schema

`The current contents are a work in progress`

**TODO**: 
- Entity ID detached from the creator's address
    - Add ID to the Entity metadata
    - Add Entity ID to processes

## Origins

### Messaging

- `pss://<publicKey>`
- `pss://<publicKey>@<address>`
- `pubsub://<topic>`

### Content

- `bzz://<contentHash>`
- `bzz-feed://<feedHash>`
- `ipfs://<contentHash>`
- `http://<url>/<route>`
- `https://<url>/<route>`


### Entity metadata

```json
{
    "name": "The Entity",
    "urls": {
        "home": "https://www.the-entity.org/"
    },
    "actions": [{
        "name": "Sign up to the Entity",
        "type": "url",
        "url": "https://process-manager.domain/sign-up/"
    }]
}
```

The JSON structure is to be stored on Swarm or IPFS, so anyone can get the full metadata of an entity.

Used in:
* [Entity creation](/protocol/sequence-diagrams?id=entity-creation)
* [Entity subscription](/protocol/sequence-diagrams?id=entity-subscription)

### Process metadata

```json
{
    "name": "Basic income rule",
    "question": "Should basic income be a human right?",
    "options": [
        { "name": "Yes", "value": 1 },
        { "name": "No", "value": 2 },
        { "name": "I don't know", "value": 3 }
    ],
    "startBlock": 10000,
    "endBlock":  11000,
    "meta": {
        "description": "## Markdown text goes here\n### Abstract",
        "images": [
            "https://server/image-1.jpg",
            "https://server/image-2.jpg",
            "swarm:<hash-3>",
            "ipfs:<hash-4>"
        ],
        "organizer": {
            "id": "0x1234...",  // address of the Entity
            "metadata": "swarm:<hash>" // hash of the metadata on Swarm
        }
    },
    "census": {
        "id": "census-1234",  // censusId
        "origin": "https://.../", // or pss:<publicKey> of the service to request data
        "merkleRoot": "0x1234..."
    },
    "publicKey": "0x1234...", // to encrypt vote packages
    "relays": [{
        "origin": "pss:<publicKey>" // or https://.../
    }]
}
```

The JSON structure is to be stored on Swarm or IPFS, so anyone can get the full metadata of a voting process.

Used in:
* [Voting process creation](/protocol/sequence-diagrams?id=voting-process-creation)

#### (Process metadata on the blockchain)
#### (Process metadata on dvote-js)


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

* [API specs here](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp#api)

Used in:
* [Adding users to a census](/protocol/sequence-diagrams?id=adding-users-to-a-census)
