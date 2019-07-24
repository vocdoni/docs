# JSON API

Most of the Vocdoni components expose or use a JSON API to communicate with other components of the system. This page defines a common standard which is the foundation to all APIs interactions.

## Request

API request calls must contain always the following fields

+ `id` Arbitrary value given by the client, so that it can match incoming responses with the originating request. Ideally a salted hash of the current timestamp to prevent correlation analysis).
+ `request.method` String defining the method which is being called

Any field other than `id` and `request.method` is accepted if the specification of the API method allows it.

```json
{
  "id": "req-12345678",
  "request": {
    "method": "addFile"

    // additional fields, depending on the method's expected parameters
    ...
  }
}
```

## Response

The response API calls take two shapes depending on the result of the request.

### Success

+ `id` The value given in the request `id` field
+ `response` A JSON object with the response fields provided by the method
+ `response.request` The value given in the request `id` field

**Why is the Request ID present twice?**

- When the response field becomes encrypted, the Request ID would become unavailable
- This would prevent clients from matching incoming responses
- However, keeping the request ID out of the `request` payload (signed) would leave request ID's out of the signature

```json
{
  "id": "req-12345678",          // ID of the originating request
  "response": {
    "request": "req-12345678",   // Request ID here as well

    // any additional values returned by the method
  }
}
```

### Error

+ `error` A string with information of why a request failed
+ `error.request` The value given in the request `id` field
+ `error.message` Explanation of what went wrong

```json
{
  "id": "req-12345678",          // ID of the originating request
  "error": {
    "request": "req-12345678",          // Request ID here as well
    "message": "Unknown method"         // What went wrong
  }
}
```

## Authentication

Some methods may require authentication. To authenticate API calls, an ECDSA signature is used.

Since not all JS libraries/wallets (Metamask, Web3, Ethers.js, etc) will be able to sign raw messages, Gateways are expected to accept Ethereum signatures. An Ethereum signature is created by prepending `\x19Ethereum Signed Message:\n<len>` to the actual payload to hash and sign.

In the future, it's likely that Gateways have to accept both Ethereum and raw ECDSA signatures.

### Authenticated Requests

The verifier (component running the API server) needs a whitelist of accounts entitled to perform a certain set of methods. An Ethereum address is a truncated hash of the actual public key.

Any method enforcing authentication needs to provide two additional fields:

+ `request.timestamp`  The current UNIX timestamp, in seconds. Used to avoid replay attacks and to add randomless. The client should only accept the response if the given and the current timestamp differ by 10 seconds, at most.
+ `signature`  The ECDSA signature of the message, which proves that the sender is the owner of the whitelisted address

The signature is a sha256 hash of payload's `request` field stringified.

In the following example, the payload is:

```json
{
  "id": "req-12345678",
  "request": {
    "method": "method-name",

    // any additional values required by the method

    "timestamp": 1556110671   <<<
  },
  "signature": "0x1234..."   <<<
}
```

Then:

`payload.signature` = `ECDSA.SIGN` ( `sha256` ( `stringify` ( `payload.request` ) ) )

The verificator will verify the signature, extract the ECDSA public key from the signature, convert it to Ethereum like address and finally compare it with the list of allowed addresses.

**Important**: To avoid signature mismatches, the stringified data of the `request` has to be computed always the JSON fields **sorted alphabetically**.

So, given a `request` field like:

```json
{
  "fullName": "John Smith",
  "alias": "John"
}
```

Its signature should be computed from:

```json
{
  "alias": "John",
  "fullName": "John Smith"
}
```

### Authenticated Responses

Response messages can also be signed. Keeping the examples above:

```json
{
  "response": {
    "request": "req-12345678",

    // any additional values returned by the method

    "timestamp": 1556110671   <<<
  },
  "signature": "0x1234..."   <<<
}
```

Where:

`payload.signature` = `ECDSA.SIGN` ( `sha256` ( `stringify` ( `payload.response` ) ) )

And also:

```json
{
  "error": {
    "request": "req-12345678",           // ID of the originating request
    "message": "Unknown method",         // What went wrong
    "timestamp": 1556110671   <<<
  },
  "signature": "0x1234..."   <<<
}
```

Where:

`payload.signature` = `ECDSA.SIGN` ( `sha256` ( `stringify` ( `payload.error` ) ) )



## Encryption

TO DO

