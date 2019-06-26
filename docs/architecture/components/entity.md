# Entity

An entity can have many roles. For the most part, it is the organizer and the ultimate responsibility of a voting process. However, an Entity could make no use of the voting system and instead be used as a trusted actor by

- Publishing news/information via the [Feed](#feed)
- Providing pointers to trusted/related [Entities](#entities-list)
- Providing [Gateway boot nodes](#gateway-boot-nodes) or Relays

## Index

- [Entity Resolver](#entity-resolver)
  - [Storage of Text records](#storage-of-text-records)
  <!-- - [Storage of lists of text](#storage-of-text-list) -->
  - [Naming convention for Resolver keys](#naming-convention-for-resolver-keys)
- [Entity](#entity)
  - [Index](#index)
  - [Entity Resolver](#entity-resolver)
    - [Storage of Text records](#storage-of-text-records)
    - [Storage of Text List records](#storage-of-text-list-records)
    - [Record guidelines](#record-guidelines)
    - [Resolver keys](#resolver-keys)
  - [Data schema](#data-schema)
    - [Meta](#meta)
    - [Gateway boot node](#gateway-boot-node)
    - [Relay](#relay)
    - [Gateway update](#gateway-update)
    - [Entity reference](#entity-reference)
    - [Feed](#feed)
    - [Entity Actions](#entity-actions)
  - [ENS](#ens)
    - [Overview](#overview)
    - [No Mainnet](#no-mainnet)
    - [ENS domain authentication](#ens-domain-authentication)
    - [Comparison](#comparison)

---

For the most part, the entity metadata lives in the blockchain. Alternatively, it is indexed in the blockchain and retrieved using P2P communication.

- Data on the Blockchain provides durability and enables integrity checking
- Data on content-addressed filesystems allows transferring of larger data objects at the expense of a higher risk of data availability problems.

We refer to this data aggregate as the Entity Metadata.

---

## Entity Resolver

An **[Entity Resolver](#entity-resolver)** is the smart-contract where the Entity metadata is stored/indexed. It follows the same architecture as an ENS resolver contract but currently does not make use of ENS domains.

The `entityId` is the unique identifier of each entity, being a hash of its creator's address:

```solidity
bytes32 entityId = keccak256 (entityAddress);
```

An Entity Resolver implements the following interfaces

- Storage of Text records
- Storage of Text List records

### Storage of Text records

We make use of [EIP 634: Storage of Text records in ENS](https://eips.ethereum.org/EIPS/eip-634). It is a convenient way to store arbitrary data as a string following a key-value store model.

[Implementation](https://github.com/vocdoni/dvote-solidity/blob/master/contracts/profiles/TextResolver.sol)
  
### Storage of Text List records

This is necessary in order to minimize the amount of data to write when the metadata can be split.

The client is responsible for managing the indexes, the array does not move its elements.

The behaviour wants to mimic the `storage of text records`

Assume records are not sorted

[Implementation](https://github.com/vocdoni/dvote-solidity/blob/master/contracts/profiles/TextListResolver.sol)
  
### Record guidelines

>This guidlines apply to [Storage of Text records](#storage-of-text-records) as well as  [Storage of lists of text records](#storage-of-text-list-records).

Content URIs are formatted using the [Content URI specification](/architecture/protocol/data-origins?id=content-uri).

Any other record stored under Vocdoni's key convention is formatted as a stringified JSON object

- **Objects**  `JSON.parse('{"keyName":"valueGoesHere"}')` => `{ keyName: "valueGoesHere" }`
- **Arrays**  `JSON.parse('["0x1234","0x2345","0x3456"]')` => `[ "0x1234", "0x2345", "0x3456" ]`
- **Strings**  `JSON.parse('"String goes here"')` => `"String goes here"`
- **Numbers**  `JSON.parse('8')` => `8`
- **Booleans**  `JSON.parse('true')` => `true`

### Resolver keys

[EIP 634](https://eips.ethereum.org/EIPS/eip-634) convention:
> Keys must be made up of lowercase letters, numbers and the hyphen (-). Vendor-specific services must be prefixed with vnd.

Because of the extensive use, we make of the keys we extend the convention like such:

`<prefix>.<purpose>.<attribute>`

- `prefix`: **mandatory**. To not kidnap ENS keys. In our case, this is always `vnd.vocdoni`
- `purpose`:  **mandatory**. what is this key used for?
- `attribute`: **optional**. What is special about key compared to other keys with the same `purpose` (active/ended, trusted, locale)

Below is a table with the proposed standard for key/value denomination.

#### Text record keys

&nbsp;

| Key                                 | Example                                                       | Description                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `vnd.vocdoni.languages`             | '["en", "fr"]'                                                | Languages supported by the entity ([ISO codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)). The first language is the default one.                            |
| `vnd.vocdoni.meta`                  | 'bzz://12345,ipfs://12345'                                    | [Content URI](/architecture/protocol/data-origins?id=content-uri) to fetch the JSON metadata. <br/>See [Meta](#meta). |
| `vnd.vocdoni.voting-contract`       | '0xccc'                                                       | Address of the Processes Smart Contract instance used by the entity                                                   |
| `vnd.vocdoni.gateway-update`        | '&lt;GatewayUpdate&gt;'                                       | Parameters for Gateways to report availability to boot nodes. See [Gateway update](#gateway-update)                   |
| `vnd.vocdoni.process-ids.active`    | '["0x987","0x876"]'                                           | List of `processId`'s displayed as available by the client                                                            |
| `vnd.vocdoni.process-ids.ended`     | '["0x887","0x886"]'                                           | List of `processId`'s displayed as unavailable by the client                                                          |
| `vnd.vocdoni.avatar`                | 'https://liberland.org/logo.png'                              | [Content URI](/architecture/protocol/data-origins?id=content-uri) of an image file to display next to the entity name |

**Language dependent fields**

For every language defined on `vnd.vocdoni.languages`, there has to be a text record in the form of `vnd.vocdoni.name.<lang>`, `vnd.vocdoni.description.<lang>` and `vnd.vocdoni.news-feed.<lang>`.

| Key                                 | Example                                                       | Description                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `vnd.vocdoni.name.en`        | 'Free Republic of Liberland'                               | Entity description in a specific language                                                                            |
| `vnd.vocdoni.description.en` | 'In a sovereign state...'                                   | Entity description in a specific language                                                                            |
| `vnd.vocdoni.news-feed.en`          | 'ipfs://23456,https://liberland.org/feed/en' | [Content URI](/architecture/protocol/data-origins?id=content-uri) of the feed in a specific language.                |

#### Text List record keys

&nbsp;

| Key                                          | Record example            | Description                                                                                                   |
| -------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `vnd.vocdoni.gateway-boot-nodes`             | '&lt;GatewayBootNode&gt;' | Data of the boot nodes to ask for active gateways. [See below](#gateway-boot-nodes) for more details          |
| `vnd.vocdoni.boot-entities`                  | '&lt;EntityReference&gt;' | List of [Entity reference](#entity-reference)s suggestions for the user to subscribe                          |
| `vnd.vocdoni.fallback-bootnodes-entities`    | '&lt;EntityReference&gt;' | List of [Entity reference](#entity-reference)s to borrow the bootnodes from in case of failure.               |
| `vnd.vocdoni.trusted-entities`               | '&lt;EntityReference&gt;' | List of [Entity reference](#entity-reference)s that the current entity trusts.                                |
| `vnd.vocdoni.census-services`                | 'pss://12345'             | [Messaging URI](/architecture/protocol/data-origins?id=messsaging-uri) to use to reach a given census-service |
| `vnd.vocdoni.census-service-source-entities` | '&lt;EntityReference&gt;' | Tells the entity's census service which resolver+entities to get the settings from.                           |
| `vnd.vocdoni.census-ids`                     | '0xcc1'                   | CensusIds that the census-service keeps alive                                                                 |
| `vnd.vocdoni.census-manager-keys`            | '0xcc2'                   | Public keys that can control the census-service. Currently any key can control any census-id                  |
| `vnd.vocdoni.relays`                         | '&lt;Relay&gt;'           | Relays public keys                                                                                            |

## Data schema

### Meta

**Description**

It replicates the entire data of the Entity metadata stored in the resolver in a single JSON object.

Its purpose is to minimize the retrival of metadata requests.

This creates two sources of truth. The metadata in the contract itself and the one in this object.

>In the event of a mismatch, the metadata on the blockchain is used.

**Usage**

`vnd.vocdoni.meta` is the content URI where the JSON is stored.

The retrieval of `vnd.vocdoni.meta` is prioritized, and for the most part, the client won't have the need to retrieve other keys. This makes the query of this data quite critical.

The retrieval via `HTTP` is discouraged.

The fields in the JSON replicate the same exact structure that the keys in the resolver, with some caveats:

- The prefix `vnd.vocdoni.` is omitted
- Dots (`.`) indicate object hierachy
- If it is a `Text List record` it is represented as an array of the records
- It may extend the fields from the blockchain, but never contain less. `EntityActions` is a relevant one.

The client should ensure that this file matches the metadata in the blockchain.

**Schema**

Name: Meta

```json
{

  // ENS Text Records

  "version": "1.0",    // Protocol version
  "languages": ["en", "fr"], // "en" is the default language
  "name": {
    "en": "Free Republic of Liberland",
    "fr": "République Livre de Liberland"
  },
  "description": {
    "en": "In a sovereign state...",
    "fr": "Dans un état souverain"
  },
  "voting-contract": "0xccc",
  "gateway-update":{
    "timeout": 60000,                   // milliseconds after which a Gateway is marked as down
    "topic": "vocdoni-gateway-update",  // Topic used for the messaging protocol
    "difficulty": 1000                  // Difficulty of the proof of work, to prevent spammers
  },
  "process-ids":{
    "active":["0x987","0x876"],
    "ended":["0x887","0x886"]
  },
  "news-feed":{
    "en": "bzz-feed://34567,ipfs://34567,https://liberland.org/feed/",
    "fr": "bzz-feed://23456,ipfs://23456,https://liberland.org/feed/fr"
  },
  "avatar": "https://liberland.org/logo.png,bzz://12345,ipfs://12345",
  ...

  // ENS Text List records
  
  "gateway-boot-nodes": [  // Bootnodes providing a list of active Gateways
    {
      "update": "pss://publicKey@0x0",
      "fetch": "https://hostname:port/route"
    },
  ],
  // List of currently active Relays. This list is just for informational purposes.
  // The effective list of relays for a voting process is within the Process Metadata
  // and the Voting Process smart contract
  "relays": [
      {
        "publicKey": "0x23456...",  // Key to encrypt data sent to it
        "messagingUri": "<messaging-uri>"    // Where to send messages. See Data origins > Messaging URI
      },
      ...
  ],
  "actions": [ <actions> ], // See Entity Actions below
  ...
}
```

**Sequence diagrams:**

- [Set Entity metadata](/architecture/sequence-diagrams?id=set-entity-metadata)
- [Entity subscription](/architecture/sequence-diagrams?id=entity-subscription)

### Gateway boot node

**Description**

Client apps will normally be unable to join P2P networks by themselves, so Vocdoni makes use of Gateways to enable decentralized transactions over HTTP/HTTPS.

A gateway-boot-node is a server trusted by the Entity whose goal is to provide a list of active gateway IP addresses via HTTPS

Considerations:

- A gateway-boot-node is a best effort starting point
- To minimize censorship attacks organizations should provide their own set of Gateways.

**Usage**

`vocdoni.gateway-boot-nodes` provides a list of currently active boot-nodes.

Additionally, initial boot nodes are hardcoded into the client App to prevent the chicken and the egg problem of an App unable to find an active gateway in the blockchain because it does not have a gateway in the first place.

**Schema**

Name: GatewayBootNode

```json
  {
    "update": "pss://publicKey@0x0",        // Messaging URI to use for notifying updates to the bootnode
    "fetch": "https://hostname:port/route"  // URL to use for fetching the list of Gateways
  }
```

### Relay

`WIP`

```json
{
  "publicKey": "0x23456...",  // Key to encrypt data sent to it
  "messagingUri": "<messaging-uri>"    // Where to send messages. See Data origins > Messaging URI
}
```

### Gateway update

**Description**

Boot-node servers provide the list of available gateways at the time of requesting. In order to keep an accurate state, `gateways` need to notify specific events to show that they are still alive.

This data schema provides the necessary params for the Gateways to communicate with the boot-nodes.

**Usage**

`vnd.vocdoni.gateway-update` Text record provides the details that Gateways need to use.

This value is global and affects all the Gateways of the Entity.

**schema**

Name: GatewayUpdate

```json
{
  "timeout": 60000,                   // milliseconds after which a Gateway is marked as down
  "topic": "vocdoni-gateway-update",  // Topic used for the messaging protocol
  "difficulty": 1000                  // Difficulty of the proof of work, to prevent spammers
}
```

### Entity reference

**Description**

It is a pointer to the metadata of a specific entity.

**Usage**

Lists of `EntityReference`s have several purposes.

- `vnd.vocdoni.boot-entities`: An entry point for the user to subscribe to new entities.
- `vnd.vocdoni.fallback-boot-nodes-entities`: If the can' reach the boot-nodes it will use the `vocdoni.gateway-boot-nodes` from these entities
- `vnd.vocdoni.trusted-entities`: Aimed for the end-user as a simple discovery mechanism for entities trusted by the current one.
- `vnd.vocdoni.census-service-source-entities`: Tells the entity's census service which resolver+entities to get the settings from. Useful to allow census services to operate for more than one entity.

**Schema**

Name: EntityReference
```json
{
  "resolverAddress": "0xaaa", //contract address of the smart-contract
  "entityId": "0xeee"         //entityId. Hash of the the creator address
}
```

### Feed

**Description**
The `Feed` serves the purpose of having a uni-directional censorship-resistant communication channel between the `Entity` and the `user`.

It serves a similar purpose of RSS or Atom feed.

**Usage**

Currently, only a `news-feed` is supported but multiple feeds could coexist.

It is localized using the language key. The specific language to retrieve is decided on the client based on `vnd.vocdoni.languages`

It is referenced with a [Content URI](/architecture/protocol/data-origins?id=content-uri).

`vnd.vocdoni.news-feed.en`
`vnd.vocdoni.news-feed.fr`

**Schema**

Content feeds are expected to conform to the specs of the [JSON feed specification](https://jsonfeed.org/version/1)

### Entity Actions

**Description**
Entity Actions are custom operations that clients will be offered to perform. Their definition is stored within the [JSON metadata](#json-metadata).

Below is a reference to supported use cases:

Name: EntityActions
```json
{
    ...
    "actions": [{

        // Opening an interactive web browser
        "type": "browser",

        // Localized Call To Action to appear on the app
        "name": {
            "en": "Sign up to The Entity",  // first is used if none of the languages matches
            "fr": "S'inscrire à l'organisation"
        },

        // The URL to open
        // - The embedded web site can send messages to the host app
        // - Messages can request the public key, or a signature
        "url": "https://census-register.cloud/sign-up/",

        // Endpoint to POST to with publicKey and signature+timestamp JSON fields
        // Returning true will show the action and hide it otherwise
        "visible": "https://census-registry.cloud/lambda/census-register-visible/"
        // "visible": true    (always visible, alternatively)
    },
    {
        // App-driven image upload example
        "type": "image",

        // Localized Call To Action to appear on the app
        "name": {
            "en": "Verify my identity",  // used if none of the languages matches
            "fr": "Vérifier mon identité"
        },

        // Requested image types to provide
        "source": [

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

        // Endpoint accepting POST requests with JSON payload:
        // {
        //   name1: "base64-image-payload",
        //   name2: "base64-image-payload",
        //   ...
        // }
        //
        // The URL will receive the following query string parameters:
        // - signature = sign(hash(jsonBody), privateKey)
        // - publicKey
        "url": "https://census-registry.cloud/lambda/upload-kyc-pictures/",

        // Endpoint to POST to with publicKey and signature+timestamp fields
        // Returning true will show the action and hide it otherwise
        "visible": "https://census-registry.cloud/lambda/image-upload-visible/"
    }]
}
```

## ENS

> ENS’s job is to map human-readable names like ‘alice.eth’ to machine-readable identifiers such as Ethereum addresses, content hashes, and metadata. ENS also supports ‘reverse resolution’, making it possible to associate metadata such as canonical names or interface descriptions with Ethereum addresses.

ENS exist to suit our exact purpose, we endorse it, but we may not make complete use of it.

### Overview

There are two smart contracts that make it work:

> The `ENS registry` is deliberately straightforward and exists only to map from a name to the resolver responsible for it.

> `Resolvers` are responsible for the actual process of translating names into addresses. Any contract that implements the relevant standards may act as a resolver in ENS.

The usual interaction will be:

1. Ask to the registry what resolver is responsible for a domain
2. Ask for a property of this resolver. Usually, this is an address, but it can be anything. And this is what we can make use of

![Basic ENS interaction](https://lh5.googleusercontent.com/_OPPzaxTxKggx9HuxloeWtK8ggEfIIBKRCEA6BKMwZdzAfUpIY6cz7NK5CFmiuw7TwknbhFNVRCJsswHLqkxUEJ5KdRzpeNbyg8_H9d2RZdG28kgipT64JyPZUP--bAizozaDcxCq34)

### No Mainnet

Vocdoni may be used in different networks other than the Ethereum Mainnet.

This presents a potential attack vector where a malicious entity supplanting a Mainnet domain in an alternative network. This is is very relevant to us because we will have users that are not illiterate about it, and communicating the difference between networks is very hard.

Therefore, we understand that we should only make use of ENS domains in the Ethereum Mainnet, independently from the network where the rest of Vocdoni smart contracts are deployed.

At the same time, we understand that some implementations of Vocdoni may not have a use for ENS, therefore we should not rely on it for any fundamental architectural design.

We do make use of the ENS resolvers and we follow the same architecture since there is a lot of value in potentially using ENS domains.

### ENS domain authentication

If ENS domains are used in the future, the `entityId` would be the [ENS node](https://docs.ens.domains/terminology), otherwise, the `entityId` is the hash of the address that created the entity.

`ENS public resolver` permission access to edit and add records is through the ENS registry. The `msg.sender` [needs to match](https://github.com/ensdomains/resolvers/blob/180919414b7f1dec80100b4aeff081d5afa8f3ce/contracts/PublicResolver.sol#L23) the owner of the ENS domain

### Comparison

We mostly make use of ENS resolvers to store metadata.

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
| Other Vocdoni specific interfaces | ✓                   | ✓           |
