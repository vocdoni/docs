# Census Service

`Abstract here`

- [Data Schemas](#data-schemas)
- [Request and response schemas](#request-and-response-schemas)

## Data Schemas

### Modulus group list

As [explained here](/architecture/protocol/franchise-proof?id=_2-create-census-rings), Linkable Ring Signatures allow to anonymize a signature within a group of keys. However, signing with the entire census for every single vote would mean storing and transfering very large amounts of data. 

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

**Sequence diagrams**:
- [Voting process creation](/architecture/sequence-diagrams?id=voting-process-creation)

---

## Request and response schemas

Requests sent to the census service may invoke different operations. Depending on the `method`, certain parameters are expected or optional:

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

- [Adding users to a census](/architecture/sequence-diagrams?id=adding-users-to-a-census)

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

- [Voting process creation](/architecture/sequence-diagrams?id=voting-process-creation)

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

- [Voting process creation](/architecture/sequence-diagrams?id=voting-process-creation)

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

- [Check census inclusion](/architecture/sequence-diagrams?id=check-census-inclusion)
<!-- - [Casting a vote with ZK Snarks](/architecture/sequence-diagrams?id=casting-a-vote-with-zk-snarks) -->

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

- [Casting a vote with Linkable Ring Signatures](/architecture/sequence-diagrams?id=casting-a-vote-with-linkable-ring-signatures)
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

- [Voting process creation](/architecture/sequence-diagrams?id=voting-process-creation)

Requests may be sent over HTTP/HTTPS, as well as PSS or IPFS pub/sub.

**Related:**

- [Census service API specs](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp#api)

