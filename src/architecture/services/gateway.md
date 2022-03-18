# Gateway

Gateways provide redundant entry points to the P2P networks. They allow clients to reach decentralized services from a simple HTTP/WebSocket endpoint.

The following diagram shows the gateway's overall architecture and components.

<div style="padding: 20px;">
	<img src="/gateway-components.png" alt="Gateway Components"/>
</div>

### Discovery mechanism

A Gateway is a neutral piece of the ecosystem which can be hosted by any third party. Any kind of organization might run Gateway instances to improve network access and increase resilience against potential attacks.

To this end, Gateways use an automatic discovery system through a P2P messaging network so that Bootnodes know of their existence. Clients make requests to Bootnodes and fetch a fresh list of working Gateways.

<head>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.css">
</head>

```mermaid
graph TD
GW1(<center>Gateway<br/><br/><i class='fa fa-2x fa-archway'/></center>)
BC[<center>Blockchain<br/><br/><i class='fab fa-2x fa-ethereum'/></center>]
MS[<center>P2P Messaging<br/><br/><i class='fa fa-2x fa-envelope-open-text'/></center>]
BO1[<center>Bootnode<br/><br/><i class='fa fa-2x fa-book'/></center>]
BO2[<center>Bootnode<br/><br/><i class='fa fa-2x fa-book'/></center>]
GW1-->|Fetch P2P info|BC
GW1-->|Send update message|MS
MS-->BO1
MS-->BO2
```
---

## API definition

A Gateway exposes APIs that enable accessing peer-to-peer networks. The currently supported API schemes are the following:

+ `Info API`: details about the gateway
+ `Census API` access to the Census Service
+ `Vote API` access to the Vochain methods for voting
+ `Results API` access to the Vochain methods for computing election results
+ `Indexer API` access to the Indexer methods for analyzing the Vochain
+ `File API` access to P2P file storage methods

These APIs can be used by web and mobile clients using an HTTP/WS endpoint.

The API methods below follow the [JSON API](/architecture/protocol/json-api) specifications.

## Info API

### Get Gateway Info
Get an overview of the gateway status: available APIs, health and whether private methods are available or not.

```json
{
  "id": "req-2345679",
  "request": {
    "method": "getInfo",
    "timestamp": 1556110671 // optional, not required
  }
 }
```

