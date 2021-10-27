# Voting as a Service Guide

The Integration (VaaS) API is a product built on top of our existing stack that allows third parties to easily integrate the voting protocol. This is a REST API that acts as a single endpoint- integrators will not need to interact with Web3/Ethereum, IPFS, or any other decentralized technologies. 

The Integrator API provides:
- Abstraction of the complexity of the Vocdoni voting protocol
- Census management
- Real-time or encrypted voting
- Anonymous voting
- Confidential voting processes (questions/options are only visible to voters & administrators)
- Weighted voting census

---

::: warning
The Integrator API is not yet available as a product, and the specification is subject to change. This is a very early design. 
:::

Integrators can use the [Integration API](vaas-api.md) to implement the voting protocol into their own CRM, customer base, product, etc. 

## Definitions

### Account

Each integrator must have an account. An account can have multiple entities. An account has a billing plan, where proposals and voters are consumed on a monthly quota. Accounts also have an secret API key, to manage entities.

### Entity

An entity can create proposals and may be managed by many different people. Entities might be managed by the users of an integrator's software, rather than by the integrator itself. 

Entities have a secret API key and a public API token to authenticate requests.

### Census

In order to create a voting process, an entity first needs to have a census of eligible voters. Entities can request to create a new census of N randomly generated keys, given a default weight of 1. Entities can also import a mapping of pubKey/weight to create a new census, too.

### Processes

Processes are election, polls, or any other voting process organized by an entity. Process metadata (the human-readable content of questions, answers, titles, etc.) can either be public or available only to eligible voters. Process results can either be real-time or encrypted until the process ends.