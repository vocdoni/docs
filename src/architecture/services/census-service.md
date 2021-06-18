# Census Service

The Census Service provides a service for both organizations and users. Its purpose is to store and manage census, which are a list of public keys stored as a Merkle Tree.

The organizer can:

+ Create a new census
+ Add new claims to a census (hash of the public key)
+ Export the list of claims
+ Recover the Merkle Root
+ Publish the census to IPFS or similar
+ Import a census from IPFS

A user can:

+ Request the Merkle Root
+ Given a claim, request the Merkle Proof (the siblings allowing to prove that the claim matches the current root hash)
+ Check if a Merkle Proof is valid

## JSON API

The Census API interactions follow the [JSON API](/architecture/protocol/json-api).

### Add Census

**Private Method**

When using `censushttp` only the root key administration can create new census if `rootKey` specified.

When using the `gateway`, only the public keys specified in `--allowedAddrs` can create new census and the address is added automatically as prefix for the `censusId` (to avoid colision and for security reasons).

```json
{
  "id": "req-12345678",
  "request": {
    "method": "addCensus",
    "censusId": "<entropy-hash>", // Unique hex payload like the hash of the original census name
    "pubKeys": ["040012345...", "040123456...", "..."],  // hex pubKeys allowed to request private methods
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "ok": true,
    "censusId": "0x12345678.../<entropy-hash>", // The full census ID that any client should use from now on
    "request": "req-12345678", // request ID here as well, to check its integrity
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```


### Add Claim

**Private Method**

Adds a payload to the census Merkle Tree and returns the updated Root Hash
- If `digested` is `false`, the receiver will handle `censusKey` as a raw public key encoded in base64
  - The receiver should compute its Poseidon Hash and store it
- If `digested` is `true`, the receiver will handle `censusKey` as an already hashed public key, encoded in base64
  - The receiver should store `censusKey` as it is
- On weighted census, `censusValue` contains the amount of power that the given `censusKey` has

```json
{
  "id": "req-12345678",
  "request": {
    "method": "addClaim",
    "censusId": "0x12345678/0x23456789", // where to add the claim (must already exist)
    "digested": false,  // is the key digested? the Gateway should do it if not
    "censusKey": "base64-string", // usually the public key in base64 or its hash, also in base64
    "censusValue": "base64-string", // usually the numeric weight (big num). Can be empty (for non-weighted census)
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "ok": true,
    "root": "0x1234...",
    "request": "req-12345678", // request ID here as well, to check its integrity
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

**Used in:**

- [Adding users to a census](/architecture/sequence-diagrams?id=adding-users-to-a-census)

### Add Claim Bulk

**Private Method**

Adds a set of payloads to the census Merkle Tree and returns the updated Root Hash

- If `digested` is `false`, the receiver will handle `censusKey` as raw public keys encoded in base64
  - The receiver should compute their Poseidon Hashes and store them
- If `digested` is `true`, the receiver will handle `censusKey` as already hashed public keys, encoded in base64
  - The receiver should store `censusKeys` as they are
- If any of the claims could not be added, `invalidClaims` contains an array with the indexes that failed

```json
{
  "id": "req-2345679",
  "request": {
    "method": "addClaimBulk",
    "censusId": "0x12345678/0x23456789", // where to add the claims (must already exist)
    "digested": false,  // are the keys digested? the Gateway should do it if not
    "censusKeys": [  // the public keys in base64 or their hashes, also in base64
        "base64-string-1",
        "base64-string-2",
        "base64-string-3"
    ],
    "censusValues": [  // can be empty (for non-weighted census)
        "base64-string-1",
        "base64-string-2",
        "base64-string-3"
],
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "ok": true,
    "root": "0x1234...",
    "invalidClaims": [1, 2],   // string-1 and string-2 were not added
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Get Root

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "getRoot",
    "censusId": "0x12345678/0x23456789",
  },
  "signature": ""  // Leave empty
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "root": "0x1234...", // the current census root hash
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Get Size

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "getSize",
    "censusId": "0x12345678/0x23456789",
    "rootHash": "optional-hexString", // from a specific version
  },
  "signature": ""  // Leave empty
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "size": int64, // the current size of the census
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```


### Generate Proof

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "genProof",
    "censusId": "0x123456789", // Merkle Root of the census for which the claim siblings are requested
    "censusKey": "base64-string", // the leaf for which the proof is requested (base64 encoded)
    "censusValue": "hexString", // if weighted census, the hexadecimal representation of the numeric big num weight
    "digested": false,  // is the key digested? the backend should do it if not
    "rootHash": "optional-hexString" // from a specific version
  },
  "signature": ""  // Leave empty
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "siblings": "hexString",
    "request": "req-12345678",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Check Proof

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "checkProof",
    "censusId": "0x123456789", // Merkle Root of the census for which the Merkle Tree's claim will be checked
    "censusKey": "base64-string", // the leaf for which data is requested
    "censusValue": "hexString", // if weighted census, the hexadecimal representation of the weight big num
    "proofData": "hexString", // the siblings, same format obtained in genProof
    "digested": false,  // is the claim digested? the backend should do it if not
    "rootHash": "optional-hexString" // from a specific version
  },
  "signature": ""  // Leave empty
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "validProof": bool, // it's a valid proof or not
    "request": "req-12345678",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Census Dump

Dumps the entire content of the census as an array of hexStrings ready to be imported to another census service.

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "dump",
    "censusId": "0x12345678/0x23456789",
    "rootHash": "optional-hexString", // from a specific version
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "censusDump": "base64-string", // the serialized, base64 encoded, census data (for using with import)
    "request": "req-12345678",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Census Dump Plain

Dumps the content of the census in base64 format. The dump cannot be used afterwars with `importDump`.

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "dumpPlain",
    "censusId": "0x12345678/0x23456789",
    "rootHash": "optional-hexString", // from a specific version
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "censusKeys": [
        "base64-string",
        "base64-string",
        "base64-string"
    ],
    "censusValues": [ // can be empty if not weighted census
        "hexString-1",
        "hexString-2",
        "hexString-3",
    ]
    "request": "req-12345678",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Census Import Local Dump

Only works with specific merkle tree format used by `dump` method. To add a list of plain claims use `addClaimBulk` instead.

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "importDump",
    "censusId": "0x12345678/0x23456789", // the censusId where to import the data
    "censusDump": "base64-string", // serialized base64 encoded raw census data (generated with dump)
    "timestamp": 1556110671
  },
  "signature": "0x1234..."
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "request": "req-12345678",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Census Publish

Exports and publish the entire census on the storage of the backend (usually IPFS). Returns the URI.

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "publish",
    "censusId": "0x12345678/0x23456789",
    "rootHash": "optional-hexString", // the census snapshot to publish, if not specified, use the last one
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "request": "req-12345678",
    "uri": "uri-string", // where to find the census, i.e ipfs://Qmasdf94341...
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Census Import Remote

Import a previously published remote census. Only valid URIs accepted (depends on the backend).

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "importRemote",
    "censusId": "0x12345678/0x23456789",
    "uri": "uri-string", // where to find the remote census, i.e ipfs://Qmasdf94341...
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-12345678",
  "response": {
    "request": "req-12345678",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```


