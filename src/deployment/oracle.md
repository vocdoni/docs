# Oracle deployment (stage)

This section shows how to deploy a node with the oracle role running on Vocdoni network, relay Ethereum transactions and signal events within the own Vochain. This component also requires an Ethereum node, ideally running next to it, so we are going to deploy both components.

To get more information about the oracle component, read the [component docs](https://docs.vocdoni.io/#/architecture/components).

## Requirements

### Hardware

- 4 Cores
- 16GB RAM
- 80GB SSD disk space

Note: 2 Cores or 40GB SSD might be enough, but it is not recommended.

### Software

- GNU/Linux based operating system
- Git
- Docker engine (version 19.03 or above) [Installation](https://docs.docker.com/engine/install/#server)
- Docker compose (version 1.24 or above) [Installation](https://docs.docker.com/compose/install)

### Network

The list of exposed ports to the Internet is as follows:

- 9090
- 26656
- 26657
- 37671

Note: All all ports are TCP.

## Deploy with docker compose

Clone the repository [vocdoni-node](https://github.com/vocdoni/vocdoni-node) in your current path, and checkout the `stage` branch:

```bash
git clone https://github.com/vocdoni/vocdoni-node
cd vocdoni-node
git checkout stage
```

This is the source path of the go-dvote. We are going to use files provided for a docker compose deploy:

```bash
cd dockerfiles/dvotenode
ls
```

As you can see here, there are many YAML files. The main one we are going to use is `docker-compose.yml`. This file uses the `env` file to configure the node with environment variables. There are many parameters to configure, but we are going to show a selection of them just to get started with the stage deployment. To get a reference of all the variables, check the `env.example` file.

We are also going to use `docker-compose.web3.yml` and `docker-compose.watchtower.yml`, to run the side containers.

Now, create and edit the `env` file and add the content as follows:

```bash
DVOTE_DATADIR=/app/run
DVOTE_MODE=oracle
DVOTE_ETHCONFIG_SIGNINGKEY=
DVOTE_W3CONFIG_ENABLED=False
DVOTE_VOCHAINCONFIG_KEYKEEPERINDEX=1
DVOTE_W3CONFIG_W3EXTERNAL=/app/eth/jsonrpc.ipc
DVOTE_METRICS_ENABLED=True
DVOTE_METRICS_REFRESHINTERVAL=10
DVOTE_VOCHAIN=stage
DVOTE_ETHCONFIG_CHAINTYPE=xdaistage
```

**Warning:** The `DVOTE_VOCHAINCONFIG_KEYKEEPERINDEX` value is specific for every oracle, so you will need to coordinate with the rest and make sure you have the correct index configured.

Now, we are going to generate a random number of 32bits and we will use as a private key, and to have a fixed public address derived from it. Run the following command (only once) to add the key to the env file.

```bash
sed -i "s/DVOTE_ETHCONFIG_SIGNINGKEY=/&$(openssl rand -hex 32)/" env
```

Now we have to pull the docker images:

```
docker-compose -f docker-compose.watchtower.yml -f docker-compose.web3.yml -f docker-compose.yml pull
```

After this step, we are ready to deploy the oracle node with:

```
docker-compose -f docker-compose.watchtower.yml -f docker-compose.web3.yml -f docker-compose.yml up -d
```

After this step, the oracle node will start and the Ethereum node will start to synchronize. It can take many hours to complete the process.

## Obtain oracle's public key

To obtain the oracle Ethereum public key run the following command:

```
docker-compose  logs | grep "Ethereum address"
```

The output should be similar to:

```
dvotenode_1  | 2021-02-08T20:25:05Z	INFO	chain/chain.go:206	my Ethereum address 3a6197fc630591c718b625b0388ebe018c653672
```

Copy and paste the last part, this public key will be needed to add it to the list of trusted oracles.

**Warning:** Do not share the private key with other oracles of the network, and save a backup as it could be needed in case of data loss.
