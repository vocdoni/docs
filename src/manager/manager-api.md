# Manager API
The  Manager API allows organizations to perform all the necessary management actions on the backend that are related to their members and the corresponding censuses. This invloves:
- Registering new `Entities` and managing their info
- Managing `Members` and their information. Related to `Member` management, some `Token` calls are also featured
- Creating and managing `Tags` for these members
- Creating and managing `Targets` that combine member attributes and tags in order to provide the ability to segment the members
- Creating and managing `Censuses` based that each of them is related with one concrete `Target` 

Available by default under `/manager`

The API methods below follow the [JSON API](/architecture/protocol/json-api) specifications.

## Entity methods

The follow methods allow entities to manage their account on the server by sending signed requests to the backend.

### sign Up
Registers an entity to the backend. The address of the Entity is calculated by the signature of the request.

- Request

```json
{    
    "id": "req-12345678",
    "request": {
        "method": "signUp",
        "entityName": "Name",
    },
    "signature": "0x12345"
}
```

- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
    "signature": "0x12345"
}
```

#### getEntity
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "getEntity",
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "entity": {
            "address": "0x.....",
            "callbackUrl": "http",
            "callbackSecret": "x45gse53wedfg",
            "email": "mail@entity.org",
            "name": "EntityName",
            "censusManagersAddresses": ["0x434223edfa","0x434223edfc"],
            "origin": "Token",
        }
    },
    "signature": "0x123456"
}
```

#### updateEntity

- Request

```json
{    
    "id": "req-12345678",
    "request": {
        "method": "updateEntity",
        "entity": {
            "address": "0x.....",
            "callbackUrl": "http",
            "callbackSecret": "x45gse53wedfg",
            "email": "mail@entity.org",
            "name": "EntityName",
            "censusManagersAddresses": ["0x434223edfa","0x434223edfc"],
            "origin": "Token",
        }
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x12345"
}
```

## Member methods

The following methods allow to manage users and their attributes on the database.

### countMembers
Counts the number of members for a given entity.
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "countMembers",
    },
    "signature": "0x12345"
}
```
- Response

```json
{ 
   "id": "req-12345678",
    "response": {
        "ok": true,
        "count": 10 // number of members
    },
     "signature": "0x12345"
    
}
```

### listMembers

Retrieve a list of members with the given constraints.

- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "listMembers",
        "listOptions": {
          "skip": 50,
          "count": 50,
          "sortBy": "lastName", // "name" | "lastName" | "email" | "dateOfBirth"
          "order": "asc",  // "asc" | "desc"
        },
        "filter": {  
             "target": "1234...",
             "tags": "2345...",
             "name": "John...",  
             "lastName": "Smith...",
             "email": "john@s..." ,
        }
    },
    "signature": "0x12345"
}
```

- Response

```json
{ 
    "id": "req-12345678",
    "response": {
        "ok": true,
        "members": [
            { "id": "1234...", "name": "John", "lastName": "Smith", }, //all member info
            { "id": "2345...", "name": "Jane", "lastName": "Smith",}
        ]
    }
    "signature": "0x123456"
}
```

### getMember
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "getMember",
        "id": "1234-1234..."  // uuid
    },
    "signature": "0x12345"
}
```
- Response

```json
{ "id": "req-12345678",
    "response": {
        "ok": true,
        "member": {
            "id": "1234...", 
            "name": "John",
            "lastName": "Smith",
            "email": "john@smith.com",
            "phone": "+0123456789",
            "dateOfBirth": "2000-05-14T15:52:00.741Z" // ISO date
            ... 
        }
    },
    "signature": "0x123456"
}
```

### addMember
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "addMember",
        "member": {
            "firstName": "John",
            "lastName": "Smith",
            "email": "john@smith.com",
            "phone": "+0123456789",
        }
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "member": {
            "id": "1234...",
            "firstName": "John",
            "lastName": "Smith",
            "email": "john@smith.com",
            "phone": "+0123456789", 
        }
    },
    "signature": "0x123456"
}
```


### updateMember

**Note**: All attributes execpet`tags`  if are included in the request but are empty they are ignored. If `tags == []` this value is stored in the database. 

- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "updateMember",
        "memberId": "1234",
        "member": {
           "email": "john@smith.com",
           "firstName": "John1",
           "tags": [1,2]
        }
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```


### deleteMember
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "deleteMember",
        "id": "1234..."
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```

### importMembers
Imports the given array of members with their info into the database.
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "importMembers",
        "members": [
            {
                "firstName": "John",
                "lastName": "Smith",
                "email": "john@smith.com",
            }, 
            ...
        ]
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```

### sendValidationLink
Uses the `SMTP` module to send an email to the  selected member, containing the necessary info to register his public key. See also `validateToken`
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "sendValidationLink",
        "memberId": "1234-asdgc-...."
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```


## Tokens

Tokens allow mobile users to add their identity to the organization database by validating their email (or similar) using a one time password, called Token.

