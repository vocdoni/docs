# Gateway Deployment (stage)

This section shows how to deploy a node with the gateway role running on Vocdoni, which provides an entry point to the P2P networks for the clients. To get more information about the gateway component, read the [gateway docs](https://docs.vocdoni.io/#/architecture/services/gateway).

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

- 443
- 4001
- 4171
- 9090
- 26656
- 26657

Note: All all ports are TCP.

It is also required for the API to have a public DNS domain available and with A / AAAA records pointing to the gateway IP.

### Docker compose

Hands on! Clone the repository [vocdoni-node](https://github.com/vocdoni/vocdoni-node) in your current path, and change the branch:

```bash
git clone https://github.com/vocdoni/vocdoni-node
cd vocdoni-node
git checkout stage
```

This is the source path of the vocdoni-node. We are going to use files provided for a docker compose deploy:

```bash
cd dockerfiles/dvotenode
ls
```

As you can see, there are many YAML files. The main one we are going to use is `docker-compose.yml`. This file uses the `env` file to configure the node with environment variables. There are many parameters to configure, but we are going to show a basic selection of them just to get started with the mainnet. To get a reference of all the variables, check the `env.example` file.

Now, create and edit the `env` file and add the content like this:

```bash
DVOTE_DATADIR=/app/run
DVOTE_MODE=gateway
DVOTE_IPFS_SYNCKEY=vocdonistage
DVOTE_API_SSL_DOMAIN=
DVOTE_ETHCONFIG_SIGNINGKEY=
DVOTE_VOCHAINCONFIG_MEMPOOLSIZE=200000
DVOTE_W3CONFIG_ENABLED=False
DVOTE_ETHCONFIG_NOWAITSYNC=True
DVOTE_METRICS_ENABLED=True
DVOTE_METRICS_REFRESHINTERVAL=10
DVOTE_VOCHAIN=stage
```

Now, we are going to generate a random number of 32bits and we will use as a private key, and to have a fixed public address derived from it. Run the following command (only once) to add the key to the env file.

```bash
sed -i "s/DVOTE_ETHCONFIG_SIGNINGKEY=/&$(openssl rand -hex 32)/" env
```

It is highly recommended to add SSL support to your gateways APIs. You can add your own using other components in your Docker stack, such as `nginx-proxy` or `traefik`. However, go-dvote has full Let's Encrypt support built in.

To get the certificates and enable it, we are going to assume you have a DNS domain pointing to your gateway, i.e. `gateway1.mydomain.net`. If that's ready, then it's only a matter of adding a new variable to the `env` file, using your own domain:

```bash
DVOTE_API_SSL_DOMAIN=gateway1.mydomain.net
```

Now we are ready to start the node. First, let's pull the docker image:

`docker-compose -f docker-compose.watchtower.yml -f docker-compose.yml pull`

Then we start the node in a detached mode:

`docker-compose -f docker-compose.watchtower.yml -f docker-compose.yml up -d`

The gateway should be up and syncing the vochain with other peers.

To get some output from the logs run this command

`docker-compose logs | grep "custom pubKey"`

You should see a line similar to this:

```
dvotenode_1  | 2020-10-19T14:01:20Z	INFO	dvotenode/dvotenode.go:403	using custom pubKey 020ea27524f0daa120d9f04a1aaebb82944137e4eb675f0510c216c299a9412ab4
```

This is the public key that identifies your gateway node, and will be used to add your node to the list of public gateways of Vocdoni. **This is the value you have to share with other participants.**

Now the node is syncing, you can track the progress with:

`docker-compose logs -f`

There are lines like the following:

```
dvotenode_1  | 2020-10-20T07:21:39Z	INFO	service/vochain.go:133	[vochain info] fastsync running at block 6392 (52 blocks/s), peers 10
```

**Warning:** Do not share the private key with other gateways of the network, and save a backup as it could be needed in case of data loss.
