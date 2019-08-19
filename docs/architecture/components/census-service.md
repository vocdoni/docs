# Census Service

- [Data Schemas](#data-schemas)
- [JSON API schemas](#json-api-schemas)
- [How census works](#census)

The Census Service provides a service for both, organizations and users. Its purpose is to store and manage one or multiple census. A census is basically a list of public keys stored as a Merkle Tree.

The organizer can:

+ Create new census (it might be one per election process)
+ Store claims (public keys)
+ Export the claim list
+ Recover in any moment the Merkle Root

The user can:

+ Recover in any moment the Merkle Root
+ Given the content of a claim, get the Merkle Proof (which demostrates his public key is in the Census)
+ Check if a Merkle Proof is valid for a specific Merkle Root


The interaction with the Census Manager is handled trough a JSON API. The current implementation of the Census service, exposes the API via HTTP(s), as part of the [go-dvote suit](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp) In the future more implementations using diferent transport layers could also be developed (i.e using Whisper, PSS or PubSub).

The `censushttp` can be executed as follows:

`./censushttp --port 1500 --logLevel debug --rootKey 347f650ea2adee1affe2fe81ee8e11c637d506da98dc16e74fc64ecb31e1bb2c1`

This command will launch an HTTP endpoint on port 1500. This endpoint is administrated by the ECDSA public key specified as `rootKey`. It's the only one who can create new census and assign other public keys as uniq managers of that census.

## JSON API schemas

Census Service interactions follow the [JSON API](/architecture/protocol/json-api) foundation.

Requests sent to a Census Service may invoke different operations. Depending on the `method`, certain parameters are expected or optional:

### Census Service addCensus

**Private Method**

Only the root key administration can create new census.

```json
{
  "id": "req-12345678",
  "request": {
    "method": "addCensus",
    "censusId": "hexString",       // Where to add the claim
    "pubKeys": ["pubKey1", "pubKey2", "..."],  // The list of pubkeys (hexStrings) for administration
    "timestamp": 1556110671
  },
  "signature": "string"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "ok": true,
    "request": "req-12345678",    // Request ID here as well, to check its integrity as well
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```


### Census Service addClaim

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "addClaim",
    "censusId": "hexString",       // Where to add the claim
    "claimData": "string",      // Typically, a public key
    "timestamp": 1556110671
  },
  "signature": "string"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "ok": true,
    "request": "req-12345678",    // Request ID here as well, to check its integrity as well
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

**Used in:**

- [Adding users to a census](/architecture/sequence-diagrams?id=adding-users-to-a-census)

### Census Service addClaimBulk

**Private Method**

```json
{
  "id": "req-2345679",
  "request": {
    "method": "addClaimBulk",
    "censusId": "hexString",       // Where to add the claims
    "claimsData": [             // Typically, a list of public keys
        "string",
        "string",
        "string"
    ],
    "timestamp": 1556110671
  },
  "signature": "string"
}
```
```json
{
  "id": "req-2345679",
  "response": {
    "ok": true,
    "request": "req-2345679",    // Request ID here as well, to check its integrity
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Census Service getRoot

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "getRoot",
    "censusId": "hexString",
    "timestamp": 1556110671
  },
  "signature": "string"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "root": "0x1234...",         // The root hash
    "request": "req-2345679",    // Request ID here as well, to check its integrity
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

**Used in:**

- [Voting process creation](/architecture/sequence-diagrams?id=voting-process-creation)

### Census Service generateProof

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "generateProof",
    "censusId": "hexString",
    "claimData": "string",             // The claim for which data is requested
    "rootHash": "optional-hexString",  // From a specific merkle tree snapshot
    "timestamp": 1556110671
  },
  "signature": "string"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "siblings": "hexString",
    "request": "req-12345678",    // Request ID here as well, to check its integrity as well
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

**Used in:**

- [Check census inclusion](/architecture/sequence-diagrams?id=check-census-inclusion)

### Census Service checkProof

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "checkProof",
    "censusId": "hexString",
    "claimData": "string",         // The claim for which data is requested
    "proofData": "hexString",     // The siblings, same format obtainet in genProof
    "timestamp": 1556110671
  },
  "signature": "string"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "validProof": bool,           // It's a valid proof or not
    "request": "req-12345678",    // Request ID here as well, to check its integrity as well
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

**Used in:**

- [Check census inclusion](/architecture/sequence-diagrams?id=check-census-inclusion)


### Census dump

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "dump",
    "censusId": "hexString",
    "rootHash": "optional-hexString",  // From a specific version
    "timestamp": 1556110671
  },
  "signature": "string"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "claimsData": [
        "hexString",
        "hexString",
        "hexString"
    ],
    "request": "req-12345678",    // Request ID here as well, to check its integrity as well
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

**Used in:**

- [Voting process creation](/architecture/sequence-diagrams?id=voting-process-creation)

### Census dump plain

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "dumpPlain",
    "censusId": "hexString",
    "rootHash": "optional-hexString",  // From a specific version
    "timestamp": 1556110671
  },
  "signature": "string"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "claimsData": [
        "string",
        "string",
        "string"
    ],
    "request": "req-12345678",    // Request ID here as well, to check its integrity as well
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```
### Census import

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "importDump",
    "censusId": "hexString",
    "claimsData": "[hexString, hexString, ...]",  // list of claims to import
    "timestamp": 1556110671
  },
  "signature": "string"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "claimsData": [
        "string",
        "string",
        "string"
    ],
    "request": "req-12345678",    // Request ID here as well, to check its integrity as well
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

----

## Resources

- [Census service HTTP(s) implementation](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp)

