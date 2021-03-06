## Zk-Rollups (proposal)
*Zk-Rollups (proposal) for anti-coercive, scalable and deterministic execution*

The approach mentioned above presents an attack vector that could allow for automated vote buying mechanisms, especially for high-stakes elections.

Before an election ends, a user could exhibit their vote to a third party in exchange for a bounty. A buyer would need users to prove that their vote is associated with a given nullifier on the Vochain. This would require the generation of another valid ZK-Proof with the same nullifier as the original vote, but with different contents than the original.

One solution to this problem is to make use of **ZK-Rollups** as a vote aggregation and mixing mechanism between voters and the blockchain. This would make it impossible for any third party to verify that a voter chose a specific option.

Under this proposal, voters submit their encrypted vote envelopes using the same zk-SNARKs circuit as before. But instead of a public blockchain, each envelope is sent to a Rollup Relay through a private transport channel (many could exist). The Rollup Relay then decrypts the aggregated vote envelopes, validates them and computes them in batches (i.e 15 envelopes at a time) to produce a second ZK-Proof. Such a proof can be verified given the list of nullifiers and the aggregated results of the batch.
The new ZK-Proof and the results aggregate is what will be stored in a public blockchain, such as the Vochain or Ethereum.

In this scenario voters are able to verify that their vote has been processed. No outsider, however, can determine what choices were selected by a specific voter. 
At the same time, the election's traceability and transparency properties are preserved. 

<div style="padding: 20px; background-color: white; text-align: center;">
	<img src="/zk-rollup-vocdoni.png" alt="ZkRollup"/>
</div>


**Notes:**

+ In such scenario, the commitment and reveal keys of the previous schema are no longer necessary.
+ The Rollup Relays could potentially exchange private messages in order to announce the nullifiers they are processing (to avoid collisions).
+ Some tuning is still required on this proposal in order to enable elections to be kept "secret until the end", but this feature seems possible.
+ The Rollup Relay network might be incentivized in order to achieve better distribution. A mechanism such as the one implemented on the Hermez.io protocol (based on bidding) might be adopted.

<!------

## Linkable Ring Signatures

LRS allow members of a group to sign messages on the group's behalf. The resulting signature does not reveal the signer's identity (preserving anonymity) but at the same time, it is possible to determine whether two signatures have been issued by the same group member or not (linkability).

Unlike ZK Snarks, **LRS do not rely on a trusted setup**.

**Documentation**

- https://medium.com/asecuritysite-when-bob-met-alice/linkable-ring-signatures-stealth-addresses-and-mixer-contracts-cff7057a457

**Academic papers**

- https://eprint.iacr.org/2018/379.pdf
- https://dl.acm.org/citation.cfm.html#2103015

**Libraries**
- Go implementation: https://github.com/noot/ring-go (linkable branch)
- `Missing JavaScript implementation on ECDSA`


### How LRS are used in Vocdoni

#### 1. Registration to an organization

First, the Voters need to send their public keys to the Census organization service (each organization can choose which method to use for verifying an identity). This is done just once so the same public key can be used for multiple elections.

```mermaid
graph TD;
C((Organization Census))
V1(Voter)-- send public key -- >C
V2(Voter)-- send public key -- >C
V3(Voter)-- send public key -- >C
```

#### 2. Create census rings

The usage of LRS requires the census to be published, so Voters can create their Rings for casting the vote. The Ring creation follow a set of principles:

+ If Census < 1000, use a single Ring with all existing pubkeys
+ If Census > 1000, census must be split on several groups of keys
	+ the organizer will publish a number (N) which will be used by the voters to know to which group of keys are they assigned by using the following formula: 
	`GroupNumber = VoterPubKey % N`
	+ before publishing N the census must pre-compute all the keys to check that if accomplish the minimum size group of keys. So in case N generates a group with too few, that number must be discarted and try a new one

#### 3. Derivate election keys

In addition to `N`, the Organizer will publish a uniq ID that will identify the election (`processID`). This ID will be used by both parties (Voter and Organizer) to derivate the temporary election public keys using the following mechanism:

+ On ECDSA the PubKey deviates from the PrivKey as follows:
`PubKeyVoter = PrivKeyVoter * G`
+ The Organizer derivate the new temporary PublicKey for each voter this way:
`PubKeyElectionVoter = PubKeyVoter + G*Hash(ElectionID)`
+ Each voter deviates their new Private Key this way: 
`PrivKeyElectionVoter = PrivKeyVoter + Hash(ElectionID)`


#### 4. Start an election and vote

Once the Rings and the temporary keys are published, the Voter can create its Linkable Ring Signature for signing the ballot.

```mermaid
graph BT;
O((Organizer)) -- >|Create new election|B
B[Blockchain] -- >|fetch election ID| C((Census))
B -- >|fetch election ID| V1(Voter 1)

C-.->Pub1["PubKey V1 + electionID"]
C-.->Pub2["PubKey V2 + electionID"]
C-.->Pub3["PubKey V3 + electionID"]

R[Linkable Ring Signature]
V1-.->Priv1["Privkey V1 + electionID"]
Priv1-- >|create election signature| R

subgraph 
Pub1-.-R
Pub2-.-R
Pub3-.-R
end
```

---

### Performance

ECDSA Linkable Ring Signature test using Go on a Core i7 with 8GB of RAM

