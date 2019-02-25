# Data schema

`The current contents are a work in progress`

### Entity metadata

```json
entityMetadata = {
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

The JSON structure is to be stored on IPFS or Swarm, so anyone can get the full metadata of an entity.

Used in:
* [Entity creation](/protocol/sequence-diagrams?id=entity-creation)
* [Entity subscription](/protocol/sequence-diagrams?id=entity-subscription)

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
