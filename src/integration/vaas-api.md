# Integration API Specification

## Internal (superadmin)

### Update an integrator account
<details>
<summary>example</summary>

#### Request 
```bash
curl -X PUT -H "Bearer: <superadmin-key>" https://server/v1/admin/accounts/<id>
```

#### Parameters
```json
{
    "name": "My integrator account",
    "plan": "billing-plan-key"
}
```

#### HTTP 200
```json
{
    "id": "1234567890"
}
```

#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>
    
### Reset an integrator API key  
<details>
<summary>example</summary> 

#### Request 
```bash
curl -X PATCH -H "Bearer: <superadmin-key>" https://server/v1/admin/accounts/<id>/key
```

#### HTTP 200
```json
{
    "id": "1234567890",
    "apiKey": "zxcvbnm"
}

```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```

### Get an integrator account
<details>
<summary>example</summary>

#### Request 
```bash
curl -H "Bearer: <superadmin-key>" https://server/v1/admin/accounts/<id>

```
#### HTTP 200
```json
{
    "name": "My integrator account",
    "plan": "billing-plan-key"
}

```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>
</details>

### Delete an integrator account
<details>
<summary>example</summary>

#### Request 
```bash
curl -X DELETE -H "Bearer: <superadmin-key>" https://server/v1/admin/accounts/<id>
```
#### HTTP 200
```json
// empty response
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>
</details>

## Private Integrator API

**Integrator related:**
(secret key authenticated, integrators use it)

### Create an entity
<details>
<summary>example</summary>

#### Request 
```bash
curl -X POST -H "Bearer: <integrator-key>" https://server/v1/priv/account/entities
```

