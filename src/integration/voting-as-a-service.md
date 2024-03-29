# Voting as a Service Guide

The Integration (VaaS) API is a product built on top of our existing stack that allows third parties to easily integrate the voting protocol. This is a REST API that acts as a single endpoint- integrators will not need to interact with Web3/Ethereum, IPFS, or any other decentralized technologies. 

The Voting-as-a-Service API Server provides private REST API methods to integrators who want to use the Vocdoni voting protocol. Integrators can sign up for an account with a billing plan, and they will receive an authentication token. They can then use this token to create & manage organizations and allow organizations to then create voting processes. 

The Integrator API provides:
- Abstraction of the complexity of the Vocdoni voting protocol
- Census management
- Real-time or encrypted voting
- Anonymous voting
- Confidential voting processes (questions/options are only visible to voters & administrators)
- Weighted voting census


Note: this API is not intended to be used directly by organizations. The intended user is third-party who has their own site, application, or service, and wants to integrate voting into that service. Their users would only interact with their interface, which would handle all API calls. 

---

Integrators can use the [Integration API](vaas-api.md) to connect to the voting protocol from their own CRM, customer base, product, etc. 

## Definitions

### Account

Each integrator has its own account. An account can have multiple entities. An account has a billing plan, where proposals and voters are consumed on a monthly quota. Accounts also have an secret API key, to manage entities.

### Entity

Entities are the role that can create proposals and may be managed by many different people. Entities might be managed by the users of an integrator's software, rather than by the integrator itself. 

Entities have a secret API key and a public API token to authenticate requests.

### Census

In order to create a voting process, an entity first needs to have a census of eligible voters. Entities can request census tokens for voters to register their public key. Entities can also request to create a new census of N randomly generated keys, given a default weight of 1. They can also import a mapping of pubKey/weight into existing censuses, too.

### Processes

Processes are election, polls, or any other voting process organized by an entity. Process metadata (the human-readable content of questions, answers, titles, etc.) can either be public or available only to eligible voters. Process results can either be real-time or encrypted until the process ends.