```json
{
  "id": "req-2345679",
  "response": {
    "apiList": ["census","file","vote", "results"],
    "chainId": "vocdoni-release-1.3", // the Vochain chainID on which the gateway is connected
    "health": 65,  // A number between 1 and 100 that indicates the health of the gateway (resource consumption, network status, etc.)
    "ok": true,
    "request": "req-2345679", // Request ID here as well, to check its integrity
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

## Census API

The Census API methods can be found on the [Census Service section](/architecture/services/census-service.html#json-api). 

## Vote API

### Submit Raw Vochain Transaction

Send a [Vote Envelope](/architecture/smart-contracts/process.html#vote-envelope) to the mempool of the [Vochain](/architecture/services/vochain).

```json
{
  "id": "req-2345679",
  "request": {
    "method": "submitRawTx",
    "payload": "base64string", // A raw transaction (protobuf encoded) payload in base64
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "ok": true,
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```


### Submit Envelope

Send a [Vote Envelope](/architecture/smart-contracts/process.html#vote-envelope) to the mempool of the [Vochain](/architecture/services/vochain).

```json
{
  "id": "req-2345679",
  "request": {
    "method": "submitEnvelope",
    "payload": "base64string", // Vote envelope (protobuf encoded) payload in base64
    "signature": "hexString", // signature of the payload if the process requires it
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "ok": true,
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

**Used in:**
- [Casting a vote](https://docs.vocdoni.io/#/architecture/sequence-diagrams.html#casting-a-vote)

### Get Envelope Status

Check the status of an already submitted [Vote Envelope](/architecture/smart-contracts/process.html#vote-envelope). The envelope is identified by the voter's nullifier.

```json
{
  "id": "req-2345679",
  "request": {
    "method": "getEnvelopeStatus",
    "nullifier": "hexString",
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "registered": true,  // Whether the vote is registered or not
    "blockTimestamp": 1556110672, // only if registered == true
    "height": 1234, // only if registered == true
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```
**Used in:**
- [Checking a Vote Envelope](https://docs.vocdoni.io/#/architecture/sequence-diagrams.html#checking-a-vote-envelope)

### Get Envelope Height

Get the number of envelopes registered on a given process.

```json
{
  "id": "req-2345679",
  "request": {
    "method": "getEnvelopeHeight",
    "processId": "hexString",
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "ok": true,
    "height": 1234, // Number of envelopes for the process ID
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

### Get Block Height

Get the current block number on the [Vochain](/architecture/services/vochain). 

```json
{
  "id": "req-12345678",
  "request": {
    "method": "getBlockHeight",
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "blockTimestamp": 1556110672,
    "ok": true,
    "height": 12345,
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

### Get Process Keys

Get the available encryption keys for the given process ID.

If the process has encrypted votes and it is on-going, `encryptionPubkeys` and `commitmentKeys` should be available. Once the process has ended, `encryptionPrivKeys` and `revealKeys` will be also be available.

[Vote Package](/architecture/smart-contracts/process.html#vote-package) encryption and decryption keys are expected to follow the order of their indexes. Smaller indexes are used first and it's important to note that indexes might not be consecutive.

```json
{
  "id": "req-2345679",
  "request": {
    "method": "getProcessKeys",
    "processId": "hexString",
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "encryptionPubKeys": [ {"idx": 1, "key": "1234567890..."}, {"idx": 6, "key": "2345678901..."}, ... ], 
    "commitmentKeys": [ {"idx": 1, "key": "1234567890..."}, {"idx": 6, "key": "2345678901..."}, ... ],
    "encryptionPrivKeys": [ {"idx": 1, "key": "1234567890..."}, {"idx": 6, "key": "2345678901..."}, ... ],
    "revealKeys": [ {"idx": 1, "key": "1234567890..."}, {"idx": 6, "key": "2345678901..."}, ... ],
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

**Used in:**
- [Checking a Vote Envelope](https://docs.vocdoni.io/#/architecture/sequence-diagrams.html#checking-a-vote-envelope)


### Get Block Status

Get details about the current block and the average block time for the last 1m, 10m, 1h, 6h and 24h.

```json
{
  "id": "req-12345678",
  "request": {
    "method": "getBlockStatus",
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "blockTime": [10000, 12000, 12200, 12500, 12600], // In milliseconds, average for 1 minute, 10m, 1h, 6h, 24h. If no average yet, values are 0
    "blockTimestamp": 1556110672, // in seconds
    "height": 12345,
    "ok": true,
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

### Get pre-register voter weight

For a pre-register processes, returns the used weight for an address.

```json
{
  "id": "req-12345678",
  "request": {
    "method": "getPreregisterVoterWeight",
    "voterAddress": "hexString", // the Ethereum address of the registered pubKey
    "processId": "hexString",
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "weight": "1",
    "ok": true,
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

## Results API

### Get Process List

Get a list of processes for a specific entity or namespace on the [Vochain](/architecture/services/vochain). There is a hardcoded maximum size of 64 per page. 

The results are ordered from process creation date. So processes created recently will appear first on the list.

The following query filters can be used:

+ `entityId` can be used for retreiving the list of processes from a specific entity organization.
+ `from` can be used to seek specific positions and start from them. So if a call without `from` (`from = 0`) returns 64 values, a second call with `from = 64` will get the next 64 values.
+ `namespace` can be used for querying only a specific namespace. The namespace zero (default value) means all existing namespaces.
+ `sourceNetworkId` can be used for querying only a specific network origin (where the process has been created). Current possible values are:
	UNKNOWN, ETH_MAINNET, ETH_RINKEBY, ETH_GOERLI, POA_XDAI, POA_SOKOL, POLYGON, BSC, ETH_MAINNET_SIGNALING, ETH_RINKEBY_SIGNALING
  An empty string is also allowed (means no filter).
+ `searchTerm` can be used for querying a specific process ID or partial ID. 
+ `status` can be used for querying processes on a specific status (READY, PAUSED, CANCELED, ENDED or RESULTS).
+ `withResults` bool filter can be used for quering only those processes that already have results (open process or finished with revealed keys).

```json
{
  "request": {
    "entityId": "hexString",
    "from": 8,
    "listSize": 10,
    "method": "getProcessList",
    "namespace": 0,
    "sourceNetworkId": "ETH_MAINNET",
    "searchTerm": "hexString",
    "status": "",
    "timestamp": 1620066207,
    "withResults": false
  },
  "id": "847",
}
```

```json
{
  "response": {
    "ok": true,
    "processList": [
      "hexString",
      "hexString",
      "hexString",
      "hexString",
    ],
    "request": "847",
    "size": 10,
    "timestamp": 1620066207
  },
  "id": "847",
  "signature": "hexString"
}
```

### Get Process Info

Get the full information from an existing process.


```json
{
  "request": {
    "method": "getProcessInfo",
    "processId": "hexString",
    "timestamp": 1620060163
  },
  "id": "410",
}
```

```json
{
  "response": {
    "ok": true,
    "process": {
      "censusOrigin": 11,
      "censusRoot": "hexString",
      "censusURI": "",
      "metadata": "ipfs://QmTtSkt9BQyXhCAAThG6JgdQcCdSJXKRVzoeQz6mjusTZ6",
      "creationTime": "2021-05-03T11:38:03-04:00",
      "endBlock": 103991,
      "entityId": "hexString",
      "entityIndex": 5,
      "envelopeType": {
        "encryptedVotes": true,
        "serial": false,
	      "anonymous": false,
	      "uniqueValues": false,
	      "costFromWeight": false
      },
      "finalResults": false,
      "haveResults": false,
      "namespace": 2,
      "sourceNetworkId": "ETH_RINKEBY",
      "processId": "hexString",
      "processMode": {
        "autoStart": true,
        "interruptible": false,
	      "dynamicCensus": false,
	      "encryptedMetaData": false,
	      "preRegister": false
      },
      "questionIndex": 0,
      "sourceBlockHeight": 812000,
      "startBlock": 26464,
      "status": 1,
      "voteOptions": {
        "costExponent": 10000,
        "maxCount": 1,
        "maxValue": 2,
        "maxVoteOverwrites": 1,
        "maxTotalCost": 4
      }
    },
    "request": "410",
    "timestamp": 1620060163
  },
  "id": "410",
  "signature": "hexString"
}
```

### Get Process Summary

Get a minimal summary for the given process.


```json
{
  "request": {
    "method": "getProcessSummary",
    "processId": "hexString",
    "timestamp": 1622039347
  },
  "id": "59",
  "signature": "hexString"
}
```

```json
{
  "response": {
    "ok": true,
    "processSummary": {
      "blockCount": 500,
      "entityId": "hexString",
      "entityIndex": 1,
      "metadata": "ipfs://...",
      "envelopeHeight": 41156,
      "envelopeType": {
        "anonymous": true,
        "encrypted": true,
        "costFromWeight": true,
        "serial": true,
        "uniqueValues": true
      },
      "sourceNetworkID": "UNKNOWN",
      "startBlock": 82326,
      "state": "RESULTS",
    },
    "request": "59",
    "timestamp": 1622039356
  }
  "id": "59",
  "signature": "776ee4eaeed05dd840c43e81d73422379d8d2ab583889afb16a5f5fd240cfd6a175d4a9595057402f98a457e2aabb7d9cdf3cc507c7ebce927a629935568170300"
}
```


### Get Process Count

Returns the number of processes registered on the [Vochain](/architecture/services/vochain).

The following query filters can be used:

+ `entityId` can be used for retreiving the number of processes registered by a specific entity organization.

```json
{
  "id": "req-2345679",
  "request": {
    "entityId": "hexString",
    "method": "getProcessCount",
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "request": "req-2345679",
    "size": 198,
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```


### Get Process Results

Get the results of the given processId, as indexed by the scrutinizer. If the process doesn't have encrypted votes but it has already started, then the gateway returns the **partial results**. The results can only be considered final if `final` is true.

The results of an election are represented in [the following format](/architecture/smart-contracts/process.html#results).

```json
{
  "request": {
    "method": "getResults",
    "processId": "hexString",
    "timestamp": 1620076071
  },
  "id": "235",
}
```

```json
{
  "response": {
    "final": false,
    "height": 4,
    "ok": true,
    "request": "235",
    "results": [
      [
        "0",
        "2",
        "2",
        "0"
      ],
      [
        "0",
        "0",
        "0",
        "4"
      ]
    ],
    "state": "READY",
    "timestamp": 1620076071,
    "type": "poll open single",
    "weight": "4"
  },
  "id": "235",
  "signature": "hexString"
}
```


### Get Results Weight

The results weight is the total amount of voting power that have been cast for a processId. 
For a non-weighted process the weight will be equal to the number of votes.
This information can be queried in real-time on encrypted elections too.

```json
{
  "request": {
    "method": "getResultsWeight",
    "processId": "hexString",
    "timestamp": 1620076071
  },
  "id": "236",
}
```

```json
{
  "response": {
    "weight": "4"
  },
  "id": "236",
  "signature": "hexString"
}
```



### Get Entity List

Get a list of entities that created at least 1 process on the [Vochain](/architecture/services/vochain). 

The `from` field can be used to seek specific positions and start from them. So if a call without `from` (`from = 0`) returns 64 values, a second call with `from = 64` will get the next 64 values.

The following query filters can be used:

+ `searchTerm` can be used for querying a specific entity ID or partial ID. 


```json
{
  "request": {
    "from": 0,
    "listSize": 6,
    "method": "getEntityList",
    "searchTerm": "hexString",
    "timestamp": 1620075711
  },
  "id": "511",
}
```

```json
{
  "response": {
    "entityIds": [
      "hexString",
      "hexString",
      "hexString",
      "hexString",
      "hexString",
      "hexString"
    ],
    "ok": true,
    "request": "511",
    "timestamp": 1620075711
  },
  "id": "511",
  "signature": "hexString"
}
```

### Get Entity Count

Returns the number of entities registered on the [Vochain](/architecture/services/vochain) (those that have created at least one process).

```json
{
  "id": "req-2345679",
  "request": {
    "method": "getEntityCount",
    "timestamp": 1556110671
  }
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "request": "req-2345679",
    "size": 14,
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

### Get Envelope

Get the content of an existing [Vote Envelope](/architecture/smart-contracts/process.html#vote-envelope). The envelope is identified by the nullifier. `height` and `txIndex` refer to the block height and the index on that block, respectively, of the transaction containing this vote envelope. These fields can be used with [Get Tx](/architecture/services/gateway.html#get-tx) to fetch this transaction.

```json
{
  "request": {
    "method": "getEnvelope",
    "nullifier": "hexString",
    "timestamp": 1620074081
  },
  "id": "81",
}
```

```json
{
  "response": {
    "envelope": {
      "encryption_key_indexes": null,
      "meta": {
        "height": 357,
        "nullifier": "hexString",
        "process_id": "hexString",
        "tx_hash": "hexString",
        "tx_index": 0
      },
      "nonce": "hexString",
      "signature": "hexString",
      "vote_package": "base64String",
      "weight": "1"
    },
    "ok": true,
    "registered": true,
    "request": "81",
    "timestamp": 1620225283
  },
  "id": "81",
  "signature": "hexString"
}
```

## Indexer API

### Get Stats

Get general information & statistics about the current [Vochain](/architecture/services/vochain) status. 

```json
{
  "request": {
    "method": "getStats",
    "timestamp": 1620059835
  },
  "id": "887",
}
```

```json
{
  "response": {
    "ok": true,
    "request": "887",
    "stats": {
      "block_height": 26680,
      "block_time": [
        10000,
        11000,
        10000,
        10000,
        10000
      ],
      "block_time_stamp": 1620059824,
      "chain_id": "vocdoni-development-39",
      "entity_count": 9,
      "envelope_count": 602,
      "genesis_time_stamp": "2021-04-30T11:43:28.668436552Z",
      "process_count": 19,
      "syncing": false,
      "transaction_count": 861,
      "validator_count": 4
    },
    "timestamp": 1620059835
  },
  "id": "887",
  "signature": "hexString"
}

```


### Get Envelope List
Get a list of nullifiers for votes registered on a given process ID (at most, 64 per request).

The `fromId` field works the same as in [Get Process List](#get-process-list).

```json
{
  "request": {
    "from": 1,
    "listSize": 3,
    "method": "getEnvelopeList",
    "processId": "hexString",
    "timestamp": 1620067128
  },
  "id": "356",
}
```

```json
{
  "response": {
    "envelopes": [
      {
        "height": 357,
        "nullifier": "hexString",
        "process_id": "hexString",
        "tx_hash": "hexString",
        "tx_index": 0
      },
      {
        "height": 359,
        "nullifier": "hexString",
        "process_id": "hexString",
        "tx_hash": "hexString",
        "tx_index": 0
      },
      {
        "height": 306,
        "nullifier": "hexString",
        "process_id": "hexString",
        "tx_hash": "hexString",
        "tx_index": 0
      }
    ],
    "ok": true,
    "request": "356",
    "timestamp": 1620222421
  },
  "id": "356",
  "signature": "hexString"
}
```


### Get Block

Get the metadata for a single block on the [Vochain](/architecture/services/vochain) by its height. `num_txs` contains the number of transactions contained in this block. In order to access these transactions (the contents of the block), use [Get Tx List for Block](/architecture/services/gateway.html#get-tx-list-for-block).

```json
{
  "request": {
    "height": 24061,
    "method": "getBlock",
    "timestamp": 1620661000
  },
  "id": "561",
}
```

```json
{
  "response": {
    "block": {
      "hash": "hexString",
      "last_block_hash": "hexString",
      "num_txs": 0,
      "proposer_address": "hexString",
      "timestamp": "2021-05-10T15:37:50.477536778Z"
    },
    "ok": true,
    "request": "561",
    "timestamp": 1620661094
  },
  "id": "561",
  "signature": "hexString"
}
```

### Get Block By Hash

Get the metadata for a single block on the [Vochain](/architecture/services/vochain) by its hash. `num_txs` contains the number of transactions contained in this block. In order to access these transactions (the contents of the block), use [Get Tx List for Block](/architecture/services/gateway.html#get-tx-list-for-block).

```json
{
  "request": {
    "hash": "hexString",
    "method": "getBlockByHash",
    "timestamp": 1620661000
  },
  "id": "561",
}
```

```json
{
  "response": {
    "block": {
      "height": 24061,
      "last_block_hash": "hexString",
      "num_txs": 0,
      "proposer_address": "hexString",
      "timestamp": "2021-05-10T15:37:50.477536778Z"
    },
    "ok": true,
    "request": "561",
    "timestamp": 1620661094
  },
  "id": "561",
  "signature": "hexString"
}
```

### Get Block List

Get a list of confirmed blocks on the [Vochain](/architecture/services/vochain) (at most, 64 per request).

The `fromId` field works the same as in [Get Process List](#get-process-list).

```json
{
  "request": {
    "from": 24031,
    "listSize": 2,
    "method": "getBlockList",
    "timestamp": 1620660800
  },
  "id": "847",
}
```

```json
{
  "response": {
    "blockList": [
      {
        "hash": "hexString",
        "height": 24031,
        "last_block_hash": "hexString",
        "num_txs": 0,
        "proposer_address": "hexString",
        "timestamp": "2021-05-10T15:32:40.122987363Z"
      },
      {
        "hash": "hexString",
        "height": 24032,
        "last_block_hash": "hexString",
        "num_txs": 1,
        "proposer_address": "hexString",
        "timestamp": "2021-05-10T15:32:50.540679299Z"
      },

    ],
    "ok": true,
    "request": "847",
    "timestamp": 1620660882
  },
  "id": "847",
  "signature": "hexString"
}
```

### Get Tx

Get a single tx from the [Vochain](/architecture/services/vochain). `height` is the block containing a transaction and `txIndex` in the transaction's index on that block. 

```json
{
  "request": {
    "height": 27522,
    "method": "getTx",
    "timestamp": 1620068626,
    "txIndex": 2,
  },
  "id": "632",
}
```

```json
{
  "response": {
    "ok": true,
    "request": "632",
    "timestamp": 1620068626,
    "tx": {
      "hash": "hexString",
      "signature": "hexString",
      "tx": "base64String",
    }
  },
  "id": "632",
  "signature": "hexString"
}
```

### Get Tx By ID (height)

Get a single tx from the [Vochain](/architecture/services/vochain). `id` is that transaction's height on the vochain as a whole, and each ID value references a unique transaction. Transaction ID corresponds to the order in which that transaction was mined.

```json
{
  "request": {
    "id": 851,
    "method": "getTxById",
    "timestamp": 1625063686
  },
  "id": "137",
  "signature": "hexString"
}
```

```json
{
  "response": {
    "ok": true,
    "request": "137",
    "timestamp": 1625063686,
    "tx": {
      "block_height": 354792,
      "hash": "hexString",
      "id": 851,
      "signature": "hexString",
      "tx": "base64String"
    }
  },
  "id": "137",
  "signature": "hexString"
}
```

### Get Transaction By Hash

Get a single transaction from the [Vochain](/architecture/services/vochain). `hash` is the hash of the bytes of that transaction and is identical to the `hash` returned by other transaction API calls. More specifically, this value is the Tendermint hash of the entire `req.Tx` added to the vochain state. This call can be used to verify that a transaction was mined.

```json
{
  "request": {
    "hash": "hexString",
    "method": "getTxByHash",
    "timestamp": 1625063687
  },
  "id": "137",
  "signature": "hexString"
}
```

```json
{
  "response": {
    "ok": true,
    "request": "137",
    "timestamp": 1625063686,
    "tx": {
      "block_height": 354793,
      "hash": "hexString",
      "id": 852,
      "signature": "hexString",
      "tx": "base64String"
    }
  },
  "id": "137",
  "signature": "hexString"
}
```

### Get Validator List

Get the list of all addresses currently validating blocks on the [Vochain](/architecture/services/vochain). 

```json
{
  "request": {
    "method": "getValidatorList",
    "timestamp": 1620059997
  },
  "id": "199",
}
```

```json
{
  "response": {
    "ok": true,
    "request": "199",
    "timestamp": 1620059998,
    "validatorlist": [
      {
        "address": "base64string",
        "power": 10,
        "pubKey": "base64string"
      },
      {
        "address": "base64string",
        "power": 10,
        "pubKey": "base64string"
      },
      {
        "address": "base64string",
        "power": 10,
        "pubKey": "base64string"
      },
      {
        "address": "base64string",
        "power": 10,
        "pubKey": "base64string"
      }
    ]
  },
  "id": "199",
  "signature": "hexString"
}
```


### Get Tx List For Block

Get a list of transactions contained in the given block (at most, 64 per request).

The `fromId` field works the same as in [Get Process List](#get-process-list).

```json
{
  "request": {
    "height": 27522,
    "listSize": 1,
    "method": "getTxListForBlock",
    "timestamp": 1620070701
  },
  "id": "887",
}
```

```json
{
  "response": {
    "ok": true,
    "request": "887",
    "timestamp": 1620070701,
    "txList": [
      {
        "Hash": "hexString",
        "Index": 0,
        "Type": "vote"
      },
      {
        "Hash": "hexString",
        "Index": 1,
        "Type": "vote"
      }
    ]
  },
  "id": "887",
  "signature": "hexString"
}
```

## File API

### Fetch File

Fetch a file from the P2P network (currently IPFS) and return it encoded in base 64.

```json
{
  "id": "req-2345679",
  "request": {
    "method": "fetchFile",
    "uri": "<content uri>",
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "content": "base64Payload",  // The contents of the file
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```
  
**Used in:**
- [Voting process retrieval](/architecture/component-interaction.html#voting)
- [Vote scrutiny](/architecture/component-interaction.html#after-voting)

**Related:**
- [Content URI](/architecture/protocol/data-origins.html#content-uri)


### Add File

Uploads a file and pins it on an IPFS cluster. This private method is aimed to be used by the election organizer. The Gateway running the API is usually a private server, only used by entity admins.

These methods require authentication, following the [JSON API rules](/architecture/protocol/json-api.html#authentication).

```json
{
  "id": "req-2345679",
  "request": {
    "method": "addFile",
    "type": "ipfs",
    "content": "base64Payload",  // File contents
    "name": "string",            // Human readable name to help identify the content in the future
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "uri": "<content uri>",
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
  
}
```

**Used in:**
- [Voting process creation](/architecture/component-interaction.html#voting-process-creation)

**Related:**
- [Content URI](/architecture/protocol/data-origins.html#content-uri)

### List pinned files

This method provides private Gateway users with the list of resources that have been pinned on IPFS.

```json
{
  "id": "req-2345679",
  "request": {
    "method": "pinList",
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```

```json
{
  "id": "req-2345679",
  "response": {
    "files": [
      { "name": "file1.txt", "uri": "<content-uri>" },
      { "name": "file2.png", "uri": "<content-uri>" },
      { "name": "file3.bin", "uri": "<content-uri>" },
      ...
    ],
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

**Related:**
- [Content URI](/architecture/protocol/data-origins.html#content-uri)

### Pin a file

This method allows administrators to pin already existing remote content, so it remains available on IPFS.

```json
{
  "id": "req-2345679",
  "request": {
    "method": "pinFile",
    "uri": "<content-uri>", // Multiple origins can be pinned at once
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```
```json
{
  "id": "req-2345679",
  "response": {
    "ok": true,
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```


### Unpin a file

This method is the counterpart of `pin` and `addFile`. It allows administrators to unpin and drop content from a Gateway so it doesn't eventually run out of space.


```json
{
  "id": "req-2345679",
  "request": {
    "method": "unpinFile",
    "uri": "<content-uri>",  // Multiple origins can be unpinned at once
    "timestamp": 1556110671
  },
  "signature": "hexString"
}
```
```json
{
  "id": "req-2345679",
  "response": {
    "ok": true,
    "request": "req-2345679",
    "timestamp": 1556110672
  },
  "signature": "hexString"
}
```

**Related:**
- [Content URI](/architecture/protocol/data-origins.html#content-uri)

## Using the API (for beginners)

If you don't have experience using a [JSON API](/architecture/protocol/json-api), let's run through an example. Here we'll be using [curl](https://linux.die.net/man/1/curl) to make requests to https://gw1.vocdoni.net, one of the gateways hosted by Vocdoni.

Open a terminal emulator and run the following command:

```bash
curl https://gw1.vocdoni.net/dvote -X POST -H Content-Type:application/json --data '{"id": "req00'$RANDOM'", "request": {"method": "getInfo", "timestamp":'$(date +%s)'}}'
```

you should see a response:
```json
{
  "response": {
    "apiList": [
      "file",
      "vote",
      "results",
      "indexer"
    ],
    "health": 77,
    "ok": true,
    "request": "req0015529",
    "timestamp": 1623410118
  },
  "id": "req0015529",
  "signature": "a80f11f32190c5ae55ac6ed1494daf7fc570baa2d275403e6d497455d4a513e37ac42dbbee7e16ae38ce55850756038e7d88822d4bcdec00d6b2047601610ba301"
}
```

now we know that the gateway hosted at gw1.vocdoni.net enables the file, [vote](/architecture/services/gateway.html#vote-api), [results](/architecture/services/gateway.html#results-api), and [indexer](/architecture/services/gateway.html#indexer-api) apis. 

Let's do some simple requests to learn more about the state of the Vochain.

```bash
curl https://gw1.vocdoni.net/dvote -X POST -H Content-Type:application/json --data '{"id": "req00'$RANDOM'", "request": {"method": "getStats", "timestamp":'$(date +%s)'}}'
```

```json
{
  "response": {
    "ok": true,
    "request": "req005711",
    "stats": {
      "block_height": 216810,
      "block_time": [
        12000,
        11764,
        11920,
        11900,
        11912
      ],
      "block_time_stamp": 1623417292,
      "chain_id": "vocdoni-release-1.0.1",
      "entity_count": 73,
      "envelope_count": 1804,
      "genesis_time_stamp": "2021-05-12T12:38:33.672114557Z",
      "process_count": 202,
      "syncing": false,
      "validator_count": 5
    },
    "timestamp": 1623417311
  },
  "id": "req005711",
  "signature": "e91bd3394104b416a2cacd9bf0f47d36e7e17a53edef072105f477c85bbbb9642865350182758e723048eb4c4c36a6e49844e99da3428933a5ec0384e87909f201"
}
```

we know there are 73 entities. Let's list the first 10:

```bash
curl https://gw1.vocdoni.net/dvote -X POST -H Content-Type:application/json --data '{"id": "req00'$RANDOM'", "request": {"method": "getEntityList", "from": 0, "listSize": 10, "timestamp":'$(date +%s)'}}'
```

```json
{
  "response": {
    "entityIds": [
      "6b175474e89094c44da98b954eedeac495271d0f",
      "a117000000f279d81a1d3cc75430faa017fa5a2e",
      "c02f9e6f32841d1d827b5a4d4a4f1762fddeca8f",
      "df329aaf25131e47dc33c0bec24d5be1987cc821",
      "ba5dbe351ef455b876d9faff3286dc60bf2a0b74",
      "8a77ba9ec4c9fbb2adb9ccdf73f5cfab54986607",
      "0924e2baa477d3b3ec1668369337bf574a4190d4",
      "4564c9bc8db2f83a6c448ee542d2cef6c24c69ff",
      "f7306afac9abf11ec49dc30e2a9a2cfe5cb76c5a",
      "d41665e0f8b8b6b2e076723e05850a443660566d"
    ],
    "ok": true,
    "request": "req0026064",
    "timestamp": 1623419048
  },
  "id": "req0026064",
  "signature": "1ec2daddbc811f19bef08eaf5d922e0d8c030ee4e12d4cf888b82744899731d333831fb0ed5c804757f373b064be7451833e268056d5ef7e6534760bf2cd652a00"
}
```

Now let's see the list of processes started by the first entity:

```bash
curl https://gw1.vocdoni.net/dvote -X POST -H Content-Type:application/json --data '{"id": "req00'$RANDOM'", "request": {"method": "getProcessList", "from": 0, "listSize": 64, "entityID": "6b175474e89094c44da98b954eedeac495271d0f", "timestamp":'$(date +%s)'}}'
```

```json
{
  "response": {
    "ok": true,
    "processList": [
      "b21982b7a69d0a8b1e6645afbe12c9dec42703cd994f9b02bd8922a921325d15"
    ],
    "request": "req007487",
    "size": 1,
    "timestamp": 1623418108
  },
  "id": "req007487",
  "signature": "c9fdf2faf545d1d4e669b4a61bb6165a33258df6c3033913002f4924aa3e5ba83157202639cf8508a0e80aee1ee44976a8a7ab174e2ff546cf71e4bcd6e5cb7001"
}
```

And finally, let's get the details of this process:

```bash
curl https://gw1.vocdoni.net/dvote -X POST -H Content-Type:application/json --data '{"id": "req00'$RANDOM'", "request": {"method": "getProcessSummary", "processID": "b21982b7a69d0a8b1e6645afbe12c9dec42703cd994f9b02bd8922a921325d15", "timestamp":'$(date +%s)'}}'
```

```json
{
  "response": {
    "ok": true,
    "processSummary": {
      "blockCount": 50738,
      "entityId": "6b175474e89094c44da98b954eedeac495271d0f",
      "entityIndex": 1,
      "envelopeHeight": 0,
      "envelopeType": {},
      "sourceNetworkID": "UNKNOWN",
      "startBlock": 15593,
      "state": "RESULTS"
    },
    "request": "req009439",
    "timestamp": 1623418186
  },
  "id": "req009439",
  "signature": "b188b512c46446a8b23d1fc0dffd585076d8745c799a377db71bb63ff8aab1090d42df2d4fdef9f0ee6e736e38475b4babcf65dbe956fafcd3ffee163d44a27e01"
}
```

Hopefully now you have a rough idea of how to use the Gateway APIs. 
