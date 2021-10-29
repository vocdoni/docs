# Overview

Vocdoni is an Open Platform, where everybody can participate, including voters, institutions and third parties. For this reason, it is crucial that any actor on the ecosystem can integrate its own tools and services to make decentralized governance possible, the way they need it.

::: tip
The following section is a work in progress.
:::

## Tutorials

### Voting as a service

See the [Voting as a Service](/integration/voting-as-a-service) section to see the specs for running an election by using a Rest API.

<!--
## Registry backend

See the [Registry backend](/integration-registry-backend) section for examples on how to generate registration tokens for community members, using the Vocdoni Manager backend.

-->

## Code examples

We are working on further integration examples. Meanwhile, you can check the example sections of the following libraries:

### JavaScript clients

The main library is called [dvote-js](https://github.com/vocdoni/dvote-js) and it works both for the web and NodeJS. <br/>See the following end-to-end examples, depending on your use-case:

- EVM based census
    - [ERC20 standard example](https://github.com/vocdoni/dvote-js/blob/main/example/evm-census/index.ts#L30)
        - This example needs the creator to send one Ethereum transaction to the blockchain (costs some gas)
    - [ERC20 signaling example](https://github.com/vocdoni/dvote-js/blob/main/example/evm-census-signaling/index.ts#L34)
        - This example creates a vote by using an oracle.
        - No blockchain transaction is needed.
    - [ERC20 token registration](https://github.com/vocdoni/bridge-ui/blob/main/lib/api.ts#L60-L67)
- Off-chain based census
    - [Example](https://github.com/vocdoni/dvote-js/blob/main/example/off-chain-census/index.ts#L24)
- Census based on digital certificates (CA)
    - [Example](https://github.com/vocdoni/dvote-js/blob/main/example/ca-census/index.ts#L27)

Other examples:
- [Web site example](https://github.com/vocdoni/dvote-js/tree/main/example/web)
- [Sparse examples](https://github.com/vocdoni/dvote-js/blob/main/example/index.ts)

### Dart and Flutter clients
The Dart package can be [found here](https://pub.dev/packages/dvote).

You can check the following [example files](https://github.com/vocdoni/dvote-flutter/blob/main/example/lib) for more details. 
