# Data schema

`The current contents are a work in progress`

### Entity metadata

```json
entityMetadata = {
    "name": "The Entity",
    "urls": {
        "home": "https://www.the-entity.org/"
    },
    "actions": [{
        "name": "Sign up to the Entity",
        "type": "url",
        "url": "https://process-manager.domain/sign-up/"
    }]
}
```

The JSON structure is to be stored on IPFS or Swarm, so anyone can get the full metadata of an entity.

Used in:
* [Register an entity](/protocol/sequence-diagrams?id=register-an-entity)

