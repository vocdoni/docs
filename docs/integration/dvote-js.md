# DVote JS
`This section is a work in progress`

DVote JS (formerly `dvote-client`) is the Javascript client library. 

## Entity

## Process

## Census

## Transport

This module encapsulates a set of utility functions that provide decentralized communication capabilities. It allows to transfer data through Swarm or IPFS and send/receive messages through PSS and IPFS Pub Sub.

```typescript
send (origin: string, payload: string, responseTopic: string)
subscribe (topic: string, callback: (payload) => void)
fetch (dataOrigin: string)
```
