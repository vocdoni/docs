# Entity metadata

An entity can have many roles. For the most part, is the organizer and the ultimate responsibility of a voting process.

But it could not make use of the voting mechanism an instead just be an element of trust:

- Can publish news/information via the `feed`
- Can provide pointers to trusted/related `entities`
- Can provide alternative trusted bootstrap nodes or relays

For the most part, all this data lives in the blockchain. Alternatively, it is indexed in the blockchain and retrieved using other protocols.

We call all this data `Entity-metadata`

## Index
- [Entity metadata](#entity-metadata)
  - [Index](#index)
  - [Resolver](#resolver)
    - [Interface: Storage of text records](#interface-storage-of-text-records)
    - [Interface: Storage of lists of text](#interface-storage-of-lists-of-text)
    - [Suggested keys](#suggested-keys)
  - [Data-schema](#data-schema)
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

## Resolver

A resolver is a smart-contract in charge of returning the required data from the user.

Several resolver contracts may exist, they all need to conform with the same interfaces, specified by Vocdoni.

We make use of ENS resolvers interfaces, but not necessarily use ENS domains (see below)

A resolver stores each entity data into a record addressed by an `entityId`. If we use the ENS domains the `entityId` is the [ENS node](https://docs.ens.domains/terminology), otherwise, the `entityId` is the hash of the address that created the entity.

### Interface: Storage of text records

[EIP 634: Storage of text records in ENS](https://eips.ethereum.org/EIPS/eip-634) is convenient to store arbitrary data. It is used as simple key-value storage.

Vocdoni specific keys (`vndr.vocdoni.key`) are represented as JSON objects.

`WIP` Content-addressed data (hashes) with not specific hash function are referenced using [Mulistream/Multicodec](https://github.com/multiformats/multistream). They use the suffix `.hash`

If there is a specific codec for the hash function (in case we want to provide multiple options to be resolved) it should be suffixed with its protocol `.http`, `.bzz`, `.ipfs` ...

```solidity

function text(bytes32 node, string key) constant returns (string text);

```

### Interface: Storage of lists of text

This is necessary in order to minimize the amount of data to write when the metadata can be split.
The user is responsible for managing the indexes, the array does not move its elements.

> The implementation does not exist yet and the API may differ from the final implementation

The behaviour wants to mimic `The storage of text records`

``` solidity

function listText(bytes32 node, string key, uint256 index) constant returns (string text);

function list(bytes32 node, string key) constant returns (string [] text);

```
### Suggested keys

This is a suggested usage for the keys

| Key                                       | Interface | Example                                                | Description                                           |
| ----------------------------------------- | --------- | ------------------------------------------------------ | ----------------------------------------------------- |
| **"Required" keys**                       |           |                                                        |                                                       |
| `name`                                    | text      | Free Republic of Liberland                             | Organization's name to be displayed                   |
| `vndr.vocdoni.censusRequest.http`         | text      | "https://liberland.org/en/citizenship"                 | To request to be part of the entity                   |
| `vndr.vocdoni.processContract`            | text      | "0xccc"                                                | Pointer to the contract used for the processess       |
| `vndr.vocdoni.gatewayBootnodes`           | list      | <see gatewayBootnodes below>                           | gatewayBootnodes metadata                             |
| `vndr.vocdoni.relays`                     | list      | "["0x123","0x234"]"                                    | Relay keys                                            |
| `vndr.vocdoni.processess.active`          | list      | "["0x987","0x876"]"                                    | Processess tht the client will desplay as active      |
| `vndr.vocdoni.actions.ipfs`               | text      | "0xaaa"                                                | Pointer to entity Actions. See below                  |
| **Supported keys**                        | text      |                                                        |                                                       |
| `vndr.vocdoni.processess.test`            | list      | "["0x787","0x776"]"                                    | Processess tht the client will desplay as active      |
| `vndr.vocdoni.processess.inactive`        | list      | "["0x887","0x886"]"                                    | Processess tht the client will desplay as active      |
| `vndr.vocdoni.feed.http`                  | text      | "https://liberland.org/feed"                           | Pointer to a feed. See below. Resolved via http.      |
| `vndr.vocdoni.feed.hash`                  | text      | "0xfe1"                                                | Pointer to a feed. See below. Could be IPFS or SWARM  |
| `vndr.vocdoni.feed.ipfs`                  | text      | "0xfe2"                                                | Pointer to a feed. See below. Via IPFS                |
| `vndr.vocdoni.feed.bzz`                   | text      | "0xfe3"                                                | Pointer to a feed. See below. Via Swarm               |
| `description`                             | text      | Is a sovereign state...                                | A self-descriptive text                               |
| `avatar.http`                             | text      | https://liberland.org/logo.png                         | An image file to be displayed next to the entity name |
| `avatar.hash`                             | text      | 0xaaa                                                  | To retreive from IPFS of for checksum                 |
| `vndr.vocdoni.keysToDisplay`              | list      | "["podcast_feed", "vndr.twitter", "constitution_url"]" | Keys the user wants to be displayed on its page       |
| `vndr.vocdoni.entities.trusted`           | list      | "0xeee"                                                | Contract address. See Nested Entities section below   |
| `vndr.vocdoni.entities.fallbackBootnodes` | list      | "0xeee"                                                | Contract address. See Nested Entities section below   |
| **Arbitrary keys**                        | text      |                                                        |                                                       |
| `podcast_feed`                            | text      | http://liberland.org/podcast.rss                       |                                                       |
| `constitution.http`                       | text      | https://liberland.org/en/constitution                  |                                                       |
| `vndr.twitter`                            | text      | https://twitter.com/Liberland_org                      |                                                       |

## Data-schema

### Gateway boot nodes

Gateways boot nodes are servers trusted by the Entity

- They provide a list of potential gateways to the client
- They provide the gateways with the necessary information to join the network

The data is fetched directly from the blockchain, otherwise, the user may not be able to fetch the gateway data because she doesn't have access to the gateway...

It uses the `Storage of lists of text interface`

```json
    {
    "pubKey": "public key", //used to encrypt the communication between the bootnode and the gateway
    "updateProto": "pss",
    "updateParams": { "updateFrequency": 10000, "topic":"vocdoni_gateways", "address":"0x" },
    "difficulty": integer,
    "host": "IP/DNS",
    "port": port,
    "protocol": "http/https/ws"
  }
]
```

### Entities list

Entities lists have several purposes.

- They serve as an entry point for the user to subscribe to new entities
- They provide a reputation/whitelisting mechanism for entities to express a relationship with other entities
- They provide a fallback mechanism to find fallback `gateway boot nodes` on trusted entities.

Each element on the list hosts the `resolver contract` address, where the metadata lives, and the `entityId`.

If it lives in the blockchain it uses the `Storage of lists of text interface`, otherwise is a JSON array.

It uses the key `vndr.vocdoni.entities.<type>`

```json
{
  "entityId":"0xeee",
  "resolver":"0xaaa"
}
```

### Feed

The `Feed` serves the purpose of having a uni-directional censorship-resistant communication channel between the `Entity` and the `user`.
You can imagine it as an RSS feed

We follow the [JSON feed specification](https://jsonfeed.org/version/1)

### Actions

Actions are stored in IPFS/SWARM its reference is stored in `vndr.vocdoni.actions.ipfs`

```json
{
    "version": "1.0",    // Protocol version
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
    }],
    "content": {
        "news": {
            "name": {
                "default": "Official news",
                "fr": "Messages officiels"
            },
            "origin": "bzz-feed://<feedHash>" // Points to an origin resolving to Content Data
        }
    }
}
```

## ENS

>ENS’s job is to map human-readable names like ‘alice.eth’ to machine-readable identifiers such as Ethereum addresses, content hashes, and metadata. ENS also supports ‘reverse resolution’, making it possible to associate metadata such as canonical names or interface descriptions with Ethereum addresses.

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

|                                   |       Minimal       | ENS support |
| --------------------------------- | :-----------------: | :---------: |
| On Mainnet                        |                     |      ✓      |
| Usage of ENS domains              |                     |      ✓      |
| **Resolver**                      |                     |             |
| EntityId  (node)                  | Record creator hash |  ENS node   |
| Authentication                    |   Record creator    |  ENS owner  |
| Storage of text records           |          ✓          |      ✓      |
| Storage of array of text records  |          ✓          |      ✓      |
| Other Vocdoni specific interfaces |          ✓          |      ✓      |