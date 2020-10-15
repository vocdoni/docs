# Libraries and Tooling

## DVote JS

This library is the more versatile and extensive of the ecosystem, since it allows to target both web and app clients, as well as it does with backend services. It provides all wrappers to interact with all decentralized methods andd resources, covering the whole process.

The intended functionality is to interact with a public Ethereum blockchain, to fetch data from a decentralized filesystem, to enforce data schema validity, to prepare vote packages and using decentralized messaging networks through Gateways. 

- See [DVote JS on GitLab](https://gitlab.com/vocdoni/dvote-js)
- See an example integration of [Voting as a Service](https://blog.vocdoni.io/introducing-voting-as-a-service/) using DVote JS

## Go DVote
Similarly to DVote JS, Go DVote provides an extensive toolkit to interact with Vocdoni, in addition to actually running it. Beyond the SDK libraries, Go DVote also allows to spin up a DVote Gateway, a Vochain Miner, a Census Service, etc.

Its intent is to enable P2P access to its JS counterparts, and process data conforming to the standard formats and data structures. 

- See [Go DVote on GitLab](https://gitlab.com/vocdoni/go-dvote)

## DVote Solidity
Provides the Smart Contracts supporting the trustless management of entities, processes and namespaces. It also provides documentation, TypeScript wrappers and ABI to attach to the contracts from client applications.

- See [DVote Solidity on GitLab](https://gitlab.com/vocdoni/dvote-solidity)
- See the [Entity Resolver smart contract](/architecture/components/entities?id=entity-resolver)
- See the [Process smart contract](/architecture/components/processes?id=smart-contract)
- See the [Namespace smart contract](/architecture/components/namespaces?id=contract)

## DVote Flutter

This library features a subset of DVote JS features, taylored to the usage on mobile apps consuming decentralized metadata and governance processes. While most of the plumbing is developed in Dart, all performance sensitive computations are handled by native versions. See DVote Flutter Native below. 

This library is likely to be refactored into a pure Dart version and a Flutter superset in the future.

- See [DVote Flutter on GitLab](https://gitlab.com/vocdoni/dvote-flutter)

## DVote Flutter Native

This library provides Dart wrappers around native implementations of the cryptographic functions used by the client app. It bundles Android shared objects and iOS archives and exposes typed Dart functions to invoke them seamlessly.

- See [DVote Flutter Native on GitLab](https://gitlab.com/vocdoni/dvote-flutter-native)

## DVote Rust FFI

A library that imports the cryptographic functions available on [DVote Rust](#dvote-rust) and exposes them in a C compatible format that can be used with the Foreign Function Interface. 

- See [DVote Rust FFI on GitLab](https://gitlab.com/vocdoni/dvote-rs-ffi)

## DVote Rust

A Rust library that provides fast and performant functions to compute Ethereum wallets, Poseidon hashes, encrypt and decrypt data and generate ZK Proofs on modest hardware. These expenside computations need the lightest implementation possible, and DVote Rust serves exactly this purpose. 

- See [DVote Rust on GitLab](https://gitlab.com/vocdoni/dvote-rs)

<!--
## Web runtime (for React Native)
Environments like React Native allow to develop mobile app clients with an efficient and consistent platform but lack the support of cryptographic API's present by default on Web browsers or NodeJS. Several crypto libraries rely on such API's, which are not available on RN. 

Until React Native or Expo ship with native support, the current workaround is to mount a virtual web view and load them in a bundle, so the app code can queue operations to a web environment, pretty much like a WebWorker. 

[More information](https://github.com/vocdoni/clientApp/tree/master/web-runtime)
-->

### Coming next

See the [JSON API](/architecture/protocol/json-api) section.
