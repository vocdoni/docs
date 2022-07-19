# Getting started with a local instance
`vocli` is a command line interface to the vochain for end users with basic blockchain and CLI experience. For the latest usage information please refer to [vocdoni-node/cmd/vocli/README.md](https://github.com/vocdoni/vocdoni-node/blob/master/cmd/vocli/README.md).

`voconed` is a convenient form of `dvotenode` that doesn't require that much setup. It's useful as a quick single-node test blockchain to get a feeling for the vochain as a whole.

# Building
```
git clone https://github.com/vocdoni/vocdoni-node && cd vocdoni-node
go build ./cmd/vocli
go build ./cmd/voconed
```

```
$ ./vocli help
vocli is a convenience CLI that helps you do things on Vochain

Usage:
  vocli [command]

Available Commands:
  account     Manage a key's account. Accounts are stored on the vochain and are controlled by keys.
  claimfaucet Claim tokens from another account, using a payload generated from that account that acts as an authorization.
  genfaucet   Generate a payload allowing another account to claim tokens from this account.
  help        Help about any command
  keys        Create, import and list keys.
  mint        Mint more tokens to an address. Only the Treasurer may do this.
  send        Send tokens to another account
  sign        Sign a string message. Used for debugging
  txcost      Manage transaction costs for each type of transaction. Only the Treasurer may do this.

Flags:
  -d, --debug             prints additional information; $VOCHAIN_DEBUG
  -h, --help              help for vocli
      --home string       root directory where all vochain files are stored; $VOCHAIN_HOME (default "/home/shinichi/.dvote")
  -n, --nonce uint32      account nonce to use when sending transaction
                          	(useful when it cannot be queried ahead of time, e.g. offline transaction signing)
      --password string   supply the password as an argument instead of prompting
  -u, --url string        Gateway RPC URL; $VOCHAIN_URL (default "https://gw1.dev.vocdoni.net/dvote")

Use "vocli [command] --help" for more information about a command.
```

```
$ ./voconed --help
Usage of ./voconed:
      --dir string         storage data directory (default "/home/shinichi/.voconed")
      --oracle string      oracle private hexadecimal key
      --treasurer string   treasurer public address
      --logLevel string    log level (info, debug, warn, error) (default "info")
      --port int           network port for the HTTP API (default 9095)
      --urlPath string     HTTP path for the API rest (default "/dvote")
      --blockPeriod int    block time target in seconds (default 5)
      --blockSize int      max number of transactions per block (default 500)
      --txCosts uint       transaction cost for every transaction type (default 10)
      --disableIpfs        disable built-in IPFS node
pflag: help requested
```

# Run the chain
vochain has two types of important system accounts - the treasurer, who can mint/burn tokens, and oracles, a bridge to EVM chains that watches for events there and submits corresponding transactions on vochain, or submit a transaction on the EVM chain based on the result of a process on vochain. The treasurer mints tokens to new entities (accounts), who need the tokens to conduct a new process (poll, election etc). The entities in turn airdrop the tokens to the participants of the process/poll/election, so that the participants can submit transactions too.

Generate two keys, one for the treasurer and another for an oracle. Go-Ethereum's `geth` can be used for the same purpose - just rename the `.json` files to `.vokey`.

```
$ ./vocli keys new
The key will be generated the key and saved, encrypted, on your disk.
Remember to run 'vocli account set <address>' afterwards to create an account for this key on the vochain.
Your new key file will be locked with a password. Please give a password:

Your new key was generated
Public address of the key:   0x24F6b3f0AECbF7303bCdB786830C0f825A32cEEA
Path of the secret key file: /home/shinichi/.dvote/keys/0x24F6b3f0AECbF7303bCdB786830C0f825A32cEEA-2022-7-19.vokey
- As usual, please BACKUP your key file and REMEMBER your password!
```

Despite what the help message states, the treasurer account does not need the `account set` command, as it is handled differently in the vochain's State than a normal account. The oracle's account will be set by `voconed` automatically too, so you don't have to do anything.

`voconed` needs the private key of the oracle to run. Print the private key with the `keys showprivkey` command.
```
./vocli keys showprivkey /home/shinichi/.dvote/keys/0x24F6b3f0AECbF7303bCdB786830C0f825A32cEEA-2022-7-19.vokey
```

```
./voconed --treasurer=$TREASURER_ADDRESS --oracle=$ORACLE_PRIVATE_KEY --logLevel=info
022-07-19T20:00:22+02:00	INFO	voconed/voconed.go:89	logger construction succeeded at level info with output stdout
2022-07-19T20:00:22+02:00	INFO	voconed/voconed.go:90	using data directory at /home/shinichi/.voconed
2022-07-19T20:00:22+02:00	INFO	vochain/state.go:375	initializing StateDB
2022-07-19T20:00:22+02:00	INFO	vochain/state.go:439	StateDB load took 207ns
2022-07-19T20:00:22+02:00	INFO	vochain/state.go:352	state database is ready at version 0 with hash 23206a320bab2c8c7965f81692e2d49c11d266a57318b389c9d1ae46f1452246
2022-07-19T20:00:22+02:00	WARN	vocone/vocone.go:219	adding new oracle key 0x24F6b3f0AECbF7303bCdB786830C0f825A32cEEA
2022-07-19T20:00:22+02:00	WARN	scrutinizer/scrutinizer.go:177	could not get the transaction count: No data found for this key
2022-07-19T20:00:22+02:00	WARN	scrutinizer/scrutinizer.go:194	could not get the envelope count: No data found for this key
2022-07-19T20:00:22+02:00	WARN	scrutinizer/scrutinizer.go:207	could not get the process count: No data found for this key
2022-07-19T20:00:22+02:00	WARN	scrutinizer/scrutinizer.go:220	could not get the entity count: No data found for this key
2022-07-19T20:00:22+02:00	INFO	scrutinizer/scrutinizer.go:129	indexer initialization took 708.187µs, stored 0 transactions, 0 envelopes, 0 processes and 0 entities
2022/07/19 20:00:22 OK    0001_create_table_processes.sql
2022/07/19 20:00:22 OK    0002_create_table_votes.sql
2022/07/19 20:00:22 goose: no migrations to run. current version: 2
2022-07-19T20:00:22+02:00	INFO	service/storage.go:18	creating ipfs service
2022-07-19T20:00:22+02:00	INFO	ipfs/ipfs.go:29	checking if daemon is running
2022-07-19T20:00:22+02:00	INFO	ipfs/ipfsInit.go:37	initializing IPFS node at /home/shinichi/.voconed/ipfs
2022-07-19T20:00:22+02:00	INFO	vochaininfo/vochaininfo.go:161	starting vochain info service every 10 seconds
2022-07-19T20:00:22+02:00	INFO	ipfs/ipfsInit.go:87	IPFS configuration file initialized
2022-07-19T20:00:22+02:00	INFO	ipfs/ipfs.go:51	attempting to start IPFS node
2022-07-19T20:00:22+02:00	INFO	ipfs/ipfs.go:52	config root: /home/shinichi/.voconed/ipfs
2022-07-19T20:00:22+02:00	INFO	data/ipfs.go:79	IPFS peerID: QmcPkWwJyWAPdDd7kvpugcapaekwPY1Tjfa6gy1t9wwhMs
2022-07-19T20:00:22+02:00	INFO	voconed/voconed.go:109	setting treasurer 0xfe10DAB06D636647f4E40dFd56599da9eF66Db1c
2022-07-19T20:00:22+02:00	INFO	voconed/voconed.go:115	setting tx costs to 10
2022-07-19T20:00:22+02:00	INFO	vocone/vocone.go:446	[vochain info] height:0 mempool:0 processes:0 votes:0 vxm:0 voteCache:0 blockTime:{}
2022-07-19T20:00:22+02:00	INFO	httprouter/httprouter.go:150	starting go-chi http server
2022-07-19T20:00:22+02:00	INFO	httprouter/httprouter.go:164	router ready at http://[::]:9095
2022-07-19T20:00:22+02:00	INFO	httprouter/httprouter.go:178	added namespace rpcAPI
2022-07-19T20:00:22+02:00	INFO	httprouter/httprouter.go:212	added private handler for namespace rpcAPI with pattern /dvote
2022-07-19T20:00:22+02:00	INFO	rpcapi/handlers.go:100	enabling results API
2022-07-19T20:00:22+02:00	INFO	rpcapi/handlers.go:70	enabling vote API
2022-07-19T20:00:22+02:00	INFO	rpcapi/handlers.go:19	enabling file API
2022-07-19T20:00:22+02:00	INFO	rpcapi/handlers.go:131	enabling indexer API
...

```


# Create an Account
Now that `voconed` is running, create another account.

```
./vocli keys new
The key will be generated the key and saved, encrypted, on your disk.
Remember to run 'vocli account set <address>' afterwards to create an account for this key on the vochain.
Your new key file will be locked with a password. Please give a password:

Your new key was generated
Public address of the key:   0x110951D9259a9cD0830DCe90134b1079c01544A3
Path of the secret key file: /home/shinichi/.dvote/keys/0x110951D9259a9cD0830DCe90134b1079c01544A3-2022-7-19.vokey
- As usual, please BACKUP your key file and REMEMBER your password!
```
On Ethereum, you can create a new key without having to tell the network of its existence. This is different in Vochain, where we have to send a free `SetAccountInfoTx` to the network to tell vochain that this new Key exists, and we should create an Account for it. Hence the distinction between *Keys* and *Accounts* (Ethereum uses these words interchangeably).

Ensure that the `SetAccountInfoTx` is sent to your `voconed` instance using the environment variable `VOCHAIN_URL` or `--url`. The API URL always has to end in `/dvote`.
Currently, you may use any string for the IPFS Info-URI.
```
./vocli account set /home/shinichi/.dvote/keys/0x110951D9259a9cD0830DCe90134b1079c01544A3-2022-7-19.vokey ipfs://unvalidated --url=http://localhost:9095/dvote
or
VOCHAIN_URL=http://localhost:9095/dvote ./vocli account set /home/shinichi/.dvote/keys/0x110951D9259a9cD0830DCe90134b1079c01544A3-2022-7-19.vokey ipfs://unvalidated
```

# Workflow
1. An Entity (could be a real life company, organization or anon who wants to conduct a poll/process) creates an Account on the vochain.
2. The treasurer mints tokens to the entity's Account, thus ensuring that it can create a process.
3. The entity then sends tokens to other participants, who have created their own Accounts, ensuring that they can submit votes to the vochain.

For Step 3, an entity can simply send tokens using `vocli send` or use the `genfaucet/claimfaucet` commands. Any account can generate a "faucet package", which is then used by another account like a coupon to "claim the faucet". For examples, see the [vocli README.md](https://github.com/vocdoni/vocdoni-node/blob/master/cmd/vocli/README.md#faucet).