# Entity Metadata

The metadata of an entity is represented as a [JSON file](#json-schema) that conforms to a specific schema. This data is typically retrieved using a P2P storage system like IPFS.

The metadata of an entity provides human readable content, featuring names, descriptions, images, the list of available processes and more.

- [Entity Metadata](#entity-metadata)
  - [JSON schema](#json-schema)
      - [Register](#register)
    - [Coming next](#coming-next)

## JSON schema

To fetch the metadata of an entity, client applications are expected to fetch the value of the [ENS Text Record](/architecture/smart-contracts/entity-resolver?id=text-record-storage) `vnd.vocdoni.meta`, which contains a [Content URI](/architecture/protocol/data-origins?id=content-uri).

The [Content URI](/architecture/protocol/data-origins?id=content-uri) is expected to point to a JSON file, conforming to the following schema:

```json
{
  "version": "1.0",
  // The first language in the list is the default one
  // Use "default" or https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
  "languages": ["en", "fr"],
  "name": {
    "en": "Free Republic of Liberland",
    "fr": "République Livre de Liberland"
  },
  "description": {
    "en": "In a sovereign state...",
    "fr": "Dans un état souverain..."
  },
  "votingProcesses": {
    "active":["0x987...","0x876..."], // Process ID of the active votes
    "ended":["0x887...","0x886..."]   // Process ID of the ended votes
  },
  "newsFeed": {  // Unused, subject to revision
    "en": "ipfs://34567,https://hipsterpixel.co/feed.json",
    "fr": "ipfs://23456,https://feed2json.org/convert?url=http://www.intertwingly.net/blog/index.atom"
  },
  "media": {
    "avatar": "https://liberland.org/logo.png,ipfs://12345,ipfs://12345",
    "header": "https://liberland.org/header.png,ipfs://12345,ipfs://12345",
  },
  
  "actions": [ <ActionSchema>, ... ], // Unused, subject to revision

  "bootEntities": [ <EntityReference>, ... ],  // Unused, subject to revision

  "fallbackBootNodeEntities": [ <EntityReference>, ... ],  // Unused, subject to revision
  
  "trustedEntities": [ <EntityReference>, ... ],  // Unused, subject to revision
  
  "censusServiceManagedEntities": [ <EntityReference>, ... ]  // Unused, subject to revision
}
```

**Sequence diagrams:**

- [Set Entity metadata](/architecture/sequence-diagrams?id=set-entity-metadata)
- [Entity subscription](/architecture/sequence-diagrams?id=entity-subscription)


#### Register

Open a registration form within the client app.

```json
{
    "type": "register",
    "actionKey": "sign-up",   // The name you give to identify the action

    "name": {
        "default": "Register",
        "fr": "S'inscrire"
    },

    // The URL to POST the provided data to.
    // See the format below.
    "url": "https://census-registry.cloud/lambda/actions/",

    // Endpoint to query for the visibility (if dynamic).
    // Returning true will show the action and hide it otherwise.
    // See Action Visibility below.
    "visible": "https://census-registry.cloud/lambda/actions/"

    // "visible": "always"    (or make it always visible)
}
```

The body of the POST request submitted to `url` will contain a JSON body like:

```json
{
  "request": {
    "method": "register",
    "actionKey": "sign-up",
    "entityId": "0xaabbccdd...",
    "firstName": "John",
    "lastName:": "Snow",
    "dateOfBirth": "2020-02-19T10:09:19.738Z",
    "email": "john@snow.me",
    "phone": "+1235678838",
    "timestamp": 1556110671
  },
  "signature": "0x1234..." // The public key will be extracted from the signature
̣}
```

As this all happens through [Gateway requests](/architecture/protocol/json-api?id=authentication), `signature` is computed from the stringified JSON of `request`, where its keys are sorted alphabetically.

The response from the backend should look like like:

```json
{
  "response": {
    "ok": true,
    // "error": "Something went wrong",  // Only if `ok` == false
    "timestamp": 1556110671
  },
  "signature": "" // Empty until registry public keys are available
}
```


