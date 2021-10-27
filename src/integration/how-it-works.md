# How It Works

## Components

### Gateway
The Vocdoni-node gateway provides the public APIs that enable voters and third-parties to explore information about processes and entities, generate census proofs, and cast votes. 

### Manager Backend
The manager backend provides the private API for integrators and entities to manage their account and voting processes, respectively. The manager backend requires authentication keys to access private API methods. 

### Blind Signature API
This component provides access to a Credential Service Provider (CSP). Users can use this API to request and retrieve a blind signature for anonymous voting processes that use CSP. Details of CSP voting is found [here](census/off-chain-csp.md). 

## Confidential Metadata