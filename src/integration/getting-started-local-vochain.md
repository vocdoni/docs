# Getting started with a local instance

`cli` is a command line interface to the vochain for end users with basic blockchain and CLI experience.

`voconed` is a convenient form of `dvotenode` that doesn't require that much setup. It's useful as a quick single-node test blockchain to get a feeling for the vochain as a whole.

# Building
```
git clone https://github.com/vocdoni/vocdoni-node && cd vocdoni-node
go build ./cmd/cli
go build ./cmd/voconed
```

# Run the chain

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

Example of a running instance:

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

# Connect and interact with the running chain

```
$ ./cli --help
--config string     config file (default "/home/me/.vocdoni-cli.json")
--host string       API host endpoint to connect with (such as http://localhost:9090/v2)
--logLevel string   log level (default "error")

$ ./cli http://localhost:9090/v2
 
⚙️  Handle accounts
📖  Account info
✨  Account bootstrap
👛  Transfer tokens
🕸️  Network info
📝  Build a new census
🗳️  Create an election
☑️  Vote
🖧  Change API endpoint host
💾  Save config to file
❌  Quit
```
