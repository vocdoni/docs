### Vote data structures

All in JSON format

#### Vote Package

Vote packages are created by the clients/voters and sent to the relay pool.

```
{
"type": "votePackage",
 "processID": b64String,
 "nullifier": hexString,
 "vote": hexString,
 "franchise": hexString
}
```

+ **processID:** string identifying the election/process
+ **nullifier:** hash(clientPrivateKey+ProcessID)
+ **vote:** pubkey encrypted serialized vote
+ **franchise:** serialized franchise proof


They are sent inside a *Vote Envelope*

#### Vote Envelope

```
{
 "type": "voteEnvelope",
 "timestamp": uint,
 "keyProof": hexString,
 "nonce": uint64,
 "package": hexString
}
```

+ **unix_timestamp:** UNIX time of the exact moment of sending packet
	+ if timestamp < current_time, packet is discarted
	+ if timestamp > current_time + relay_patience, packet is discarted
	+ else packet is processed
+ **keyProof:** encrypted(8BytesTrunkedHash(package)) String of small size encrypted with relay pubKey, is used to let relays quickly know if the votePackage is for him. No padding.
+ **nonce:** Proof-of-Work nonce
  hashing the whole data structure should accomplish difficulty. if PoW does not accomplish target difficulty, packet is discarted
+ **package:** the Vote package as encrypted serialized Hexadecimal string

#### Vote Batches 

Batches are sent by Relays once they registered a batch/set of votes to the BlockChain and make them available in the distributed filesystem.

Clients can identify when their vote has been registered once they find the nullifier inside a Batch packet.

```
{
 "type": "voteBatch",
 "nullifiers": [hexString1,hexString2,...],
 "url" : b64String, 
 "txid": hexString,
 "nonce": uint64,
 "signature": hexString
}
```

+ **nullifiers**: list of hexString nullifiers included in the batch
+ **url**: URL where to find the batch package data (such as ipfs-hash)
+ **txid**: Ethereum transaction ID
+ **nonce**: Proof-of-Work nonce
+ **signature**: Relay signature of concatenated nullifiers + url + txid

