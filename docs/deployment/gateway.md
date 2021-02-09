# Gateway deployment (testnet)

This section shows how to deploy a node with the gateway role running on Vocdoni, which provides an entry point to the P2P networks for the clients. To get more information about the gateway component, read the [gateway docs](https://docs.vocdoni.io/#/architecture/services/gateway).

### Docker compose

Hands on! Clone the repository [vocdoni-node](https://github.com/vocdoni/vocdoni-node) in your current path:

```bash
git clone https://github.com/vocdoni/vocdoni-node
cd vocdoni-node
```

This is the source path of the vocdoni-node. We are going to use files provided for a docker compose deploy:

```bash
cd dockerfiles/dvotenode
ls
```

As you can see, there are many YAML files. The main one we are going to use is `docker-compose.yml`. This file uses the `env` file to configure the node with environment variables. There are many parameters to configure, but we are going to show a basic selection of them just to get started with the mainnet. To get a reference of all the variables, check the `env.example` file.

First, we are going to generate a random number of 32bits we will use as a private key, to have a fixed public address derived from it. Run the following command, and copy the output:

```bash
openssl rand -hex 32
```

Now, create and edit the `env` file and add the content like this, replacing `<32bit hex>` with the value you got in the previous command:

```bash
DVOTE_DATADIR=/app/run
DVOTE_MODE=gateway
DVOTE_DEV=True
DVOTE_IPFS_SYNCKEY=vocdonidev
DVOTE_ETHCONFIG_SIGNINGKEY=<32 bit hex>
DVOTE_W3CONFIG_ENABLED=False
DVOTE_ETHCONFIG_NOWAITSYNC=True
DVOTE_VOCHAIN=dev
```

Let's explain the variables:

`DVOTE_DATADIR=/app/run` This variable configures the path we will use to store the node's data (configuration, blockchain, etc.). It needs to be set to be consistent with the volume defined in the compose file.

`DVOTE_MODE=gateway` This is the mode of the node, which could be gateway, miner or oracle. Although this is the default setting, we set it for clarity.

`DVOTE_DEV=True` This variable enables the development mode, used in the development testnet.

`DVOTE_IPFS_SYNCKEY=vocdonidev` This variable defines a keyword to sync IPFS with other nodes of the network. All nodes sharing voting processes must have the same key, so let's use the same as Vocdoni devs.

`DVOTE_ETHCONFIG_SIGNINGKEY=<32 bit hex>` This key used both for signing transactions with the Web3 API, and to identify the node with it's derived public key. Tt's automatically generated if missing, but this way we ensure it's the same acr

`DVOTE_W3CONFIG_ENABLED=False` We are not going to use the Web3 API endpoint in this example, so we set this to False.

`DVOTE_ETHCONFIG_NOWAITSYNC=True` This tells the initialization of the node to not wait until the Web3 chain syncronization is ready, as mentioned.

`DVOTE_VOCHAIN=dev` This is the vochain network name. Can be `stage`, `dev` or `main`.

Now we are ready to start the node. First, let's pull the docker image:

`docker-compose pull`

Then we start the node in a detached mode:

`docker-compose up -d`

The gateway should be up and syncing the vochain with other peers.

To get some output from the logs run this command

`docker-compose logs | head -n23`

You should see a line similar to this:

```
dvotenode_1  | 2020-10-19T14:01:20Z	INFO	dvotenode/dvotenode.go:403	using custom pubKey 020ea27524f0daa120d9f04a1aaebb82944137e4eb675f0510c216c299a9412ab4
```

This is the public key that identifies your gateway node, and will be used to add your node to the (for now permissioned) list of public gateways of Vocdoni.

Now the node is syncing, you can track the progress with:

`docker-compose logs -f`

There are lines like the following:

```
dvotenode_1  | 2020-10-20T07:21:39Z	INFO	service/vochain.go:133	[vochain info] fastsync running at block 6392 (52 blocks/s), peers 10
```

After a few minutes, your node should be available. You can check if so, with the command:

### SSL certificates

For obvious reasons, it is recommended to add SSL support to your gateways APIs. You can add your own using other components in your Docker stack, such as `nginx-proxy` or `traefik`. However, go-dvote has full Let's Encrypt support built in.

To get the certificates and enable it, we are going to assume you have a DNS domain pointing to your gateway, i.e. `gateway1.mydomain.net`. If that's ready, then it's only a matter of adding a new variable to the `env` file:

```bash
DVOTE_API_SSL_DOMAIN=gateway1.mydomain.net
```

and then restart the node:

```bash
docker-compose up -d
```

After the syncronization, the endpoint `https://gateway1.mydomain.net` should be available. You can check if it's running ok with the following curl command to check if it returns `pong` :

```bash
curl https://gateway1.mydomain.net/ping
```

### Add the gateway to the public list

All vocdoni gateways are listed in public json files. Soon they will be discovered in a purely P2P fashion, as gateway discovery using libP2P is on the works, but for now they are listed in a permissioned way. Contact Vodoni team [at Discord](https://discord.gg/sQCxgYs) , and give us your node ID and hostname so we can list your node!