### provisionTokens
Adds N new empty member entries, filled with the corresponding ID/token only.
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "provisionTokens",
        "amount": 500
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```

### exportTokens
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "exportTokens"
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "memberTokens" : [
            {
             "email" : "john@smith.org",
             "token" : "1234-abcde-...."
            },
            {
             "email" : "maria@smith.org",
             "token" : "5768-abcde-...."
            },
            ...
        ]
    },
    "signature": "0x123456"
}
```

## Targets

Targets are a set of filters that define what users are eligible to be part of a census. Targets are used to create lists of members that are computed on the fly. Ultimately, the output of a target produces a snapshot that becomes a census of public keys.

The target id is a UUID.

### listTargets
Retrieve a list of targets.

- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "listTargets",
        "listOptions": {
            "skip": 50,
            "count": 50,
            "sortBy": "name",    // "name"
            "order": "asc",     // "asc" | "desc"
        }    
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "targets": [
            { "id": "1234-abcd-...", "name": "People over 18",  }, // all member info
        ]
    },
    "signature": "0x123456"
}
```

### getTarget
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "getTarget",
        "targetId": "1234-abcd-..."
    },
     "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "target": {
            "id": "1234-abcd-...",
            "name": "People over 18",
            "filters": {
                "attributes": {},
                "tags": [1,15],
            }
            
        }
    },
    "signature": "0x123456"
}
```

### addTarget
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "addTarget"
        "target": {
          "name": string
          "filters": {
              "attributes": {},
              "tags": [1,15],
          }
    },
     "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
    "target": {
        "id": "1234-abcd-..."
        "name": "Over 18"
        "filters": {
          "attributes": {},
          "tags": [1,15],
        }
    },
    "signature": "0x123456"
}
```


### updateTarget
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "updateTarget"
        "id": "1234-abcd-...",
        "target": {
            "name": "Over 18"
            "filters": {
              "attributes": {},
              "tags": [1,15],
        }
    },
     "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    }
    "signature": "0x123456"
}
```


### deleteTarget
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "deleteTarget",
        "id": "1234-abcd-..."
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
    "signature": "0x123456"
}
```

### dumpTarget
Dumps the public keys of the users that match the criteria of the target. The client then can then call the go-dvote `addCensus` call to add the keys to the Census Service.

- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "dumpTarget",
        "id": "1234-abcd-...",
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "claims": [
            "12345abccdef", //pubKey1
            "7890abccdeff", //pubKey2
            "34567abccdef", //pubKey3
            ...
        ]
    },
    "signature": "0x123456"
}
```

## Censuses

A census is a group of public keys, containing the snapshot of a Target at a given point in time. Censuses are sent to the Census Service and their Merkle Root is used to define who will be able to vote on a voting process.

### addCensus
Add a census that is already published by a DvoteGW using the details provided by it.
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "addCensus",
        "censusId": "abc342123dadf/cdb12341a", // received from gateway
        "targetID": "1234-acvbc-...", // target uuid
        "census": {
            "name": "CensusName",
            "merkleRoot": "0fa34cb...",    // hex received from gateway
            "merkleTreeUri": "ipfs://abc23454cbf",   // received from gateway
            "target": "1234", // targetId
            "createdAt": "2000-05-14T15:52:00.741Z" 
        }
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```

### listCensus
Retrieve a list of exported census.
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "listCensus",
        "listOptions": {
            "skip": 50,
            "count": 50,
            "sortBy": "name", // "name" | "created"
            "order": "asc",  // "asc" | "desc"
        }
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "census": [
            { "id": "1234...", "name": "People over 18", "target": "1234..." },
            ...
        ]
    },
    "signature": "0x123456"
}
```

### getCensus
Returns requested census with the corresponding target
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "getCensus",
        "censusId": "1234..."
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "census": {
            "id": "1234...",
            "name": "CensusName",
            "merkleRoot": "09cc09acb080/3543c34fe23da",   
            "merkleTreeUri": "ipfs://abc23454cbf", 
            "target": "1234",
            "createdAt": "2000-05-14T15:52:00.741Z" 
        }
        "target": {
            "id": "1234...",
            "name": "People over 18", 
        }
    },
    "signature": "0x123456"
}
```



### deleteCensus
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "deleteCensus",
        "id": "1234..."
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```

### Tags
### listTags
- Request

```json
{
    "id": "req-12345678",
    "request": {
        method: "listTags",
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
        tags: [
            { "id": "1234...", "name": "People over 18"},
            ...
        ]
    },
     "signature": "0x123456"
}
```
### createTag
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "createTag",
        "tagName": "TestTag",
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true,
        "tag": {
            "id": 1234,
            "name": "TestTag",
        }
    },
     "signature": "0x123456"
}
```
### deleteTag
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "deleteTag",
        "tagID": 1234
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```
### addTag
Add tag to members
- Request

```json
{
    "id": "req-12345678",
    "request": {
        "method": "addTag",
        "memberIds": ["1234-abcde-...","4567-bcdef-....",...]
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```

### removeTag
Remove Tag from Members
- Request

```json
{
    "id": "req-12345678",
    "request": {
        method: "removeTag"
        memberIds: [uuid]
    },
    "signature": "0x12345"
}
```
- Response

```json
{
    "id": "req-12345678",
    "response": {
        "ok": true
    },
     "signature": "0x123456"
}
```


