# Entities

An entity can have many roles. For the most part, it is the organizer of voting processes. However, it could make no use of the voting system and still use the platform for:

- Publishing content via the [News Feed](#feed)
- Providing [Gateway boot nodes](#gateway-boot-nodes) to the network
<!-- - Providing pointers to trusted/related [Entities](#entities-list) -->

## Index

- [Entity Resolver](#entity-resolver)
  - [Text Record storage](#text-record-storage)
  - [Text List Record storage](#text-list-record-storage)
  - [Resolver keys](#resolver-keys)
- [JSON schema](#json-schema)
  - [Gateway boot node](#gateway-boot-node)
  - [Gateway update](#gateway-update)
  - [News Feed](#news-feed)
  - [Entity Actions](#entity-actions)
  - [Action visibility](#action-visibility)

---

The metadata of an entity is represented as a [JSON file](#json-schema) that conforms to a specific schema. This data is typically retrieved using a P2P storage system like IPFS.

However, indexing is provided by a Smart Contract running on the blockchain. The ENS Resolver Smart Contract allows entities to register and set the [Content URI](/architecture/protocol/data-origins?id=content-uri) that points to the actual JSON metadata.

---

## Entity Resolver

The **Entity Resolver** is the smart contract where the entities' metadata is indexed. It uses a standard ENS Resolver contract but only Text records are used, as a key-value store.

The ENS domain of the contract instance is `entity-resolver.vocdoni.eth` on the ENS registry.

The `entityId` is the unique identifier of each entity, being a hash of its ethereum address:

```solidity
bytes32 entityId = keccak256 (entityAddress);
```

### Text Record storage

We make use of [EIP 634: Storage of Text records in ENS](https://eips.ethereum.org/EIPS/eip-634). It is a convenient way to store arbitrary data as a string following a key-value store model.

[Implementation](https://github.com/vocdoni/dvote-solidity/blob/master/contracts/profiles/TextResolver.sol)
  
### Supported Text Record keys

Entities may define the following Text Records:

| Key                                 | Example                                                       | Description                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `vnd.vocdoni.meta`                  | 'ipfs://12345,https://server/json'                                    | [Content URI](/architecture/protocol/data-origins?id=content-uri) to fetch the Entity's JSON metadata. <br/>See [JSON schema](#meta). |
| `vnd.vocdoni.boot-nodes`            | 'ipfs://12345,https://server/gw.json'                                 | [Content URI](/architecture/protocol/data-origins?id=content-uri) to fetch a set of Gateways for the Entity. <br/>See [Gateway Boot Nodes](#gateway-boot-nodes) below. |
| `vnd.vocdoni.gateway-heartbeat`     | 'pss://publicKey@address,wss://host/path'                              | [Messaging URI](/architecture/protocol/data-origins?id=messaging-uri) where the Gateways of the entity should report their health status. |

- Required
  - `vnd.vocdoni.meta`
- Optional
  - `vnd.vocdoni.boot-nodes`
  - `vnd.vocdoni.gateway-heartbeat`  (as long as the entity has no Gateways)

## JSON schema

To fetch the metadata of an entity, client applications are expected to fetch the value of the ENS Text Record `vnd.vocdoni.meta`, which contains a [Content URI](/architecture/protocol/data-origins?id=content-uri).

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


### Gateway boot nodes

Client apps may not be able to join P2P networks by themselves, so Vocdoni makes use of Gateways to enable decentralized transactions over HTTP or Web Sockets. A gateway Boot Node is a service provided by the Entity, and it defines a list of active Gateways that a client can use.

By default, Vocdoni (as an Entity) provides its own set of Voting and Web3 Gateways. However, entities may want to use their own infrastructure. To this end, the Entity's ENS Text Record `vnd.vocdoni.boot-nodes` can be set to the Content URI of a [BootNodes JSON file](/architecture/services/bootnode) defining some of them.


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

A News Feed serves the purpose of having a uni-directional censorship-resistant communication channel between entities and users. They are referenced with [Content URIs](/architecture/protocol/data-origins?id=content-uri).

News feeds are expected to conform to the specs of the JSON feed specification

- https://jsonfeed.org/version/1

### Entity Actions

Entity Actions are operations that users may be prompted to do on a private service. Their definition is stored within the [JSON metadata](#json-metadata).

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

See the [Process](/architecture/smart-contracts/process) section.
