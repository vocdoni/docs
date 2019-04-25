# API standard

Most of the Vocdoni components expose or use a JSON API to communicate with other components of the system. This page defines a common standard which is applied by default to all APIs.

## Request

All the API request calls must contain always the following fields

+ `method` a string describing the method name which is being called
+ `requestId` an arbitrary value given by the client, so that it can match incoming responses to the originating request. Ideally a hash of a timestamp.

Any other field, in addition to these two, is accepted if the specification of the API server allows it.

## Response

The response API calls must always have the same format which includes a maximum of three fields:

+ `error` a boolean returning true/false, if there has been an error on the API call
+ `requestId` a hexadecimal string which identify the API call (must coincide with the request id the lient sent)
+ `response` an array of values representing the response or a single value with the error message if `error` is true

```json
{
  "error": false,
  "requestId": "0x12345",      
  "response": ["0xAABBCCDDEE", "this is data", ...]
}
```

## Authentication

Some methods require authentication. To authenticate an API call, an ECDSA signature is used. The verification side (component running the API server) must know the address or list of Ethereum-like addresses which are allowed for a specific set of methods (usually named private methods).

An Ethereum address is a trunkated hash of the actual public key.

Any method requiering authentication have two extra fields:

+ `timeStamp` is the current UNIX timestamp, in seconds. Used to avoid replay attacks and to add randomless.
+ `signature` is the ECDSA signature of the message which proves the authentication

The content to be signed is the sha256 hash of the concatenated data of all fields, minus the signature itself, alhabetically ordered by the field name. See the following example.


```json
{
  "method": "addFile",
  "requestId": "0x12345",
  "content": "This is data",
  "timeStamp": 1556110671,
  "signature": "<SIGNATURE>"
}
```

`<SIGNATURE>` = `ECDSA.SIGN` ( `sha256` ( `This is data``addFile``0x12345``1556110671` ) )

The verificator will verify the signature, extract the ECDSA public key from the signature, convert it to Ethereum like address and finally compare it with the list of allowed addresses.


## Encryption

to-do

