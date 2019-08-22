# Entity

An entity can have many roles. For the most part, it is the organizer and the ultimate responsibility of a voting process. However, an Entity could make no use of the voting system and instead be used as a trusted actor by:

- Publishing news/information via the [Feed](#feed)
- Providing pointers to trusted/related [Entities](#entities-list)
- Providing [Gateway boot nodes](#gateway-boot-nodes)

## Index

- [Entity](#entity)
  - [Index](#index)
  - [Entity Resolver](#entity-resolver)
    - [Text Record storage](#text-record-storage)
    - [Text List Record storage](#text-list-record-storage)
    - [Resolver keys](#resolver-keys)
  - [JSON schema](#json-schema)
    - [Gateway boot node](#gateway-boot-node)
    - [Gateway update](#gateway-update)
    - [News Feed](#news-feed)
    - [Entity Actions](#entity-actions)
    - [Entity Reference](#entity-reference)

---

The metadata of an entity is a [JSON file](#json-schema) that conforms to a specific schema. Typically this data is retrieved using a P2P storage system like IPFS. 

However, indexing and integrity is provided by a Smart Contract running on the blockchain. Such Smart Contract allows entities to register and set the [Content URI](/architecture/protocol/data-origins?id=content-uri) that points to the actual JSON metadata.

---

## Entity Resolver

An **[Entity Resolver](#entity-resolver)** is the smart contract where the Entity metadata is stored/indexed. It follows the architecture of an ENS resolver contract but it only uses it as a key-value store.

The address of the Entity Resolver contract instance is resolved from `entity-resolver.vocdoni.eth` on the ENS registry.

The `entityId` is the unique identifier of each entity, being a hash of its creator's address:

```solidity
bytes32 entityId = keccak256 (entityAddress);
```

An Entity Resolver implements the following interfaces

- Storage of Text records
- Text List Record storage (not used at this point)

### Text Record storage

We make use of [EIP 634: Storage of Text records in ENS](https://eips.ethereum.org/EIPS/eip-634). It is a convenient way to store arbitrary data as a string following a key-value store model.

[Implementation](https://github.com/vocdoni/dvote-solidity/blob/master/contracts/profiles/TextResolver.sol)
  
### Text List Record storage

This implementation allows to add or update smaller chunks of text in slices, instead of setting the entire string every time. It is currently not used.

[Implementation](https://github.com/vocdoni/dvote-solidity/blob/master/contracts/profiles/TextListResolver.sol)
  
### Supported Text Record keys

Entities may define the following Text Records:

| Key                                 | Example                                                       | Description                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `vnd.vocdoni.meta`                  | 'ipfs://12345,https://server/json'                                    | [Content URI](/architecture/protocol/data-origins?id=content-uri) to fetch the Entity's JSON metadata. <br/>See [JSON schema](#meta). |
| `vnd.vocdoni.boot-nodes`            | 'ipfs://12345,https://server/gw.json'                                 | [Content URI](/architecture/protocol/data-origins?id=content-uri) to fetch a set of Gateways for the Entity. <br/>See [Gateway Boot Nodes](#gateway-boot-nodes) below. |
| `vnd.vocdoni.gateway-heartbeat`     | 'pss://publicKey@address,wss://host/path'                              | [Messaging URI](/architecture/protocol/data-origins?id=messaging-uri) where the Gateways of the entity should report their health status. |

- Mandatory
  - `vnd.vocdoni.meta`
- Optional
  - `vnd.vocdoni.boot-nodes`
  - `vnd.vocdoni.gateway-heartbeat`  (as long as the entity has no Gateways)

## JSON schema

To fetch the metadata of an entity, client applications are expected to fetch the value of the ENS Text Record `vnd.vocdoni.meta`, which contains a [Content URI](/architecture/protocol/data-origins?id=content-uri).

The retrieved [Content URI](/architecture/protocol/data-origins?id=content-uri) is expected to point to a JSON file, conforming to the following schema:

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

Client apps may not be able to join P2P networks by themselves, so Vocdoni makes use of Gateways to enable decentralized transactions over Web Sockets. A gateway Boot Node is a service provided by the Entity, and it defines a list of active Gateways that a client can use.

By default, Vocdoni (as an Entity) provides its own set of DVote and Web3 Gateways. However, entities may want to use their own infrastructure. To this end, the Entity's ENS Text Record `vnd.vocdoni.boot-nodes` can be set to the Content URI of a [BootNodes JSON file](/architecture/components/bootnode) defining some of them.


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

Entity Actions are custom operations that users may be prompted to start. Their definition is stored within the [JSON metadata](#json-metadata).

Entity actions can be in the form of:

- Web browser actions
- Image uploading


#### Web browser

Opening an interactive web browser

```json
{
    "type": "browser",
    "register": true,    // Does this action allow the user to sign in?

    // Localized Call To Action to appear on the app
    "name": {
        "en": "Sign up to The Entity",  // The default language is used if none of the languages match
        "fr": "S'inscrire à l'organisation"
    },

    // The URL to open
    "url": "https://census-register.cloud/sign-up/",

    // Endpoint to POST to with publicKey and signature+timestamp JSON fields
    // Returning true will show the action and hide it otherwise
    "visible": "https://census-registry.cloud/lambda/visible-actions?action=register"
    // "visible": "always"    (always visible, alternatively)
}
```

- The embedded web site can send messages to the host app
- Messages can request the public key or signing payloads
- If `register` is `true`, the mobile app should display the action in a featured location

#### Image upload

Prompt the user to upload one or more pictures, coming from the camera or from the image library

```json
{
  "type": "image",

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

  // The URL will receive the following query string parameters:
  // - signature = sign(hash(jsonBody), privateKey)
  // - publicKey
  "url": "https://census-registry.cloud/lambda/upload-kyc-pictures/",

  // Endpoint to POST to with publicKey and signature+timestamp fields
  // Returning true will show the action and hide it otherwise
  "visible": "https://census-registry.cloud/lambda/image-upload-visible/"
}
```

The endpoint from `url` will receive a POST request with a JSON payload like:
```json
{
  "image1": "base64-image-payload-1",
  "image2": "base64-image-payload-2",
  ...
}
```

Keys like `image1`, `image2`, etc will match every `name` given for the entries of `source[]`

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

<!-- ## ENS

> ENS’s job is to map human-readable names like ‘alice.eth’ to machine-readable identifiers such as Ethereum addresses, content hashes, and metadata. ENS also supports ‘reverse resolution’, making it possible to associate metadata such as canonical names or interface descriptions with Ethereum addresses.

ENS exist to suit our exact purpose, we endorse it, but we may not make complete use of it.

### Overview

There are two smart contracts that make it work:

> The `ENS registry` is deliberately straightforward and exists only to map from a name to the resolver responsible for it.

> `Resolvers` are responsible for the actual process of translating names into addresses. Any contract that implements the relevant standards may act as a resolver in ENS.

The usual interaction will be:

1. Ask to the registry what resolver is responsible for a domain
2. Ask for a property of this resolver. Usually, this is an address, but it can be anything. And this is what we can make use of

![Basic ENS interaction](https://lh5.googleusercontent.com/_OPPzaxTxKggx9HuxloeWtK8ggEfIIBKRCEA6BKMwZdzAfUpIY6cz7NK5CFmiuw7TwknbhFNVRCJsswHLqkxUEJ5KdRzpeNbyg8_H9d2RZdG28kgipT64JyPZUP--bAizozaDcxCq34) -->

<!-- ### No Mainnet

Vocdoni may be used in different networks other than the Ethereum Mainnet.

This presents a potential attack vector where a malicious entity supplanting a Mainnet domain in an alternative network. This is is very relevant to us because we will have users that are not illiterate about it, and communicating the difference between networks is very hard.

Therefore, we understand that we should only make use of ENS domains in the Ethereum Mainnet, independently from the network where the rest of Vocdoni smart contracts are deployed.

At the same time, we understand that some implementations of Vocdoni may not have a use for ENS, therefore we should not rely on it for any fundamental architectural design.

We do make use of the ENS resolvers and we follow the same architecture since there is a lot of value in potentially using ENS domains. -->

<!-- ### ENS domain authentication

If ENS domains are used in the future, the `entityId` would be the [ENS node](https://docs.ens.domains/terminology), otherwise, the `entityId` is the hash of the address that created the entity.

`ENS public resolver` permission access to edit and add records is through the ENS registry. The `msg.sender` [needs to match](https://github.com/ensdomains/resolvers/blob/180919414b7f1dec80100b4aeff081d5afa8f3ce/contracts/PublicResolver.sol#L23) the owner of the ENS domain -->

<!-- ### Comparison

Some implementations may decide to make use of ENS domains

|                                   | Minimal             | ENS support |
| --------------------------------- | ------------------- | ----------- |
| On Mainnet                        |                     | ✓           |
| Usage of ENS domains              |                     | ✓           |
| **Resolver**                      |                     |             |
| EntityId  (node)                  | Record creator hash | ENS node    |
| Authentication                    | Record creator      | ENS owner   |
| Storage of text records           | ✓                   | ✓           |
| Storage of array of text records  | ✓                   | ✓           |
| Other Vocdoni specific interfaces | ✓                   | ✓           | -->
