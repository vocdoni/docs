# Census Service

- [Data Schemas](#data-schemas)
- [JSON API schemas](#json-api-schemas)
- [How census works](architecture/census)

The Census Service provides a service for both, organizations and users. Its purpose is to store and manage one or multiple census. A census is basically a list of public keys stored as a Merkle Tree.

The organizer can:

+ Create new census (it might be one per election process)
+ Store claims (a hash of a public key usually)
+ Export the claim list
+ Recover in any moment the Merkle Root
+ Publish the census to IPFS or other supported filesystem
+ Import the census from IPFS or other support filesystem

The user can:

+ Recover in any moment the Merkle Root
+ Given the content of a claim, get the Merkle Proof (which demostrates his public key is in the Census)
+ Check if a Merkle Proof is valid for a specific Merkle Root

The interaction with the Census Manager is handled trough a JSON API. The current API implementation of the Census service, can be exposed via HTTP(s), as part of the **go-dvote suit**, in two different ways:

+ the standalone [censusHTTP backend](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp) 
+ via the [dvote Gateway](https://github.com/vocdoni/go-dvote/tree/master/cmd/gateway)

In the future more implementations using diferent transport layers could also be developed (i.e using Whisper, PSS or PubSub).

#### censushttp

The `censushttp` can be executed as follows:

`./censushttp --port 1500 --logLevel debug --rootKey 347f650ea2adee1affe2fe81ee8e11c637d506da98dc16e74fc64ecb31e1bb2c1`

This command will launch an HTTP endpoint on port 1500. This endpoint is administrated by the ECDSA public key specified as `rootKey`. It's the only one who can create new census and assign other public keys as uniq managers of that census.

When using censushttp methods `publish` and `importRemote` are not available but `dump` and `importDump` can be used instead.

#### gateway

The `gateway` can be executed as follows:

`./gateway --censusApi --apiRoute /dvote --listenPort 9090 --allowPrivate --allowedAddrs da5807a5c23e1e5986116116892e0b53278d686f`

Then the gateway will expose the census API on a websockets HTTP endpoint `http://IP:9090/dvote`. If a storage has been enabled (IPFS by default) the census can be published and imported from the storage. Only `allowedAddrs` will be able to execute private methods (extracted from the ECDSA signature).

## JSON API schemas

Census Service interactions follow the [JSON API](/architecture/protocol/json-api) foundation.

Requests sent to a Census Service may invoke different operations. Depending on the `method`, certain parameters are expected or optional:

### Census Service addCensus

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
  "signature": "string"
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


### Census Service addClaim

**Private Method**

Adds a payload to the census Merkle Tree and returns the updated Root Hash
- In the case of public keys, the payload should be a Base64 encoded string with the Poseidon hash of the user's Public Key

```json
{
  "id": "req-12345678",
  "request": {
    "method": "addClaim",
    "censusId": "0x12345678/0x23456789", // where to add the claim (must already exist)
    "claimData": "string", // typically, a hash of a public key
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
    "request": "req-12345678", // request ID here as well, to check its integrity
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

**Used in:**

- [Adding users to a census](/architecture/sequence-diagrams?id=adding-users-to-a-census)

### Census Service addClaimBulk

**Private Method**

Adds a set of payloads to the census Merkle Tree and returns the updated Root Hash
- In the case of public keys, the payload should be a Base64 encoded string with the Poseidon hash of the user's Public Key
- If any of the claims could not be added, `invalidClaims` contains an array with the indexes that failed

```json
{
  "id": "req-2345679",
  "request": {
    "method": "addClaimBulk",
    "censusId": "0x12345678/0x23456789", // where to add the claims (must already exist)
    "claimsData": [  // typically, a list of hashes of public keys
        "string-0",
        "string-1",
        "string-2"
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
    "invalidClaims": [1, 2],   // string-1 and string-2 were not added
    "request": "req-2345679",
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
    "censusId": "0x12345678/0x23456789",
    "timestamp": 1556110671
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


### Census Service generateProof

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "genProof",
    "censusId": "0x123456789", // Merkle Root of the census for which the claim siblings are requested
    "claimData": "string" // the leaf for which the proof is requested
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

### Census Service checkProof

**Public Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "checkProof",
    "censusId": "0x123456789", // Merkle Root of the census for which the Merkle Tree's claim will be checked
    "claimData": "string", // the leaf for which data is requested
    "proofData": "hexString" // the siblings, same format obtainet in genProof
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

### Census dump

Dumps the entire content of the census as an array of hexStrings rady to be imported to another census service.

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
    "request": "req-12345678",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Census dump plain

Dumpcs the contents of a census in raw string format. Not valid to use with `importDump`.

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
    "request": "req-12345678",
    "timestamp": 1556110672
  },
  "signature": "0x1234..."
}
```

### Census import local dump

Only works with specific merkletree format used by `dump` method. To add a list of plain claims use `addClaimBulk` instead.

**Private Method**

```json
{
  "id": "req-12345678",
  "request": {
    "method": "importDump",
    "censusId": "0x12345678/0x23456789",
    "claimsData": "[hexString, hexString, ...]", // list of claims to import
    "timestamp": 1556110671
  },
  "signature": "string"
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

### Census publish

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
  "signature": "string"
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

### Census import remote

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
  "signature": "string"
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



----

## Resources

- [Census service HTTP(s) implementation](https://github.com/vocdoni/go-dvote/tree/master/cmd/censushttp)

