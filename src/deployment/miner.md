# Miner deployment

This section shows how to deploy a node with the miner role running on Vocdoni network, to propose and include blocks in the Vochain.

To get more information about the miner role, read the [docs](https://docs.vocdoni.io/#/architecture/services/vochain?id=miner).

## Requirements

### Hardware

- 2 Cores
- 8GB RAM
- 40GB SSD disk space

### Software

- GNU/Linux based operating system
- Git
- Docker engine (version 19.03 or above) [Installation](https://docs.docker.com/engine/install/#server)
- Docker compose (version 1.24 or above) [Installation](https://docs.docker.com/compose/install)

### Network

The list of exposed ports to the Internet is as follows:

- 9090 For prometheus metrics
- 26656 For tendermint P2P
- 26657 For tendermint RPC

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

As you can see, there are many YAML files. The main one we are going to use is `docker-compose.yml`. This file uses the `env` file to configure the node with environment variables. There are many parameters to configure, but we are going to show a selection of them just to get started with the stage deployment. To get a reference of all the variables, check the `env.example` file.

Now, create and edit the `env` file and add the content as follows:

```bash
DVOTE_DATADIR=/app/run
DVOTE_MODE=miner
DVOTE_VOCHAINCONFIG_MINERKEY=
DVOTE_VOCHAINCONFIG_MEMPOOLSIZE=5000
DVOTE_METRICS_ENABLED=True
DVOTE_METRICS_REFRESHINTERVAL=10
DVOTE_VOCHAIN=stage
```

**Warning:** The `DVOTE_VOCHAINCONFIG_MINERKEY` value is specific for every miner which validates, so you will need to coordinate with the rest and make sure your key is added to the validator list.

Now, we are going to generate a random number of 64bits and we will use as a private key, and to have a fixed public address derived from it. Run the following command (only once) to add the key to the env file.

```bash
sed -i "s/DVOTE_VOCHAINCONFIG_MINERKEY=/&$(openssl rand -hex 64)/" env
```

Now we have to pull the docker images:

```
docker-compose -f docker-compose.watchtower.yml -f docker-compose.yml pull
```

After this step, we are ready to deploy the miner node with:

```
docker-compose -f docker-compose.watchtower.yml -f docker-compose.yml up -d
```

After this step, the miner node will start to synchronize and propose blocks.

## Obtain miner's public key

To obtain the miner tendermint public key run the following command:

```
docker-compose  logs | grep "tendermint address"
```

The output should be similar to:

```
dvotenode_1  | 2021-02-23T11:43:14Z	INFO	vochain/start.go:218	tendermint address: B04F5541E932BB754B566969A3CD1F8E4193EFE8
```

Copy and paste the last part, this public key will be needed to add it to the list of validators.

**Warning:** Do not share the private key with other nodes of the network, and save a backup as it could be needed in case of data loss.
