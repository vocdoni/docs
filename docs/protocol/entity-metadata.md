# Entities

`The current contents are a work in progress`

An entity is an organizer and the ultimate responsable of a process.
One entity can have an arbitrary number of processes.

## Metadata

Any `Entity` have associated several metadata.

Most of the metadata is necessary to provide alternative censorship resistant channels of communications between the Entity and the user.

The data in itself or a hash of it is stored in the blockchain.

### Resolver

A resolver is a smart-contract in charge of returning the required data from the user.

Several resolver contracts may exist, they all need to conform the same interfaces, specified by Vocdoni.

We make use of ENS resolvers interfaces, but not necessarily use ENS domains (see below)

A resolver stores each entity data into a record addressed by an `entityId`. If we use the ENS domains the `entityId` is the [ENS node](https://docs.ens.domains/terminology), otherwise, the `entitiyId` is the hash of the address that created the entity.

### Interface: Storage of text records

[EIP 634: Storage of text records in ENS](https://eips.ethereum.org/EIPS/eip-634) is convenient to store arbitrary data. It can be used as a simple key-value store.

Vocdoni specific keys (`vndr.vocdoni.key`) are represented as JSON objects
Content-addressed data (hashes) with not specfic hash function are referenced using [Mulistream/Multicodec](https://github.com/multiformats/multistream).
If there is a specific codec for the hash function (in case we want to provide multiple options to be resolved) it should be suffixed with the protocol `.http`, 
This is a suggested usage for the keys

| Key                                | Example                                                | Description                                                   |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| **"Required" keys**                |                                                        |                                                               |
| `name`                             | Free Republic of Liberland                             | Organization's name to be displayed                           |
| `vndr.vocdoni.censusRequestUrl`    | "https://liberland.org/en/citizenship"                 | To request to be part of the entity                           |
| `vndr.vocdoni.relays`              | "["0x123","0x234"]"                                    | Relay keys                                                    |
| `vndr.vocdoni.processess.active`   | "["0x987","0x876"]"                                    | Processess tht the client will desplay as active              |
| **Supported keys**                 |                                                        |                                                               |
| `vndr.vocdoni.processess.test`     | "["0x787","0x776"]"                                    | Processess tht the client will desplay as active              |
| `vndr.vocdoni.processess.inactive` | "["0x887","0x886"]"                                    | Processess tht the client will desplay as active              |
| `vndr.vocdoni.feed.http`           | "https://liberland.org/ en/news/feed"                  | News feed following [JS feed](https://jsonfeed.org/version/1) |
| `vndr.vocdoni.feed.multicodec`     | "0xfe1"                                                | News feed, could be IPFS or SWARM                             |
| `vndr.vocdoni.feed.ipfs`           | "0xfe2"                                                | News feed to be retrieved using IPFS                          |
| `vndr.vocdoni.feed.swarm`          | "0xfe3"                                                | News feed to be retrieved using Swarm                         |
| `description`                      | Is a sovereign state...                                | A self-descriptive text                                       |
| `avatar_url`                       | https://liberland.org/logo.png                         | An image file to be displayed next to the entity name         |
| `avatar_hash`                      | 0xaaa                                                  | To retreive from IPFS of for checksum                         |
| `vndr.vocdoni.keys_to_display`     | "["podcast_feed", "vndr.twitter", "constitution_url"]" | Keys the user wants to be displayed on its page               |
| `vndr.vocdoni.entities.trusted`    | "0xeee"                                                | Contract address. See Nested Entities section below           |
| **Arbitrary keys**                 |                                                        |                                                               |
| `podcast_feed`                     | http://liberland.org/podcast.rss                       |                                                               |
| `constitution_url`                 | https://liberland.org/en/constitution                  |                                                               |
| `vndr.twitter`                     | https://twitter.com/Liberland_org                      |                                                               |

### `WIP` Interface: Storage of array of text records

- To store a list of trusted gateways bootstrap nodes?
- To store a list of running processes
- To store a list of bootstrap relays?
  
### `WIP` Interface: Storage of array of gateway data structs

It may need to include the following data

```json
{
  "bootNodeId": "uniqId",
  "pubKey": "public key",
  "updateProto": "pss",
  "updateParams": [ "topic":"vocdoni_gateways", "address":"0x" ],
  "difficulty": integer,
  "host": "IP/DNS",
  "port": port,
  "protocol": "http/s"
}
```

### `WIP` Interface: Storage of array of bytes32

- To store processes
  - Open
  - Active
  - Expired

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

## Subscription

A user can subscribe to any entity she pleases.

Because the resolver architecture, metadata of different entities may exist in different resolver contracts.

The client app stores the resolver and the entityId of the entity and fetches the data when it needs.

### Entities curated lists

In order to provide an entry point for a user to find entities to subscribe we have `Entities curated lists`.

These are smart contracts that conform to a specific interface that allows users to fetch the available entities of this list.

- An entity itself can a have pointer to a list of trusted lists of entities
- Can be used for testing scenarios
- The owner of the list can establish a KYC process, or complex logic to appear on the list

#### Nested entities

In the `keys` example above I suggested `vndr.vocdoni.entities.trusted`. Which is a key that points to an `Entities curated list`.

This allows each entity to define its own list of trusted/child/supported entities. Is a very simple discovery/filtering/reputation mechanism that we can make use of while we wait for more complex Identity support.

- A big organization could list all its departments. And each department could do the same to its sub-departments and so on...
- It is a very elegant way to filter, especially if a list is big, there are entities with similar names...
- It does not require almost any UI implementation on the client side.
- Can be used to find additional trusted gateways in case the ones of the current entity are down.
