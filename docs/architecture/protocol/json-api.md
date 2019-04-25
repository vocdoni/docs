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

+ `id` The same value given in the request `id`
+ `response` A JSON object with the response fields provided by the method

```json
{
  "id": "req-12345678",
  "response": {
    "publicKeyModulus": 123,
    "publicKeys": [
        "0x1234...",
        "0x2345...",
        "0x3456..."
    ]
  }
}
```

### Error

+ `id` The same value given in the request `id`
+ `error` A string with information of why a request failed

```json
{
  "id": "req-12345678",
  "error": {
    "message": "Unknown method"
  }
}
```

## Authentication

Some methods may require authentication. To authenticate API calls, an ECDSA signature is used.

### Authenticated Requests

The verifier (component running the API server) needs a whitelist of accounts entitled to perform a certain set of methods. An Ethereum address is a truncated hash of the actual public key.

Any method enforcing authentication needs to provide two additional fields:

+ `request.timestamp`  The current UNIX timestamp, in seconds. Used to avoid replay attacks and to add randomless.
+ `signature`  The ECDSA signature of the message, which proves that the sender is the owner of the whitelisted address

The signature is a sha256 hash of payload's `request` field stringified. 

In the following example, the payload is:

```json
{
  "id": "req-12345678",
  "request": {
    "timestamp": 1556110671,   <<<
    "method": "method-name",
    "key": "value",
  },
  "signature": "0x1234..."   <<<
}
```

Then:

`payload.signature` = `ECDSA.SIGN` ( `sha256` ( `stringify` ( `payload.request` ) ) )

The verificator will verify the signature, extract the ECDSA public key from the signature, convert it to Ethereum like address and finally compare it with the list of allowed addresses.

### Authenticated Responses

Response messages can also be signed. Keeping the examples above:

```json
{
  "id": "req-12345678",
  "response": {
    "timestamp": 1556110671,   <<<
    "publicKeyModulus": 123,
    "publicKeys": [
        "0x1234...",
        "0x2345...",
        "0x3456..."
    ]
  },
  "signature": "0x1234..."   <<<
}
```

Where:

`payload.signature` = `ECDSA.SIGN` ( `sha256` ( `stringify` ( `payload.response` ) ) )

And also:

```json
{
  "id": "req-12345678",
  "error": {
    "timestamp": 1556110671,   <<<
    "message": "Unknown method"
  },
  "signature": "0x1234..."   <<<
}
```

Where:

`payload.signature` = `ECDSA.SIGN` ( `sha256` ( `stringify` ( `payload.error` ) ) )



## Encryption

TO DO

