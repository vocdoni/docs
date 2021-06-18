# Custom Vochain Deployment

In this document we will guide through the steps of deploying a full Vochain (Vocdoni's blockchain) stack using a custom arquitecture. It is meant to give the reader a general idea on how Vocdoni components work, and it is not meant to be production ready chain.

The Vocdoni's mainnet chain genesis is 'hardcoded' into the project's code itself, but it is also possible to generate any other tendermint based chain at will for testing, forking or any other purposes.

For this example, we are going to show a simple environment consisting of 3 miners, two gateways and one oracle.

Please refer to the [documentation](https://docs.vocdoni.io/#/architecture/general) to learn more about each type of node role.

### Requirements

### Genesis and keys generation

First, we are going to generate all the cryptographic keys that our nodes will use to identify themselves, sign transactions, etc. The project `go-dvote` includes a command line tool to help us with that, so we can do it in only one command.

Let's build `dvotecli` tool. Clone the project:

```
git clone https://github.com/vocdoni/go-dvote
cd go-dvote
```

Then, build the command line tool:

```
go build ./cmd/dvotecli
```

Now we are ready to generate the keys and the genesis.
This tool will provide us keys for miners and oracles, the gateways will follow later on.

We need to choose a chain identification name for it, we will call it `examplechain`

We are going to deploy 3 miners and one oracle only, so the command will be:

```
./dvotecli generate --chainId examplechain --miners 3 --oracles 1
```

The (long) output will be similar to:

```
>>> Miner #1
Address: DF071D6D2543569845AE7597E36423E748A372CA
Private Key: 763db55b88a010e3add4d801320107d58909efdcb82e1ca4edb02b7535d7a3d5345c5cd42b0b37ac3ad91a98e259a18c1423921545f029f534baac9312ec16ae
>>> Miner #2
Address: 1C8F495E296C38274F71B3BD4D2A40503276BF96
Private Key: 51c7662540ca01338fefa5c8caf6a26020bbaa2a437203d0d12717228eb6632d189d60ff7c66c29dd41d7a141b5b21e841cb8cb9d8d6537b1fe9f6ca6a20b67d
>>> Miner #3
Address: E1467FE6E32824854837A7DB68D6B27D3080034E
Private Key: d5a8d1d975370d83763c4623ffaf0f421ace76225b8ef53406486d945ec64339985080fc53ef5f36cfd882feec67d067f694d658d4683786112f8576a1fb4b18

>>> Oracle #1
Address: 0xdb016B645f49b70B881E118da91d502e88b3888A
Private Key: 35326662373437353637633539393332653336356136393935643662626136616530623836353435356162356532343461366466666261613066343437333464

>>> Genesis JSON
{
  "genesis_time": "2020-11-03T10:05:40.580623347Z",
  "chain_id": "examplechain",
  "consensus_params": {
    "block": {
      "max_bytes": "22020096",
      "max_gas": "-1",
      "time_iota_ms": "1000"
    },
    "evidence": {
      "max_age_num_blocks": "100000",
      "max_age_duration": "172800000000000"
    },
    "validator": {
      "pub_key_types": [
        "ed25519"
      ]
    }
  },
  "validators": [
    {
      "address": "DF071D6D2543569845AE7597E36423E748A372CA",
      "pub_key": {
        "type": "tendermint/PubKeyEd25519",
        "value": "NFxc1CsLN6w62RqY4lmhjBQjkhVF8Cn1NLqskxLsFq4="
      },
      "power": "10",
      "name": "miner-1"
    },
    {
      "address": "1C8F495E296C38274F71B3BD4D2A40503276BF96",
      "pub_key": {
        "type": "tendermint/PubKeyEd25519",
        "value": "GJ1g/3xmwp3UHXoUG1sh6EHLjLnY1lN7H+n2ymogtn0="
      },
      "power": "10",
      "name": "miner-2"
    },
    {
      "address": "E1467FE6E32824854837A7DB68D6B27D3080034E",
      "pub_key": {
        "type": "tendermint/PubKeyEd25519",
        "value": "mFCA/FPvXzbP2IL+7GfQZ/aU1ljUaDeGES+FdqH7Sxg="
      },
      "power": "10",
      "name": "miner-3"
    }
  ],
  "app_hash": "",https://docs.vocdoni.io/#/architecture/general
  "app_state": {
    "validators": [
      {
        "address": "DF071D6D2543569845AE7597E36423E748A372CA",
        "pub_key": {
          "type": "tendermint/PubKeyEd25519",
          "value": "NFxc1CsLN6w62RqY4lmhjBQjkhVF8Cn1NLqskxLsFq4="
        },
        "power": "10",
        "name": "miner-1"
      },
      {
        "address": "1C8F495E296C38274F71B3BD4D2A40503276BF96",
        "pub_key": {
          "type": "tendermint/PubKeyEd25519",
          "value": "GJ1g/3xmwp3UHXoUG1sh6EHLjLnY1lN7H+n2ymogtn0="
        },
        "power": "10",
        "name": "miner-2"
      },
      {
        "address": "E1467FE6E32824854837A7DB68D6B27D3080034E",
        "pub_key": {
          "type": "tendermint/PubKeyEd25519",
          "value": "mFCA/FPvXzbP2IL+7GfQZ/aU1ljUaDeGES+FdqH7Sxg="
        },
        "power": "10",
        "name": "miner-3"
      }
    ],
    "oracles": [
      "0xdb016B645f49b70B881E118da91d502e88b3888A"
    ]
  }
}
```

As you can see, there's a first part with public / private keypairs for the miners and oracles, and a second part with JSON data, which defines the genesis file itself.

Copy and paste all into a file. You can also redirect the output to a file, like this:

```
./dvotecli --color=false  generate --chainId examplechain --miners 3 --oracles 1 > example_chain.txt
```

### Miners deployment

### Oracle deployment
