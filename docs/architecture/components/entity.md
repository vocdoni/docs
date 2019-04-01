# Entity

An entity can have many roles. For the most part, it is the organizer and the ultimate responsible of a voting process. As such, users need to be able to subscribe to them and retrieve basic information about the entities they care about. 

## Index
- [Entity Resolver](#entity-resolver)
  - [Storage of Text records](#storage-of-text-records)
  <!-- - [Storage of lists of text](#storage-of-lists-of-text) -->
  - [Naming convention for Resolver keys](#naming-convention-for-resolver-keys)
- [Data schema](#data-schema)
  - [Entity metadata](#entity-metadata)
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

The metadata of an Entity is an aggregate of information living on the Blockchain and P2P filesystems. 
- Data on the Blockchain provides durability and enables integrity checking
- Data on P2P filesystems allows to transfer larger data objects in a more flexible way

The starting point is the **[Entity Resolver](#entity-resolver)** contract, but it is tightly coupled with the **[JSON Entity Metadata](#data-schema)** living on P2P filesystems.

However, an Entity could make no use of the voting infrastructure and just be an source of trust:

- Publishing news/information via the [Feed](#feed)
- Providing pointers to trusted/related [Entities](#entities-list)
- Providing [Gateway boot nodes](#gateway-boot-nodes) or Relays

For the most part, all this data lives in the blockchain. Alternatively, it is indexed in the blockchain and retrieved using P2P communication.

We refer to this data aggregate as the Entity Metadata.

---

## Entity Resolver

The Entity Resolver is a standard ENS resolver contract. Its purpose is to provide a key/value store of `Text` records following a naming convention.

For reference about standard ENS Resolvers:
- https://docs.ens.domains/contract-api-reference/publicresolver#set-text-data
- https://docs.ens.domains/contract-api-reference/publicresolver#get-text-data

For reference about the naming convention of Text records within an Entity Resolver see [Naming convention for Resolver keys](#naming-convention-for-resolver-keys).

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

### Storage of Text records

[EIP 634: Storage of Text records in ENS](https://eips.ethereum.org/EIPS/eip-634) is convenient to store arbitrary data as a string.

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
- Use the Entity Resolver to store large objects
  - Instead, define [Content URI](/architecture/protocol/data-origins?id=content-uri) links to data that can live on Swarm, IPFS, etc.
- Use Swarm/IPFS to store data that is already in a `Text` record
  - An update to one field will need publishing at least three updates
  - This might introduce divergence between the blockchain and data on Swarm/IPFS

To handle arbitrarily long JSON payloads or even images, media, etc., you may definitely want to use a decentralized filesystem to pin a file and keep the pointer to it in the appropriate `Text` record. 

See [Content URI](/architecture/protocol/data-origins?id=content-uri) for examples. 

### Naming convention for Resolver keys

Below is a table with the proposed standard for key/value denomination. 

**Important:** Any JSON data stored on the resolver is expected to be **stringified**. For clarity, the examples below appear as plain JSON, but actual values should be used [like the examples above](/architecture/components/entity?id=storage-of-text-records).

**Required keys**

| Key                                       | Example                                                | Description                                                                |
|-------------------------------------------|--------------------------------------------------------|----------------------------------------------------------------------------|
| `name`                                    | Free Republic of Liberland                             | A single-language version of the Entity's name (used as a fallback of the JSON metadata version) |
| `vndr.vocdoni.meta`                       | bzz://12345,ipfs://12345                                        | [Content URI](/architecture/protocol/data-origins?id=content-uri) to fetch the JSON metadata. <br/>See [Entity Metadata](#entity-metadata-1) below.      |


**Supported keys**

| Key                                       | Example                                                | Description                                                                |
|-------------------------------------------|--------------------------------------------------------|----------------------------------------------------------------|
| `vndr.vocdoni.process.instance`            | 0xccc                                                | Address of the Processes Smart Contract instance used by the entity                        |
| `vndr.vocdoni.gateway.bootnodes`           | [{&lt;gatewayBootnode&gt;}, ...]                             | Data of the boot nodes to ask for active gateways. [See below](#gateway-boot-nodes) for more details                         |
| `vndr.vocdoni.bootnodes.update`           | {&lt;bootnodeUpdateParams&gt;}                             | Parameters for Gateways to report availability to boot nodes. [See below](#boot-nodes-gateway-updates) for more details                         |
| `vndr.vocdoni.processess.active`          | ["0x987","0x876"]                                    | List of Process Id's displayed as available by the client                           |
| `vndr.vocdoni.processess.ended`        | ["0x887","0x886"]                                    | List of Process Id's that already ended                           |
| `vndr.vocdoni.processess.upcoming`            | ["0x787","0x776"]                                    | List of Process Id's that will become active in the future                           |
| `vndr.vocdoni.feed`                  | bzz-feed://23456,ipfs://23456,https://liberland.org/feed                           | Fallback version of the [JSON feed](#feed) in the default language. See [Content URI](/architecture/protocol/data-origins?id=content-uri).         |
| `vndr.vocdoni.description`                | Is a sovereign state...                              | A single-language version of a short description (used as a fallback of the JSON metadata version)                             |
| `vndr.vocdoni.avatar`               | https://liberland.org/logo.png                       | [Content URI](/architecture/protocol/data-origins?id=content-uri) of an image file to display next to the entity name                      |
| `vndr.vocdoni.entities.boot`              | [{&lt;entityRef&gt;}]                                        | A starting point of entities list to allow users to browser from a curated list. Only used in "boot" entities like the case of Vocdoni itself.  See [Entities List](#entities-list)        |
| `vndr.vocdoni.entities.trusted`              | [{&lt;entityRef&gt;}]                                        | A list of entities that the own entity trusts.  See [Entities List](#entities-list)        |
| `vndr.vocdoni.entities.fallback.bootnodes` | [{&lt;entityRef&gt;}]                                         | A [list of entities](#entities-list) to borrow the bootnodes from in case of failure.                                                             |

**Arbitrary keys**

| Key                                       | Example                                                | Description                                                                |
|-------------------------------------------|--------------------------------------------------------|----------------------------------------------------------------------------|
| `vndr.liberland.podcast`                   | https://liberland.org/json-feed/                       | (Custom values)                                                                           |
| `vndr.liberland.constitution`              | https://liberland.org/en/constitution                  |  (Custom values)                                                                          |
| `vndr.twitter.username`                    | @Liberland_org                      |  (Custom values)                                                                          |

---

## Data schema

### Entity metadata

It holds the entire data of the Entity in a single JSON object. It is used to simplify the retrival of metadata and to avoid redundant requests.

This could create two sources of truth. The metadata in the contract itself and the one in this object. **In the event of a mismatch, the metadata on the blockchain is used.**

#### **JSON metadata**

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
  "votingProcessInstance": "0xccc",
  "bootnodes": [  // Bootnodes providing a list of active Gateways
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
          "address": "0x1234...",     // PSS adress to help routing messages
          "publicKey": "0x23456...",  // Key to encrypt data sent to it
          "uri": "<messaging-uri>"    // Where to send messages. See Data origins > Messaging URI
      }, 
      ...
  ],
  "actions": [ <actions> ], // See Entity Actions below
  "avatar": "https://liberland.org/logo.png,bzz://12345,ipfs://12345",
  "content": {
    "feed-default": {
      "name": "Official news",
      "origin": "bzz-feed://23456,ipfs://23456,https://liberland.org/feed" // JSON Feed
    },
    "feed-fr": {
      "name": "Journal officiel",
      "origin": "bzz-feed://34567,ipfs://34567,https://liberland.org/feed/fr" // JSON Feed
    }
  }
  ...
}
```

**Sequence diagrams:**

- [Set Entity metadata](/architecture/sequence-diagrams?id=set-entity-metadata)
- [Entity subscription](/architecture/sequence-diagrams?id=entity-subscription)

**Related:**

- [Entity Smart Contract](https://github.com/vocdoni/dvote-solidity/blob/master/contracts/VotingEntity.sol)
- [Entity JS methods](https://github.com/vocdoni/dvote-js/blob/master/src/dvote/entity.ts)

### Gateway boot nodes

Client apps will normally be unable to join P2P networks by themselves, so Vocdoni makes use of Gateways to enable decentralized transactions over HTTP/S. However, a decentralized system has no guarantee of what Gateways will be up at the current time.

This field provides a list of bootnodes with the only goal of serving a list of active Gateways. Gateway bootnodes are servers trusted by the Entity

- They provide a list of active Gateways to the client
- They provide Gateways with the necessary information to join the network

This leads to a chicken-and-egg problem. You need a Gateway to fetch data from the Blockchain, but you can't because you don't know any Gateway to reach the Blockchain from.

To solve that:

* Vocdoni provides initial bootnodes, whose URL's are hardcoded in the `dvote-js` library
* All they do is to serve a list of Gateway IP addresses via https
* One of these Gateways is used to query the [Entity Resolver](/architecture/components/entity?id=entity-resolver) for the address of the **boot organization**
  * The initial Entity Resolver address is hardcoded in `dvote-js`
  * The boot organization of the Entity Resolver above is also hardcoded in `dvote-js`

Considerations:
* Any of these can be totally overriden to fit an organization's needs
* The Gateway servers provided are a best effort starting point
* Any serious organization should definitely provide its own set of Gateways, in order not to depend on us
* If you hare hosting your bootnode server and/or your own Gateways, tell us about it and we can include them too

The `vndr.vocdoni.gateway.bootnodes` text field provides a data structure with the currently active bootnodes:

```json
[
  {
    "update": "pss://publicKey@0x0",        // Messaging URI to use for notifying updates to the bootnode
    "fetch": "https://hostname:port/route"  // URL to use for fetching the list of Gateways
  },
  ...
]
```

#### Boot nodes Gateway updates

Bootnode servers provide the list of available gateways at the time of requesting. In order to keep an accurate state, Gateways need to notify events to the Bootnodes.

To this end, the `vndr.vocdoni.bootnodes.update` text field provides the details that Gateways need to use:

```json
{
  "timeout": 60000, // milliseconds after which a Gateway is marked as down
  "topic": "vocdoni-gatways-update",  // Topic used for the messaging protocol
  "difficulty": 1000                  // Difficulty of the proof of work, to prevent spammers
}
```

This value is global and affects all the Gateways of the Entity.


### Entities list

Entity lists have several purposes.

- `vndr.vocdoni.entities.boot` : Entry point for the user to subscribe to new entities.
- `vndr.vocdoni.entities.trusted`: Reputation/whitelisting mechanism for entities to express a relationship with other entities

Each element on the list contains an `Entity Reference` entry
- `resolverInstance`: The contract instance address, where the Entity's metadata lives
- `entityAddress`: The address of an entity

```json
{
  "entityAddress": "0xeee",
  "resolverInstance": "0xaaa"
}
```

### Feed

The `Feed` serves the purpose of having a uni-directional censorship-resistant communication channel between the `Entity` and the `user`.

Content feeds are expected to conform to the specs of a [JSON Feed](https://jsonfeed.org/) and be accessible through a [Content URI](/architecture/protocol/data-origins?id=content-uri). 

See:
- [JSON feed specification](https://jsonfeed.org/version/1)

### Entity Actions

Entity Actions are custom operations that clients will be offered to perform. Their definition is stored within the [JSON metadata](#json-metadata).

Below is a reference of suported use cases:

```json
{
    ...
    "actions": [{

        // Opening an interactive web browser
        "type": "browser",

        // Localized Call To Action to appear on the app
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

        // Localized Call To Action to appear on the app
        "name": {
            "default": "Verify my identity",  // used if none of the languages matches
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

This presents a potential attack vector where a malicious entity supplanting a Mainnet domain in an alternative network. This is is very relevant to us because we will have users that are not illiterate about it, and communicating the difference between networks is very hard.

Therefore, we understand that we should only make use of ENS domains in the Ethereum Mainnet, independently from the network where the rest of Vocdoni smart contracts are deployed.

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