#### Parameters
```json
{
    "name": "Entity name",
    "description": "",
    "header": "https://my/header.jpeg",
    "avatar": "https://my/avatar.png"
}
```
#### HTTP 200
```json
{
    "entityId": "0x1234...",
    "apiToken": "qwertyui...",   // API token for public voting endpoints
    "apiKey": "asdfghjk..."      // Secret API key to manage the entity
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>
</details>

### Get an entity
<details>
<summary>example</summary>

#### Request 
```bash
curl -H "Bearer: <integrator-key>" https://server/v1/priv/account/entities/<entityId>
```

#### HTTP 200
```json
{
    "apiToken": "qoiuwhgoiauhsdaiouh",   // the public API token
    "name": "Entity name",
    "description": "",
    "header": "https://my/header.jpeg",
    "avatar": "https://my/avatar.png"
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Remove an entity
<details>
<summary>example</summary>

#### Request 
```bash
curl -X DELETE -H "Bearer: <integrator-key>" https://server/v1/priv/account/entities/<entityId>
```

#### HTTP 200
```json
// empty response
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Reset an entity API key
<details>
<summary>example</summary>

#### Request 
```bash
curl -X PATCH -H "Bearer: <superadmin-key>" https://server/v1/account/entities/<id>/key
```

#### HTTP 200
```json
{
    "id": "1234567890",
    "apiKey": "zxcvbnm"
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

**Entity related:**
(secret key authenticated, entities use it through an integrator backend)

### Set Entity metadata
<details>
<summary>example</summary>

#### Request 
```bash
curl -X PUT -H "Bearer: <integrator-key>" https://server/v1/priv/entities/<entityId>/metadata
```

#### Parameters
```json
{
    "name": "Entity name",
    "description": "",
    "header": "https://my/header.jpeg",
    "avatar": "https://my/avatar.png"
}
```
#### HTTP 200
```json
{
    "entityId": "0x1234..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Create a process
Generates a Merkle Tree with the given current census keys and generates a voting process with the given metadata. 
<details>
<summary>example</summary>


#### Request 
```bash
curl -X POST -H "Bearer: <integrator-key>" https://server/v1/priv/entities/<entityId>/processes/signed
curl -X POST -H "Bearer: <integrator-key>" https://server/v1/priv/entities/<entityId>/processes/blind
```

#### Parameters
```json
{
    "title": "Important election",
    "description": "Description here",
    "header": "https://my/header.jpeg",
    "streamUri": "https://youtu.be/1234",
    "startDate": "2021-10-25T11:20:53.769Z", // can be empty
    "endDate": "2021-10-30T12:00:00.000Z",
    "questions": [
        {
            "title": "Question 1",
            "description": "(optional)",
            "choices": ["Yes", "No", "Maybe"]  // simplified version of title/value
        }, {...}
    ],
    "confidential": true,  // Metadata access restricted to only census members
    "hiddenResults": true, // Encrypt results until the process ends
    "census": "<censusId>"
}
```

#### HTTP 200
```json
{
    "processId": "0x1234..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### List processes (filtered)
Allows unrestricted listing, paging and filtering for the integrator backend to display all info to entity admin's.
<details>
<summary>example</summary>


#### Request 
```bash
curl -H "Bearer: <integrator-key>" https://server/v1/priv/entities/<entityId>/processes/signed
curl -H "Bearer: <integrator-key>" https://server/v1/priv/entities/<entityId>/processes/blind

curl -H "Bearer: <integrator-key>" https://server/v1/priv/entities/<entityId>/processes/active
curl -H "Bearer: <integrator-key>" https://server/v1/priv/entities/<entityId>/processes/ended
curl -H "Bearer: <integrator-key>" https://server/v1/priv/entities/<entityId>/processes/upcoming
```
#### HTTP 200
```json
[
    {
        "title": "Important election",
        "description": "",
        "header": "https://my/header.jpeg",
        "status": "READY",
        "startDate": "2021-10-25T11:20:53.769Z", // can be empty
        "endDate": "2021-10-30T12:00:00.000Z",
    }, {...}
]
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Get a process
Allows unrestricted access for the integrator backend to display all info to entity admin's.
Confidential processes do not require any additional step, just the integrator API key.
<details>
<summary>example</summary>


#### Request 
```bash
curl -H "Bearer: <integrator-key>" https://server/v1/priv/processes/<processId>
```

#### Parameters
```json
{
    "type": "signed", // blind, ...
    "title": "Important election",
    "description": "Description goes here",
    "header": "https://my/header.jpeg",
    "streamUri": "https://youtu.be/1234",
    "questions": [
        {
            "title": "Question 1",
            "description": "(optional)",
            "choices": ["Yes", "No", "Maybe"]
        }, {...}
    ],
    "confidential": true,  // Metadata access restricted to only census members
    "hiddenResults": true, // Encrypt results until the process ends
    "census": "<censusId>",
    "status": "PAUSED"
}
```
#### HTTP 200
```json
{
    "processId": "0x1234..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Create a census
A census where public keys or token slots (that will eventually contain a public key) are stored. A census can start with 0 items, and public keys can be imported later on.

If census tokens are allocated, users will need to generate a wallet on the frontend and register the public key by themselves. This prevents both the API and the integrator from gaining access to the private key.

<details>
<summary>example</summary>


#### Request 
```bash
curl -X POST -H "Bearer: <integrator-key>" https://server/v1/priv/censuses
```

#### Parameters
```json
{
    "name": "2021 members"
}
```
#### HTTP 200
```json
{
    "censusId": "123456789..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Add N census tokens (once)
Creates N census tokens for voters to register their public key in the future. 

<details>
<summary>example</summary>


#### Request 
```bash
curl -X POST -H "Bearer: <integrator-key>" https://server/v1/priv/censuses/<censusId>/tokens/flat
```

#### Parameters
```json
{
    "size": 450
}
```
#### HTTP 200
```json
{
    "censusId": "123456789...",
    "size": 700,  // new size
    "tokens": [
        "jashdlkfjahs", "uyroeituwyert", "e7rg9e87rn9", ... // x 450
    ]
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Add weighted census tokens (once)
Creates weighted census tokens so that voters with the token can register their public key to the appropriate census weight. 

<details>
<summary>example</summary>


#### Request 
```bash
curl -X POST -H "Bearer: <integrator-key>" https://server/v1/priv/censuses/<censusId>/tokens/weighted
```

#### Parameters
```json
{
    "weights": [
        40, 70, 200
    ]
}
```
#### HTTP 200
```json
{
    "censusId": "123456789...",
    "size": 700,  // new size
    "tokens": [
        { "token": "jashdlkfjahs", weight: 40 },
        { "token": "uyroeituwyert", weight: 70 },
        { "token": "e7rg9e87rn9", weight: 200 }
    ]
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Get census token (see a registered public key)

Allows integrators to check the status of a census token, given to a user.

If the token has already been redeemed, the public key will be used as part of the census normally.

<details>
<summary>example</summary>

#### Request 
```bash
curl -H "Bearer: <integrator-key>" https://server/v1/priv/censuses/<censusId>/tokens/<tokenId>
```

#### HTTP 200
```json
{
    "publicKey": "",   // no public key yet
    "weight": 20
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Remove a census token or public key from a census
Removes the given token or key from the given census. The next time it is used, the new key will be in effect.

<details>
<summary>example</summary>


#### Request 
```bash
curl -X DELETE -H "Bearer: <integrator-key>" https://server/v1/priv/censuses/<censusId>/tokens/<tokenId>
curl -X DELETE -H "Bearer: <integrator-key>" https://server/v1/priv/censuses/<censusId>/keys/<publicKey>
```

#### HTTP 200
```json
// empty response
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Import public keys into a census
Import a group of public keys to an existing census. All voters have the same weight (1).

<details>
<summary>example</summary>


#### Request 
```bash
curl -X POST -H "Bearer: <integrator-key>" https://server/v1/priv/censuses/<censusId>/import/flat
```

#### Parameters
```json
{
    "publicKeys": [
        "0x0312345678...",
        "0x0223456789...",
        ...
    ]
}
```
#### HTTP 200
```json
{
    "censusId": "123456789...",
    "size": 300
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Import weighted public keys into a census
Import a group of public keys to an existing census, using their respective weight. 

<details>
<summary>example</summary>


#### Request 
```bash
curl -X POST -H "Bearer: <integrator-key>" https://server/v1/priv/censuses/<censusId>/import/weighted
```

#### Parameters
```json
{
    "entries": [
        { "publicKey": "0x0312345678...", "weight": 100 },
        { "publicKey": "0x02234567890...", "weight": 150 },
        ...
    ]
}
```
#### HTTP 200
```json
{
    "censusId": "123456789...",
    "size": 300
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### End/start/pause/cancel a process
<details>
<summary>example</summary>

#### Request 
```bash
curl -X PUT -H "Bearer: <integrator-key>" https://server/v1/priv/processes/<processId>/status
```

#### Parameters
```json
{
    "status": "PAUSED" // READY, PAUSED, ENDED, CANCELED
}
```
#### HTTP 200
```json
{
    "censusId": "123456789..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>


**Voter related:** 

### Registering a voter's public key

This process needs to be done by the integrator's frontend, once. 

As soon as a user runs an updated UI version, a new private key should be generated, and the public key should be registered, so that new votes can use this key.

If the wallet is lost, the integrator will need to remove the pubKey from the census and create a new census token when the new wallet is available. 

<details>
<summary>example</summary>

#### Request 
```bash
curl -X POST -H "Bearer: <entity-api-token>" https://server/v1/pub/censuses/<censusId>/token
```

#### Parameters
```json
{
    "censusToken": "jashdlkfjahs",
    "publicKey": "0x03abcdef0123456789..."
}
```
#### HTTP 200
```json
// empty response
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>


## Public API
(token API authenticated, voter apps call it directly)

### Get Entity data
<details>
<summary>example</summary>

#### Request 
```bash
curl -H "Bearer: <entity-api-token>" https://server/v1/pub/entities/<entityId>
```

#### HTTP 200
```json
{
    "name": "Entity name",
    "description": "",
    "header": "https://my/header.jpeg",
    "avatar": "https://my/avatar.png"
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Get process list (per entity)
<details>
<summary>example</summary>

#### Request 
```bash
curl -H "Bearer: <manager-key>" https://server/v1/pub/entities/<entityId>/processes/active
curl -H "Bearer: <manager-key>" https://server/v1/pub/entities/<entityId>/processes/ended
curl -H "Bearer: <manager-key>" https://server/v1/pub/entities/<entityId>/processes/upcoming

```
#### HTTP 200
```json
[
    {
        "title": "Important election",
        "description": "",
        "header": "https://my/header.jpeg",
        "status": "READY",
        "startDate": "2021-10-25T11:20:53.769Z", // can be empty
        "endDate": "2021-10-30T12:00:00.000Z",
    }, {...}
]
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Get process info – non-confidential
<details>
<summary>example</summary>

#### Request 
```bash
curl -H "Bearer: <entity-api-token>" https://server/v1/pub/processes/<processId>
```

#### HTTP 200
```json
{
    "type": "signed-plain", // blind-plain, ...
    "title": "Important election",
    "description": "Description goes here",
    "header": "https://my/header.jpeg",
    "streamUri": "https://youtu.be/1234",
    "questions": [
        {
            "title": "Question 1",
            "description": "(optional)",
            "choices": ["Yes", "No", "Maybe"]
        }, {...}
    ],
    "status": "READY",
    "voteCount": 1234,
    "results": [   // Empty array when no results []
        [ { "title": "Yes", "value": 1234, "title": "No", "value": 2345 } ],
        [ { "title": "Yes", "value": 22, "title": "No", "value": 33 } ]
    ]
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Get process info – confidential

Checks the given signature against a well-known payload, extracts the signer's public key and checks for its inclusion in the process census. 

If the voter belongs to the census, it decrypts the metadata and returns it to the caller. 

<details>
<summary>example</summary>

#### Request 
```bash
curl -X -H "Bearer: <entity-api-token>" https://server/v1/pub/processes/<processId>/auth/<signature>
```

#### HTTP 200
```json
{
    "type": "signed-plain", // blind-plain, ...
    "title": "Important election",
    "description": "Description goes here",
    "header": "https://my/header.jpeg",
    "streamUri": "https://youtu.be/1234",
    "questions": [
        {
            "title": "Question 1",
            "description": "(optional)",
            "choices": ["Yes", "No", "Maybe"]
        }, {...}
    ],
    "status": "READY",
    "voteCount": 1234,
    "results": [   // Empty array when no results []
        [ { "title": "Yes", "value": 1234, "title": "No", "value": 2345 } ],
        [ { "title": "Yes", "value": 22, "title": "No", "value": 33 } ]
    ]
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Requesting a census proof
People voting on a signed process will need to package a vote envelope using the result of this call. 

<details>
<summary>example</summary>


#### Request 
```bash
curl -H "Bearer: <entity-api-token>" https://server/v1/pub/processes/<processId>/proof
```

#### Parameters
```json
{
    "signature": "0x12345678..." // signing a well-known payload using the wallet
}
```
#### HTTP 200
```json
{
    "proof": "..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Submitting a vote (signed or blind)

Voters using the tiny JS SDK will get a base64 bundle including the vote and the census proof. This payload is submitted as a base64 string.

<details>
<summary>example</summary>

#### Request 
```bash
curl -X POST -H "Bearer: <entity-api-token>" https://server/v1/pub/processes/<processId>/vote
```

#### Parameters
```json
{
    "vote": "<base64-signed-vote-transaction>" // see dvote-js
}
```
#### HTTP 200
```json
{
    "nullifier": "0x12345678..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Getting a ballot (nullifier)
Voters can check the status of their vote here, and eventually check the explorer link, for independent confirmation.

<details>
<summary>example</summary>


#### Request 
```bash
curl -H "Bearer: <entity-api-token>" https://server/v1/pub/nullifiers/<nullifier>
```
#### HTTP 200
```json
{
    "processId": "0x12345678...",
    "registered": true,
    "explorerUrl": "https://vaas.explorer.vote/nullifiers/0x12345678"
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Get the pubKeys that have requested a blind signature on a process
For transparency, external observers can request the exhaustive list of public keys that made a blind signature request. 

<details>
<summary>example</summary>


#### Request 
```bash
curl -H "Bearer: <entity-api-token>" https://server/v1/pub/processes/<processId>/blind/authorized
```

#### HTTP 200
```json
{
    "publicKeys": [
        "0x12345678...",
        "0x23456789...",
        ...
    ]
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>


## Validator API

**Auth:**

### Get a token for requesting a blind signature

The blind signature process involves a two step interaction.

In the first interaction, the voter proves their eligibility. If everything is correct, the backend replies with the `tokenR`, which the voter needs to use on the second step. 

<details>
<summary>example</summary>

#### Request 
```bash
curl -X POST -H "Bearer: <entity-api-token>" https://server/v1/auth/processes/<processId>/blind/auth
```

#### Parameters
```json
{
    "proof": "<process-id-signed-with-the-registered-wallet>"
}
```
#### HTTP 200
```json
{
    "tokenR": "0x1234567890abcde..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Request the blind signature for the ephemeral wallet

The user generates an ephemeral wallet and the received tokenR to generate a blinded payload. This payload is sent to the backend, which will check the correctness and reply with a signature of the blinded payload. 

The voter then unblinds the response and uses it as their vote signature. 

<details>
<summary>example</summary>

#### Request 
```bash
curl -X POST -H "Bearer: <entity-api-token>" https://server/v1/auth/processes/<processId>/blind/sign
```

#### Parameters
```json
{
    "blindedPayload": "0xabcdef...",   // blind(hash({processId, address}))
    "tokenR": "0x1234567890abcde..."
}
```
#### HTTP 200
```json
{
    "blindSignature": "0x1234567890abcde..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>


**Custom: auth**

### Get a token for requesting a blind signature
The blind signature process involves a two step interaction.

In the first interaction, the voter proves their eligibility. If everything is correct, the backend replies with the `tokenR`, which the voter needs to use on the second step. 

<details>
<summary>example</summary>


#### Request 
```bash
curl -X POST -H "Bearer: <entity-api-token>" https://server/v1/auth/custom/processes/<processId>/blind/auth
```

#### Parameters
```json
{
    "voterId": "0x1234...",
    "caSignature": "..."
}
```
#### HTTP 200
```json
{
    "tokenR": "0x1234567890abcde..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>

### Request the blind signature for the ephemeral wallet

The user generates an ephemeral wallet and the received tokenR to generate a blinded payload. This payload is sent to the backend, which will check the correctness and reply with a signature of the blinded payload. 

The voter, then unblinds the response and uses it as their vote signature. 

<details>
<summary>example</summary>

#### Request 
```bash
curl -X POST -H "Bearer: <entity-api-token>" https://server/v1/auth/processes/<processId>/blind/sign
```

#### Parameters
```json
{
    "blindedPayload": "0xabcdef...",   // blind(hash({processId, address}))
    "tokenR": "0x1234567890abcde..."
}
```
#### HTTP 200
```json
{
    "blindSignature": "0x1234567890abcde..."
}
```
#### HTTP 400
```json
{
    "error": "Message goes here"
}
```
</details>