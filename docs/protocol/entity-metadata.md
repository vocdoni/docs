# Entity metadata

An entity can have many roles. For the most part, is the organizer and the ultimate responsible of a voting process.

But it could not make use of the voting mechanism an instead just be an element of trust:

- Can publish news/information via the [Feed](#feed)
- Can provide pointers to trusted/related [Entities](#entities-list)
- Can provide [Gateway boot nodes](#gateway-boot-nodes) or relays

For the most part, all this data lives in the blockchain. Alternatively, it is indexed in the blockchain and retrieved using other protocols.

We call all this data `Entity-metadata`

## Index
- [Entity metadata](#entity-metadata)
  - [Index](#index)
  - [Resolver](#resolver)
    - [Interface: Storage of text records](#interface-storage-of-text-records)
    - [Interface: Storage of lists of text](#interface-storage-of-lists-of-text)
    - [Naming convention for keys](#naming-convention-for-keys)
  - [Data-schema](#data-schema)
    - [Entity metadata](#entity-metadata-1)
    - [Gateway boot nodes](#gateway-boot-nodes)
    - [Entities list](#entities-list)
    - [Feed](#feed)
    - [Actions](#actions)
  - [ENS](#ens)
    - [Overview](#overview)
    - [No Mainnet](#no-mainnet)
    - [ENS domain authentication](#ens-domain-authentication)
    - [Comparison](#comparison)

---

## EntityResolver

The EntityResolver contract stores all the information about many entities, and it conforms with **Public ENS resolvers** spec's.

- https://docs.ens.domains/contract-api-reference/publicresolver#set-text-data
- https://docs.ens.domains/contract-api-reference/publicresolver#get-text-data

Domain names are not used at this point. Only `Text` records are used as a key-value storage on the resolver contract of choice by the entity. 

```solidity
setText (entityId, key, value);
```

The `entityId` is the unique identifier of each entity, being a hash of its creator's address:

```solidity
bytes32 entityId = keccak256 (entityAddress);
```

- Multiple resolver instances can coexist. 
  - Enity ID's and their resolver's address need to be provided
- We make use of ENS resolvers interfaces
  - ENS domains may be used in the future

If ENS domains are used in the future, the `entityId` would be the [ENS node](https://docs.ens.domains/terminology), otherwise, the `entityId` is the hash of the address that created the entity.

### Interface: Storage of Text records

[EIP 634: Storage of text records in ENS](https://eips.ethereum.org/EIPS/eip-634) is convenient to store arbitrary data as a string.

A Vocdoni compatible entity must define specific keys (listed below), resolving to strings with JSON objects.

```solidity
function text(bytes32 node, string key) constant returns (string text);
```

Any valid JSON payload may be stored. This applies to:
- **Objects**  `JSON.parse('{"keyName":"valueGoesHere"}')` => `{ keyName: "valueGoesHere" }`
- **Arrays**  `JSON.parse('["0x1234","0x2345","0x3456"]')` => `[ "0x1234", "0x2345", "0x3456" ]`
- **Strings**  `JSON.parse('"String goes here"')` => `"String goes here"`
- **Numbers**  `JSON.parse('8')` => `8` 
- **Booleans**  `JSON.parse('true')` => `true` 

**Important:** It is the Entity's responsibility to ensure that the stored data properly parses into a valid JSON object, once retrieved from the blockchain. 

#### **Do**
- Use `Text` records to store rather small pieces of data
- Use `Text` records to store data that may change frequently

#### **Don't**
- Use the EntityResolver to store large objects
  - Instead, define [Content URI](/protocol/data-schema?id=content-uri) links to data that can live on Swarm, IPFS, etc.
- Use Swarm/IPFS to store data that is already in a `Text` record
  - An update to one field will need publishing at least three updates
  - This might introduce divergence between the blockchain and data on Swarm/IPFS

### Storing larger payloads

To handle arbitrarily long JSON payloads or even images, media, etc., you may definitely want to use a decentralized filesystem to pin a file and keep the pointer to it in the appropriate `Text` record. 

See [Content URI](/protocol/data-schema?id=content-uri) for examples. 

### Naming convention for keys

Below is a table with the proposed standard for key/value denomination. 

**Important:** Any JSON data stored on the resolver is expected to be **stringified**. For clarity, the examples below are just plain JSON, but actual values should be used [like the examples above](/protocol/entity-metadata?id=interface-storage-of-text-records).

| Key                                       | Example                                                | Description                                                                |
|-------------------------------------------|--------------------------------------------------------|----------------------------------------------------------------------------|
| **Required keys**                       |                                                        |                                                                            |
| `name`                                    | Free Republic of Liberland                             | Fallback of the organization name (used if we fail to fetch the full metadata JSON file) |
| `vndr.vocdoni.meta`                       | 0xabc                                                | [Content URI](/protocol/data-schema?id=content-uri) to fetch all the metadata from. See [Entity Metadata](#entity-metadata-1) below.      |
| **Supported keys**                        |                                                        |                                                                            |
| `vndr.vocdoni.censusRequestUrl`           | https://liberland.org/en/citizenship                 | Endpoint to navigate to in order to join.                                        |
| `vndr.vocdoni.processContract`            | 0xccc                                                | Address of the Processes Smart Contract instance used by the entity                        |
| `vndr.vocdoni.gatewayBootnodes`           | [{&lt;gatewayBootnode&gt;}, ...]                             | Data of the boot nodes to query for active gateways. [See below](#gateway-boot-nodes) for more details                         |
| `vndr.vocdoni.relays`                     | ["0x123","0x234"]                                    | The public key of the supported relays                                                 |
| `vndr.vocdoni.processess.active`          | ["0x987","0x876"]                                    | Processess displayed as available by the client                           |
| `vndr.vocdoni.processess.past`        | ["0x887","0x886"]                                    | Processess that already ended                           |
| `vndr.vocdoni.processess.upcoming`            | ["0x787","0x776"]                                    | Processess that will become active in the future                           |
| `vndr.vocdoni.feed`                  | https://liberland.org/feed                           | [Content URI](/protocol/data-schema?id=content-uri) to fetch a [JSON feed](https://jsonfeed.org/)        |
| `vndr.vocdoni.description`                | Is a sovereign state...                              | A fallback of a self-descriptive text (used on failure to fetch the JSON localized version)                             |
| `vndr.vocdoni.avatar`               | https://liberland.org/logo.png                       | [Content URI](/protocol/data-schema?id=content-uri) of an image file to display next to the entity name                      |
| `vndr.vocdoni.keysToDisplay`              | ["podcast_feed", "vndr.twitter", "constitution_url"] | Keys the user wants to be displayed on its page                            |
| `vndr.vocdoni.entities.suggested`              | [{&lt;entityRef&gt;}]                                        | A list of suggested entities.  See [Entities List](#entities-list)        |
| `vndr.vocdoni.entities.related`              | [{&lt;entityRef&gt;}]                                        | A list of related entities.  See [Entities List](#entities-list)        |
| `vndr.vocdoni.entities.fallback.bootnodes` | [{&lt;entityRef&gt;}]                                         | A [list of entities](#entities-list) to borrow the bootnodes from in the case of failure.                                                             |
| **Arbitrary keys**                        |                                                        |                                                                            |
| `podcast.feed`                             | https://liberland.org/podcast.rss                       | (Custom values)                                                                           |
| `constitution.http`                       | https://liberland.org/en/constitution                  |  (Custom values)                                                                          |
| `vndr.twitter`                            | https://twitter.com/Liberland_org                      |  (Custom values)                                                                          |

## Data-schema

### Entity metadata

It holds the entire data of the Entity in a single JSON object. It is used to simplify the retrival of metadata and to avoiding redundant requests.

This could create two sources of truth. The metadata in the contract itself and the one in this object. **In the event of a mismatch, the metadata on the blockchain is used.**

**JSON metadata**

```json
{
  "version": "1.0",    // Protocol version
  "name": {
    "default": "Free Republic of Liberland",
    "fr": "République Livre de Liberland"
  },
  "description": {
    "default": "In a sovereign state...",
    "fr": "Dans un état souverain"
  },
  "censusRequestUrl": "https://liberland.org/en/citizenship",
  "processContract": "0xccc",
  "gatewayBootnodes": [
    {
      "publicKey": "0x12345", // used to encrypt the communication between the Bootnode and Gateways
      "updateProtocol": "pss",
      "updateParams": { "updateFrequency": 10000, "topic": "vocdoni_gateways", "address": "0x" },
      "difficulty": integer,
      "host": "ip or domain name",
      "port": port,
      "protocol": "http/https/ws"
    }
  ],
  "processess":{
    "active": ["0x987","0x876"],
    "past":["0x887","0x886"],
    "upcoming":["0x787","0x776"]
  }
  "actions": [ <actions> ], // See below
  "avatar": "https://liberland.org/logo.png,bzz://12345,ipfs://12345",
  "content": {
    "news": {
      "name": {
        "default": "Official news",
        "fr": "Journal"
      },
      "origin": "https://liberland.org/feed,bzz-feed://23456,ipfs://23456" // JSON Feed
    }
  }
  ...
}
```

### Gateway boot nodes

Client apps will normally be unable to join P2P networks by themselves, so Vocdoni makes use of Gateways to enable decentralized transactions over HTTP/S. However, a decentralized system has no guarantee of what Gateways will be up at the current time.

This field provides a list of bootnodes with the only goal of serving a list of active Gateways. Gateway bootnodes are servers trusted by the Entity

- They provide a list of active Gateways to the client
- They provide Gateways with the necessary information to join the network

This leads to a chicken-and-egg problem. You need a Gateway to fetch data from the Blockchain, but you can't because you don't have a Gateway to fetch from it. The solution is to use a well-known public gateway


### Entities list

Entities lists have several purposes.

- `vndr.vocdoni.entities.suggested` : Entry point for the user to subscribe to new entities.
- `vndr.vocdoni.entities.related`: Reputation/whitelisting mechanism for entities to express a relationship with other entities
- `vndr.vocdoni.entities.fallbackNodes`: As a mechanism to find fallback `gateway boot nodes` on trusted entities.
- Alternative purposes can be added.

Each element on the list hosts an `EntityRef`
- `resolver`: contract address, where the metadata lives,
- `entityId`: unique entity identifier

If it lives in the blockchain it uses the `Storage of lists of text interface`, otherwise is a JSON array.
There could be a centralized search engine that facilitate entities lists.

It uses the key `vndr.vocdoni.entities.<type>`

**entityRef:**
```json
{
  "entityId": "0xeee",
  "resolver": "0xaaa"
}
```

### Feed

The `Feed` serves the purpose of having a uni-directional censorship-resistant communication channel between the `Entity` and the `user`.
You can imagine it as an RSS feed

We follow the [JSON feed specification](https://jsonfeed.org/version/1)

### Actions

Actions are stored in IPFS/SWARM its reference is stored in `vndr.vocdoni.actions`

**actions:**
```json
{
    ...
    "actions": [{

        // Interactive web browser action example
        "type": "browser",

        // Localized name to appear on the app
        "name": {
            "default": "Sign up to The Entity",  // used if none of the languages matches
            "fr": "S'inscrire à l'organisation"
        },

        // The URL to open with query string parameters:
        // - signature = sign(hash(timestamp), privateKey)
        // - publicKey
        // - timestamp (UNIX timestamp)
        "url": "https://census-register.cloud/sign-up/",

        // Endpoint to POST to with publicKey and signature+timestamp JSON fields
        // Returning true will show the action and hide it otherwise
        "visible": "https://census-registry.cloud/lambda/census-register-visible/"
        // "visible": true    (always visible, alternatively)
    },
    {
        // App-driven image upload example
        "type": "image",

        // Localized name to appear on the app
        "name": {
            "default": "ID Card verification",  // used if none of the languages matches
            "fr": "Vérification de la carte d'identité"
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
                    "default": "...",
                    "fr": "..."
                }
            },
            {
                "type": "back-camera",
                "name": "id-back",
                "orientation": "landscape",
                "overlay": "id-card-back",
                "caption": {
                    "default": "...",
                    "fr": "..."
                }
            },

            // Example requesting one more image from the phone's library
            {
                "type": "gallery",
                "name": "custom-1",
                "caption": {
                    "default": "...",
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

This presents a potential attack vector where a malicious entity supplanting a Mainnet domain in an alternative network. This is is very relevant to us because we will have users that are not literate about it, and communicating the difference between networks is very hard.

Therefore, we understand that we should only make use of ENS domains in the Ethereum Mainnet, independently from the network where the rest of Vocdoni smart-contracts are deployed.

At the same time, we understand that some implementations of Vocdoni may not have a use for ENS, therefore we should not rely on it for any fundamental architectural design.

We do make use of the ENS resolvers and we follow the same architecture since there is a lot of value in potentially using ENS domains.

### ENS domain authentication

If we don't make use of the Mainnnet/ENS-domain the `node` is a hash of the address that created the resolver record for the entity.

`ENS public resolver` permission access to edit and add records is through the ENS registry. The `msg.sender` [needs to match](https://github.com/ensdomains/resolvers/blob/180919414b7f1dec80100b4aeff081d5afa8f3ce/contracts/PublicResolver.sol#L23) the owner of the ENS domain

If we don't make use of the Mainnet/ENS-domain, this gets on the way and the contract should be modified to check if the node is the hash of the msg.sender

ENS resolver

```solidity
modifier onlyOwner(bytes32 node) {
    require(ens.owner(node) == msg.sender);
    _;
}
```

No ENS resolver

```solidity
modifier onlyOwner(bytes32 node) {
    require(node == keccak256(msg.sender) );
    _;
}

```

### Comparison

We basically make use of ENS resolvers to store metadata.
Some implementations may decide to make use of ENS domains

|                                   | Minimal             | ENS support |
|-----------------------------------|---------------------|-------------|
| On Mainnet                        |                     | ✓           |
| Usage of ENS domains              |                     | ✓           |
| **Resolver**                      |                     |             |
| EntityId  (node)                  | Record creator hash | ENS node    |
| Authentication                    | Record creator      | ENS owner   |
| Storage of text records           | ✓                   | ✓           |
| Storage of array of text records  | ✓                   | ✓           |
| Other Vocdoni specific interfaces | ✓                   | ✓           |
