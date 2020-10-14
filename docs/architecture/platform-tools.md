# Platform tools

## DVote JS
Formerly known as `dvote-client`, this library aims to provide utility classes and methods to invoke decentralized operations within a voting process. It covers the typical functionality of Client applications, as well as the Process Manager or the Census Manager. 

The intended functionality is to interact with a public Ethereum blockchain, to fetch data from a decentralized filesystem, to enforce data schema validity, to prepare vote packages and using decentralized messaging networks through Gateways or Relays. 

[More information](/integration/dvote-js)

## Go DVote
Same as DVote JS, this library provides the necessary tools to interact with Vocdoni from components like Gateways, Relays or a Census Service. 

Its intent is to provide communication systems compatible with their JS counterparts, and process data conforming to the standard formats and data structures. 

[More information](/integration/go-dvote)

## DVote Solidity
This library provides the Smart Contracts that support the integrity transactions involving Entities and Voting Processes.

Much of the work involving metadata is delegated to decentralized filesystems, providing the complete metadata. 

- [Entity Resolver smart contract](/architecture/components/entities?id=entity-resolver).
- [Process smart contract](/architecture/components/processes?id=smart-contract).

## Web runtime (for React Native)
Environments like React Native allow to develop mobile app clients with an efficient and consistent platform but lack the support of cryptographic API's present by default on Web browsers or NodeJS. Several crypto libraries rely on such API's, which are not available on RN. 

Until React Native or Expo ship with native support, the current workaround is to mount a virtual web view and load them in a bundle, so the app code can queue operations to a web environment, pretty much like a WebWorker. 

[More information](https://github.com/vocdoni/clientApp/tree/master/web-runtime)

## Snarks validator
(This component will be fully disclosed when the ZK Snarks implementation becomes available)

## Swarm and IPFS
Both systems provide a decentralized channel to pin and distribute data in a censorship resistant and verifiable way. 

## PSS and IPFS PubSub
Both related to Swarm amb IPFS, they provide a decentralized messaging system that provides anonimity and censorship resilience. 
