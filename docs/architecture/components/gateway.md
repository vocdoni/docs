# Gateway

`Abstract here`


## Request and response schemas

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

### Add Census Claim Bulk

```json
{
  "method": "addCensusClaimBulk",
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
- [Adding users to a census](vocdoni.io/docs/#/architecture/sequence-diagrams?id=adding-users-to-a-census)

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
- [Voting process creation](http://vocdoni.io/docs/#/architecture/sequence-diagrams?id=voting-process-creation)

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
- [Voting process creation](http://vocdoni.io/docs/#/architecture/sequence-diagrams?id=voting-process-creation)


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
- [Voting with zksnarks](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=casting-a-vote-with-zk-snarks)

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
- [Voting with LRS](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)

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
- [Voting with zksnarks](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=casting-a-vote-with-zk-snarks)
- [Voting with LRS](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)

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
- [Checking a submitted vote](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=checking-a-submitted-vote)

### Fetch File
```json
{
  "method": "fetchFile",
  "uri": "<content uri>"
}
```

```json
{
  "error": bool,
  "response": ["base64Payload"]
}
```
**Used in:**
- [Entity subscription](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=entity-subscription)
- [Voting process retrieval](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=voting-process-retrieval)
- [Checking a submitted vote](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=checking-a-submitted-vote)
- [Vote scrutiny](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=vote-scrutiny)

### Add File

Available only post-auth on trusted gateways
```json
{
  "method": "addFile",
  "type": "swarm",         // Valid: ["ipfs", "swarm"]
  "content": "base64Payload"
}
```
```json
{
  "error": bool,
  "response": ["<content uri>"]
}
```
**Used in:**
- [Set Entity metadata](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=set-entity-metadata)
- [Voting process creation](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=voting-process-creation)
- [Vote scrutiny](https://vocdoni.io/docs/#/architecture/sequence-diagrams?id=vote-scrutiny)