```
Time: 0,388s
Signature size: 100
Signature bytes: 9735
```

```
Time: 2,567s
Signature size: 1000
Signature bytes: 96114
```


### Javascript example (using RSA)

The Vocdoni platform is designed to work on Ethereum public blockchains, so its users are meant to be using ECDSA key pairs.

As a reference, you can have a look at an RSA implementation: https://github.com/MaiaVictor/lrs

Install via npm
```sh
npm install lrs
```

On `test-node.js` add the following lines and run the script:

```javascript
const lrs = require("lrs");
const NUM_ACCOUNTS = 1000;
const accounts = [];

// parties generate their public/private key pairs
console.time("Generate keys");
for (let i = 0; i < NUM_ACCOUNTS; i++) {
	accounts.push(lrs.gen());
}
console.timeEnd("Generate keys");

// first key is for alice (the real signer)
const alice = accounts[0];

// The list of public key is known and distributed
var group = accounts.map((m) => m.publicKey);
console.log("Group data length:", JSON.stringify(group).length, "bytes");

// Alice signs a message in behalf of one of the group
console.time("Sign ring")
var signed = lrs.sign(group, alice, "The body is buried on the backyard.");
console.timeEnd("Sign ring")

console.log("Signature data length:", signed.length, "bytes");

// Anyone is able to verify *some* of them signed that message
console.time("Verify")
console.log(lrs.verify(group, signed, "The body is buried on the backyard."));
console.timeEnd("Verify")

console.time("Check double sign")
// If that same person signs another message...
var signed2 = lrs.sign(group, alice, "Just kidding, he is alive.");
console.timeEnd("Check double sign")

// We are able to tell the signature came from the same person
console.log(lrs.link(signed, signed2));
```
### On browser

Edit an HTML container:

```html
<!DOCTYPE html>
<html>

<head></head>

<body>
	<h3>Linkable ring signature</h3>
	<pre id="content"></pre>

	<script src="./test-browser.js"></script>
</body>

</html>
```

And then edit the `test-browser.js` file:

```javascript
const lrs = require("lrs");
const NUM_ACCOUNTS = 100;
const accounts = [];

// LOGGING SCREEN UTILS

const logMap = {}

function log(text, ...rest) {
	const node = document.querySelector("#content")
	if (node) node.innerText += text + " " + rest.join(" ") + "\n"
	console.log(text, ...rest)
}

function logStart(key) {
	const node = document.querySelector("#content")
	if (logMap[key]) {
		console.warn(`logStart(${key}) is already defined. Overwriting.`)

		logMap[key] = Date.now()
		if (node) node.innerText += key + " [restarted]\n"
	}
	else {
		logMap[key] = Date.now()
		if (node) node.innerText += key + " [started]\n"
		console.log(key + " [started]")
	}
}

function logEnd(key) {
	if (!logMap[key]) {
		const node = document.querySelector("#content")
		if (node) node.innerText += key + " [unstarted]\n"
		console.warn(`logStart(${key}) not started.`)
		return
	}

	const diff = (Date.now() - logMap[key]) / 1000
	const node = document.querySelector("#content")
	if (node) node.innerText += `${key} [done in ${diff.toFixed(1)}s]\n`
	log(`${key} [done in ${diff.toFixed(1)}s]`)
	delete logMap[key]
}

// CODE

function main() {
	// parties generate their public/private key pairs
	logStart("Generate keys");
	for (let i = 0; i < NUM_ACCOUNTS; i++) {
		accounts.push(lrs.gen());
	}
	logEnd("Generate keys");

	// first key is for alice (the real signer)
	const alice = accounts[0];

	// The list of public key is known and distributed
	var group = accounts.map((m) => m.publicKey);

	// Alice signs a message in behalf of one of the group
	logStart("Sign ring")
	var signed = lrs.sign(group, alice, "The body is buried on the backyard.");
	logEnd("Sign ring")

	log("Signature", signed.length);

	// Anyone is able to verify *some* of them signed that message
	logStart("Verify")
	log(lrs.verify(group, signed, "The body is buried on the backyard."));
	logEnd("Verify")

	logStart("Check double sign")
	// If that same person signs another message...
	var signed2 = lrs.sign(group, alice, "Just kidding, he is alive.");
	logEnd("Check double sign")

	// We are able to tell the signature came from the same person
	log(lrs.link(signed, signed2));
}

main();

```

You can use ParcelJS to run the example:

```
npx parcel index.html -p 8080
```

### Run test.js

```
$ size=100 node test.js
Generate keys: 854.913ms
Sign ring: 812.574ms
Signature 19675
true
Verify: 721.555ms
Check double sign: 773.458ms
true

$ size=1000 node test.js
Generate keys: 7043.474ms
Sign ring: 7106.234ms
Signature 193240
true
Verify: 6933.126ms
Check double sign: 7318.286ms
true

$ size=5000 node test.js
Generate keys: 36035.585ms
Sign ring: 38174.756ms
Signature 964723
true
Verify: 37611.042ms
Check double sign: 37604.330ms
true
```

Time and size scales linearly. 

* 100 ring size signature needs 0.8s to be signed and have a size of 19kBytes
* 1000 ring size signature needs 7s to be signed and have a size of 193kBytes
* 5000 ring size signature needs 38s to be signed and have a size of 964kBytes

-->


