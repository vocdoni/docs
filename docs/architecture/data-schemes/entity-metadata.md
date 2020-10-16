# Entity Metadata

The metadata of an entity is represented as a [JSON file](#json-schema) that conforms to a specific schema. This data is typically retrieved using a P2P storage system like IPFS.

The metadata of an entity provides human readable content, featuring names, descriptions, images, the list of available processes and more.

- [JSON schema](#json-schema)
- [Gateway boot node](#gateway-boot-node)
- [Gateway update](#gateway-update)
- [News Feed](#news-feed)
- [Entity Actions](#entity-actions)
- [Action visibility](#action-visibility)

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
  "newsFeed": {  // See News Feed below
    "en": "ipfs://34567,https://hipsterpixel.co/feed.json",
    "fr": "ipfs://23456,https://feed2json.org/convert?url=http://www.intertwingly.net/blog/index.atom"
  },
  "media": {
    "avatar": "https://liberland.org/logo.png,ipfs://12345,ipfs://12345",
    "header": "https://liberland.org/header.png,ipfs://12345,ipfs://12345",
  },
  
  "actions": [ <ActionSchema>, ... ], // See Entity Actions below

  "bootEntities": [ <EntityReference>, ... ],  // See Entity Reference below

  "fallbackBootNodeEntities": [ <EntityReference>, ... ],  // See Entity Reference below
  
  "trustedEntities": [ <EntityReference>, ... ],  // See Entity Reference below
  
  "censusServiceManagedEntities": [ <EntityReference>, ... ]  // See Entity Reference below
}
```

**Sequence diagrams:**

- [Set Entity metadata](/architecture/sequence-diagrams?id=set-entity-metadata)
- [Entity subscription](/architecture/sequence-diagrams?id=entity-subscription)

<!--

### Gateway update

Boot-node servers provide the list of available gateways at the time of requesting. In order to keep an accurate state, gateways need to notify specific events to show that they are still alive.

This JSON schema provides the necessary parameters for the Gateways to communicate with the boot nodes.

```json
{
  "timeout": 60000,                   // milliseconds after which a Gateway is marked as down
  "topic": "vocdoni-gateway-update",  // Topic used for the messaging protocol
  "difficulty": 1000                  // Difficulty of the proof of work, to prevent spammers
}
```
-->

### News Feed

A News Feed serves the purpose of having a uni-directional censorship-resistant communication channel between entities and users. They are referenced with [Content URIs](/architecture/protocol/data-origins?id=content-uri) pointed from the `newsFeed` field of the Entity Metadata.

News feeds are expected to conform to the specs of the JSON feed specification

- https://jsonfeed.org/version/1

### Entity Actions

Entity Actions are requests that users may be prompted to send to private services. Their definition is stored within the [JSON metadata](#json-metadata).

#### Register

Open a register form within the client app.

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

As it happens with all [Gateway requests](/architecture/protocol/json-api?id=authentication), `signature` is computed from the stringified JSON of `request`, where its keys are sorted alphabetically.

The response from the backend should be like:

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

<!--
#### Web browser

Opening an interactive web browser

```json
{
    "type": "browser",
    "actionKey": "browse-events",   // The name you give to identify the action

    // Localized Call To Action to appear on the app
    "name": {
        "default": "Browse the events",  // The default language is used if none of the languages match
        "fr": "Voir nos évenements"
    },

    // The URL to open
    "url": "https://my-entity.org/events/",

    // Endpoint to query for the visibility (if dynamic).
    // Returning true will show the action and hide it otherwise.
    // See Action Visibility below.
    "visible": "https://census-registry.cloud/lambda/actions/"

    // "visible": "always"    (or make it always visible)
}
```

- The embedded website can send messages to the host app
- Messages can request the public key or signing payloads

#### Image upload

Prompt the user to upload one or more pictures, coming from the camera or from the image library

```json
{
  "type": "submitMedia",
  "actionKey": "kyc",   // The name you give to identify the action

  // Localized Call To Action to appear on the app
  "name": {
      "en": "Verify my identity",  // The default language is used if none of the languages match
      "fr": "Vérifier mon identité"
  },

  // Requested image types to provide
  "imageSources": [

      // An entry example expecting a picture from the front camera, overlaying a face silhouette
      // on the screen and identified by the "face-portrait" field name in the JSON payload
      {
          "type": "front-camera",
          "name": "face-portrait",
          "orientation": "portrait",
          "overlay": "face",
          "caption": {
              "default": "...",
              "fr": "..."
          }
      },

      // Example expecting two more pictures using the back camera and overlaying
      // either sides of an ID card respectively
      {
          "type": "back-camera",
          "name": "id-front",
          "orientation": "landscape",
          "overlay": "id-card-front",
          "caption": {
              "en": "...",
              "fr": "..."
          }
      },
      {
          "type": "back-camera",
          "name": "id-back",
          "orientation": "landscape",
          "overlay": "id-card-back",
          "caption": {
              "en": "...",
              "fr": "..."
          }
      },

      // Example requesting one more image from the phone's library
      {
          "type": "gallery",
          "name": "custom-1",
          "caption": {
              "en": "...",
              "fr": "..."
          }
      }
  ],

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

The endpoint on `url` will receive a POST request with a JSON payload like:

```json
{
  "request": {
    "method": "submitMedia",
    "actionKey": "kyc",
    "face-portrait": "base64-image-payload-1",
    "id-front": "base64-image-payload-2",
    "id-back": "base64-image-payload-3",
    ...
    "timestamp": 1556110671
  },
  "signature": "0x1234..." // The public key will be extracted from the signature
̣}
```
Keys like `face-portrait`, `id-front`, `id-back`, etc will match every `name` given for the entries of `source[]`

As with Gateway requests, `signature` is computed from the stringified JSON of `request`, where its keys are sorted alphabetically.

The response from the backend should be like:

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

-->

### Action visibility

The visibility of entity actions can be static or dynamic. 

- Actions that should always be visible are declared with `"visible": "always"`.
- If the visibility is dynamic, `"visible"` contains the URL endpoint to which the client will perform a POST request.

The body should contain:

```json
{
  "request": {
    "method": "getVisibility",
    "actionKey": "sign-up",
    "entityId": "0xaabbccdd...",
    "timestamp": 1556110671
  },
  "signature": "0x1234..." // The public key will be extracted from the signature
̣}
```

The public key for which the visibility is queried will be recovered from the `signature`. The `signature` is computed from `sign({"method":"getVisibility","timestamp":1581673325384}, privateKey)`.
- This prevents spam requests to leak knowledge about a certain account
- For UX reasons, a precomputed signature is cached when users unlock an account within the app
- Since it is not feasible to precompute all potential signatures for every possible entity, the `entityId` and `actionKey` fields are omitted on the signature
- Signing the timestamp allows backends to only accept queries for a reasonable period of time, until the user unlocks the account again
- A neater approach is in the works

The response from the backend should be like:

```json
{
  "response": {
    "ok": true,
    "visible": true // or false   // only if `ok` == true
    // "error": "Something went wrong",  // Only if `ok` == false
    "timestamp": 1556110671
  },
  "signature": "" // Empty until registry public keys are available
}
```

<!--

### Entity Reference

A pointer to the metadata of a specific entity. It can have several purposes.

- **Boot Entities**: An entry point for the user to subscribe to new entities.
- **Fallback Boot Node Entities**: If the can't reach the boot nodes, the Gateway Boot Nodes of external entities will be used
- **Trusted Entities**: Used to allow users to know if already trusted entities trust a new one or not
- **Census Service managed entities**: Tells the entity's census service which resolver+entities to get the settings from. Useful to allow census services to operate for more than one entity.

```json
{
  "entityId": "0xeee",         // Entity ID: Hash of the the creator's address
  "entryPoints": [ "https://goerli.infura.io/v3/YOUR-PROJECT-ID", "https://rpc.slock.it/goerli" ] // Web3 gateways on the above Network ID
}
```
-->

### Coming next

See the [Process Data Schemes](/architecture/data-schemes/process) section.
