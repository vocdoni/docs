# Voting as a Service

The following section is an excerp of the article published on the [Vocdoni Blog](https://blog.vocdoni.io/), called [Introducing Voting as a Service](https://blog.vocdoni.io/introducing-voting-as-a-service/).

---

Conducting secure voting processes is far from simple, and today we are only focusing on the first steps. Vocdoni is conceived as a set of decentralized components which can operate as a whole.

- The Ethereum blockchain to declare organizations and their voting processes (Layer 1).
- Decentralized metadata retrieved via IPFS.
- The purpose-specific voting blockchain, where votes are validated and registered (Layer 2)
- The public gateways, providing easy access to the decentralized components above.
- The census registry (the user database to generate the census).

Every single one of these components can be replaced by your own instances without any kind of vendor lock-in.

If your organization already has an existing user database, Vocdoni's Governance as a Service is the best fit.

## How it works
### Before the process
In Vocdoni, identities arise from cryptographic key pairs (ECDSA). When people are added to a database, their [public key](https://en.wikipedia.org/wiki/Public-key_cryptography) is registered.

To create a voting process, the first step is to generate a snapshot of the census. The census consists of a [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree) with the [public keys](https://en.wikipedia.org/wiki/Public-key_cryptography) of everyone who is eligible to vote. No personal data is involved.

The census snapshot is then uploaded and pinned to a decentralized storage like [IPFS](https://ipfs.io), which ensures that everyone will be able to check it out.

Then the voting process details are declared on the [Ethereum](https://ethereum.org/en/developers/) [smart contract](https://en.wikipedia.org/wiki/Smart_contract), so that anyone with internet access can fetch them, get the metadata, get the location of the census, etc.

### During the process
Using their private key and a [decentralized Gateway](https://docs.vocdoni.io/#/architecture/components/gateway), eligible voters can fetch a Merkle proof to prove that their key pair belongs to the census [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree). They sign their vote envelope with the key above and submit it using whatever [Gateway](https://github.com/vocdoni/go-dvote#dvotenode) they like. Even their own.

Votes are relayed to the custom voting blockchain, validated and included in the next block.

As the process goes on, anyone with network access can listen for vote transactions, verify them by themselves or even use the [block explorer](https://explorer.vocdoni.net) to do it manually.

### After the process
When the vote is over, the oracle will trigger a process end transaction. At this point, the process will stop accepting valid votes and Gateways will be able to compute the scrutiny of the process. Even your own gateways can. 

Optionally, an oracle can read the final results and publish them on the smart contract where the process was created, so that results are notarized on the Ethereum blockchain.

Since the process operates on an L2 sidechain, users don't even need to know about [metamask](https://metamask.io/), exchanges or [gas fees](https://etherscan.io/gastracker). All they do is open an app or a web site and use their keys (under the hood) to sign and submit a vote envelope. The governance infrastructure does the rest.

## Get started
Enough talk, let's see how you can create an entity and publish your first voting process.


### Entity creation
Make sure you have [Node.js](https://nodejs.org) 12 installed on your computer.

In an empty folder, create a `package.json` file by running

```json
$ npm init -y
Wrote to /home/user/dev/governance-as-a-service/package.json:

{
  "name": "governance-as-a-service",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Next, install the DVoteJS dependency and two dev dependencies to support TypeScript:
```
$ npm i dvote-js
$ npm i -D typescript ts-node
```

Edit the `scripts` section of `package.json` and leave it like this:
```json
  "scripts": {
    "main": "ts-node index.ts"
  },
```


Then, let's create a file named `index.ts` and create a function to generate the wallet of our new entity:

```javascript
import { Wallet } from "ethers"

function makeEntityWallet() {
    console.log("Creating entity wallet")
    const entityWallet = Wallet.createRandom()

    console.log("Entity address:", entityWallet.address)
    console.log("Entity private key:", entityWallet.privateKey)
}

makeEntityWallet()

```

To check that it works, let's run `npm run main`:

```
$ npm run main
Creating entity wallet
Entity address: 0x1048d8cB20fE806389802ba48E2647dc85aB779a
Entity private key: 0x6d88d78a4a76e42144b6867fdff89477f0a3b805d85b97cd46387a2f770f91f1
```

So here's our wallet, what's next?

In this example, we will be using an Ethereum testnet called Sokol. Write down your private key and and use the address to request some test coins from [the faucet](https://faucet-sokol.herokuapp.com/). You will need them to send some transactions.

![Sokol Faucet](https://blog.vocdoni.io/content/images/2020/09/poafaucet.png "Sokol faucet")

Now, instead of creating a random wallet, we should use the one that received the test ether. In the lines above, replace this:

```javascript
const entityWallet = Wallet.createRandom()
```

Into this:

```javascript
// Use your private key here
const entityWallet = new Wallet("0x6d88d78a4a76e42144b6867fdff89477f0a3b805d85b97cd46387a2f770f91f1")
```

Obviously, make sure to store any real private key nowhere within the source code or Git in general.

Now we need to get a pool of gateways and connect to one of them:

```javascript
import { GatewayPool } from "dvote-js/dist/net/gateway-pool"

let pool: GatewayPool

async function connect() {
    // Get a pool of gateways to connect to the network
    pool = await GatewayPool.discover({ networkId: NETWORK_ID, bootnodesContentUri: GATEWAY_BOOTNODE_URI })
    await pool.connect()
}

const disconnect = () => pool.disconnect()
```

Then, let's define the metadata of our Entity and make it available on IPFS and Ethereum. Add the following code to `index.ts`:

```javascript
import { EntityMetadata } from "dvote-js"
import { updateEntity } from "dvote-js/dist/api/entity"

async function registerEntity() {
    // Make a copy of the metadata template and customize it
    const entityMetadata: EntityMetadata = Object.assign({}, Models.Entity.EntityMetadataTemplate)

    entityMetadata.name.default = "Vilafourier"
    entityMetadata.description.default = "Official communication and participation channel of the city council"
    entityMetadata.media = {
        avatar: 'https://my-organization.org/logo.png',
        header: 'https://my-organization.org/header.jpeg'
    }
    entityMetadata.actions = []

    const contentUri = await updateEntity(entityWallet.address, entityMetadata, entityWallet, pool)

    // Show stored values
    console.log("The entity has been defined")
    console.log(contentUri)
}
```

And then:

```
$ npm run main
Setting the entity metadata
WARNING: Multiple definitions for addr
WARNING: Multiple definitions for setAddr
The entity has been defined
ipfs://QmdK5TnHDXPt4xozkuboyKP94RTrUxFr1z9Pkv5qhfahFG
```

Done! 

This is what we just did:

- We created JSON metadata containing the custom details of our entity
- We pinned the JSON content on IPFS using a gateway from the pool
- The hash of our metadata is `QmdK5TnHDXPt4xozkuboyKP94RTrUxFr1z9Pkv5qhfahFG` and should be available [from any IPFS peer](https://ipfs.io/ipfs/QmdK5TnHDXPt4xozkuboyKP94RTrUxFr1z9Pkv5qhfahFG)
- An Ethereum transaction was sent to the entities contract, defining the pointer to our new metadata.

The value on the smart contract can only be updated by our wallet, the blockchain ensures the integrity of our data and IPFS ensures its global availability.

#### Visualizer
To check that our entity is properly declared, we can check it on the visualizer: `https://app.dev.vocdoni.net/entities/#/<entity-id>`

This is the link [in our case](https://app.dev.vocdoni.net/entities/#/0xdeea56f124dd3e73bcbc210fc382154a11f3bab227af55927139c887e15573e4).

> Note: Keep in mind that we're using a testnet and some of the data might be eventually disposed.

### Census generation
Our entity is ready, now it can handle voting processes. But before we can create one, we need a census of the people who can vote.

As we said, digital identities arise from a cryptographic keypair. The ideal scenario is when the identity is generated on the user's device and only the public key is shared, but for the sake of simplicity, we will create a few identities ourselves.

```javascript
let votersPublicKeys: string[] = []

function populateCensusPublicKeys() {
    for (let i = 0; i < 10; i++) {
        const wallet = Wallet.createRandom()
        votersPublicKeys.push(wallet["signingKey"].publicKey)
    }
    console.log("Voter's public keys", votersPublicKeys)
}
```

Which results in

```
Voter's public keys [
 '0x046f5ae433845ddc5d93a44b4aa3b9f654861372ada5f074b88bd18623dcbac5e4c3495f2f4f96e9053ce89f8befd3ad5424224948b84ba5a9292ef3f594003c46',
 '0x0460aaecd59d68dc63aa173f77d89476280d77b67c5793c5f166ff951eb4d761df8d57eab31e8064180027386ead992b74bd097461e0a44e80b371650f4c09370b',
  ...
]
```

Then we can upload the census claims to a gateway and publish it:

```javascript
import { addCensus, addClaimBulk, getRoot, publishCensus } from "dvote-js/dist/api/census"

let merkleTreeOrigin: string
let merkleRoot: string

async function publishVoteCensus() {
    // Prepare the census parameters
    const censusName = "Vilafourier all members #" + Math.random().toString().substr(2, 6)
    const adminPublicKeys = [await entityWallet["signingKey"].publicKey]
    const publicKeyClaims = votersPublicKeys.map(k => digestHexClaim(k)) // hash the keys

    // As the census does not exist yet, we create it (optional when it exists)
    let { censusId } = await addCensus(censusName, adminPublicKeys, pool, entityWallet)
    console.log(`Census added: "${censusName}" with ID ${censusId}`)

    // Add claims to the new census
    let result = await addClaimBulk(censusId, publicKeyClaims, true, pool, entityWallet)
    console.log("Added", votersPublicKeys.length, "claims to", censusId)
    if (result.invalidClaims.length > 0) console.error("Invalid claims", result.invalidClaims)

    merkleRoot = await getRoot(censusId, pool)
    console.log("Census Merkle Root", merkleRoot)

    // Make it available publicly
    merkleTreeOrigin = await publishCensus(censusId, pool, entityWallet)
    console.log("Census published on", merkleTreeOrigin)
}
```

Which results in:

```
Census added: "Vilafourier all members #550262" with ID 0x1048d8cB20fE806389802ba48E2647dc85aB779a/0x8e0c00cda17a132e2ce6c89072cc2037b0800c280c1ddba318eb2620fae2ff16
Added 10 claims to 0x1048d8cB20fE806389802ba48E2647dc85aB779a/0x8e0c00cda17a132e2ce6c89072cc2037b0800c280c1ddba318eb2620fae2ff16
Census Merkle Root 0xbf8572159929b4e37c40e2ce18fd46156e750a4aac1f06dbda3237edccc81115
Census published on ipfs://QmcTuUJbN1tEWA3nqHFU8N8iuUN2ymJoqW4UcKBzHuYrPw
```

Cool! Our entity is ready, and our first census is now public.

### Process creation
Now we are ready to create our fist process. To do so, we will use the values we generated previously and define the topic, the questions, the vote options, etc.

```javascript
import { getEntityId } from "dvote-js/dist/api/entity"
import { estimateBlockAtDateTime, createVotingProcess, getVoteMetadata } from "dvote-js/dist/api/vote"

async function createVotingProcess() {
    const myEntityAddress = await entityWallet.getAddress()
    const myEntityId = getEntityId(myEntityAddress)

    const startBlock = await estimateBlockAtDateTime(new Date(Date.now() + 1000 * 60 * 5), pool)
    const numberOfBlocks = 6 * 60 * 24 // 1 day (10s block time)

    const processMetadata: ProcessMetadata = {
        "version": "1.0",
        "type": "poll-vote",
        "startBlock": startBlock,
        "numberOfBlocks": numberOfBlocks,
        "census": {
            "merkleRoot": merkleRoot,
            "merkleTree": merkleTreeOrigin
        },
        "details": {
            "entityId": myEntityId,
            "title": { "default": "Vilafourier public poll" },
            "description": {
                "default": "This is our test poll using a decentralized blockchain to register votes"
            },
            "headerImage": "https://images.unsplash.com/photo-1600190184658-4c4b088ec92c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
            "streamUrl": "",
            "questions": [
                {
                    "type": "single-choice",
                    "question": { "default": "CEO" },
                    "description": { "default": "Chief Executive Officer" },
                    "voteOptions": [
                        { "title": { "default": "Yellow candidate" }, "value": 0 },
                        { "title": { "default": "Pink candidate" }, "value": 1 },
                        { "title": { "default": "Abstention" }, "value": 2 },
                        { "title": { "default": "White vote" }, "value": 3 }
                    ]
                },
                {
                    "type": "single-choice",
                    "question": { "default": "CFO" },
                    "description": { "default": "Chief Financial Officer" },
                    "voteOptions": [
                        { "title": { "default": "Yellow candidate" }, "value": 0 },
                        { "title": { "default": "Pink candidate" }, "value": 1 },
                        { "title": { "default": "Abstention" }, "value": 2 },
                        { "title": { "default": "White vote" }, "value": 3 }
                    ]
                },
            ]
        }
    }
    const processId = await createVotingProcess(processMetadata, entityWallet, pool)
    console.log("Process created:", processId)

    // Reading the process metadata back
    const metadata = await getVoteMetadata(processId, pool)
    console.log("The metadata is", metadata)
}
```

Which looks like this:

```
Process created: 0x82f42dc48bfbfa0bb1018bcb0f3a31f77d12ced1fda9566990d64d07be9a48a6
The metadata is {
  version: '1.0',
  type: 'poll-vote',
  startBlock: 2203,
  numberOfBlocks: 8640,
  census: {
    merkleRoot: '0x2044a23e328d75276a7e9e6bc1774eb67707597beba1cfdfde5e7fa174197101',
    merkleTree: 'ipfs://QmTFGgoDnMWhMU3BXxm4zTxeFZLPnRV1jiQgBqukzJPmo9'
  },
  details: {
    entityId: '0xdeea56f124dd3e73bcbc210fc382154a11f3bab227af55927139c887e15573e4',
    title: { default: 'Vilafourier public poll' },
    description: {
      default: 'This is our test poll using a decentralized blockchain to register votes'
    },
    headerImage: 'https://images.unsplash.com/photo-1600190184658-4c4b088ec92c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
    streamUrl: '',
    questions: [ [Object], [Object] ]
  }
}
```

So, we just...

- Defined the metadata of our process
- Defined the  block at which we would like the process to start
- Declare the metadata of the process

As it happened before, the JSON metadata is pinned on IPFS and pointed to from the process smart contract. In addition, some metadata fields are also stored on the smart contract so they can be accessed on-chain. 

> The contract flags define **how** the process will behave, whereas the metadata is used to store the **human readable** content.

In about 2-3 minutes, the Ethereum transaction will be relayed to the voting blockchain as well. When the block number reaches `startBlock`, the process will become open to those who are part of the census. The `startBlock` value should be **at least 25 blocks ahead** of the current value.

#### Visualizer
To check the new process, there are two web sites we can use:
- `https://app.dev.vocdoni.net/processes/#/<entity-id>/<process-id>`
- `https://explorer.dev.vocdoni.net/process/<process-id>`

In our case:
- `https://app.dev.vocdoni.net/processes/#/0xdeea56f124dd3e73bcbc210fc382154a11f3bab227af55927139c887e15573e4/0x82f42dc48bfbfa0bb1018bcb0f3a31f77d12ced1fda9566990d64d07be9a48a6`
- `https://explorer.dev.vocdoni.net/process/0x82f42dc48bfbfa0bb1018bcb0f3a31f77d12ced1fda9566990d64d07be9a48a6`

Again, this is a testnet and some of this data may have been cleaned up at some point.

### Voting
The previous code typically runs on the backend of your organization -you will simply choose to generate a census based on your specific organization's parameters.

This next portion, however, is meant to be executed on the voter's device. The specific method used to create and manage user keys is an important decision which  presents a trade off between usability and security.

- Users create the keys on their end
	- This allows for a self sovereign identity and provides higher privacy
	- However, users have to register the public key on your backend and you need to validate it
- The organization creates one-time keys
	- The keys are not in the user's control
	- They don't need to register
	- They can simply receive a link and use it to vote, and then the key expires

Whatever your case is, we will illustrate a web browser environment where the voter fetches the process metadata, signs his/her choices and submits them to a gateway.

```javascript
import { Wallet } from "ethers"
import {
    getVoteMetadata,
    estimateDateAtBlock,
    getBlockHeight,
    getEnvelopeHeight,
    packagePollEnvelope,
    submitEnvelope
} from "dvote-js/dist/api/vote"
import { getCensusSize, digestHexClaim, generateProof } from "dvote-js/dist/api/census"
import { waitUntilVochainBlock } from "dvote-js/dist/util/waiters"

async function submitSingleVote() {
    // Get the user private key from the appropriate place
    const wallet = new Wallet("voter-privkey")  // TODO: Adapt to your case

    // Fetch the metadata
    const processMeta = await getVoteMetadata(processId, pool)

    console.log("- Starting:", await estimateDateAtBlock(processMeta.startBlock, pool))
    console.log("- Ending:", await estimateDateAtBlock(processMeta.startBlock + processMeta.numberOfBlocks, pool))
    console.log("- Census size:", await getCensusSize(processMeta.census.merkleRoot, pool))
    console.log("- Current block:", await getBlockHeight(pool))
    console.log("- Current votes:", await getEnvelopeHeight(processId, pool))

    await waitUntilVochainBlock(processMeta.startBlock, pool, { verbose: true })

    console.log("Submitting vote envelopes")

    // Hash the voter's public key
    const publicKeyHash = digestHexClaim(wallet["signingKey"].publicKey)

    // Generate the census proof
    const merkleProof = await generateProof(processMeta.census.merkleRoot, publicKeyHash, true, pool)

    // Sign the vote envelope with our choices
    const choices = [1, 2]
    const voteEnvelope = await packagePollEnvelope({ votes: choices, merkleProof, processId, walletOrSigner: wallet })

    // If the process had encrypted votes:
    // const voteEnvelope = await packagePollEnvelope({ votes, merkleProof, processId, walletOrSigner: wallet, encryptionPubKeys: ["..."] })

    await submitEnvelope(voteEnvelope, pool)
    console.log("Envelope submitted")
}
```

That's quite a lot so far!

To check for the status of a vote, you can append these extra calls at the end:

```javascript
import { getPollNullifier, getEnvelopeStatus } from "dvote-js/dist/api/vote"

{
    // ...

    // wait 10+ seconds
    await new Promise(resolve => setTimeout(resolve, 1000 * 10))

    // Compute our deterministic nullifier to check the status of our vote
    const nullifier = await getPollNullifier(wallet.address, processId)
    const status = await getEnvelopeStatus(processId, nullifier, pool)

    console.log("- Registered: ", status.registered)
    console.log("- Block: ", status.block)
    console.log("- Date: ", status.date)
}
```

The output:

```
- Starting: 2020-09-17T15:50:44.000Z
- Ending: 2020-09-18T15:50:44.000Z
- Census size: 10
- Current block: 5
- Current votes: 0
Waiting for Vochain block 35
Now at Vochain block 6
Now at Vochain block 7
[...]
Now at Vochain block 35`

Submitting vote envelopes
Envelope submitted

- Registered:  true
- Block:  36
- Date:  2020-09-17T15:51:06.000Z
```

This is what we just did:

- Initialize the wallet with the voter's private key
- Fetch the vote metadata
- Wait until `startBlock`
- Request a census merkle proof to a random Gateway, proving that the voter's public key matches the census Merkle root
- Package our choices into an envelope signed with the voter private key (and optionally encrypt it)
- Submit the envelope using a random Gateway
- Retrieve the status of the vote

### Process results
If we look at the visualizer or the block explorer we should see votes already submitted.

If the process type was set to `encrypted-poll` then, results would remain unavailable until the process ends. As our process is an open poll, however, we can ask for the results in real time:

```javascript
import { getResultsDigest } from "dvote-js/dist/api/vote"

async function fetchResults() {
    const { questions } = await getResultsDigest(processId, pool)

    console.log("Process results", questions)
}
```

After all users have voted, the visualizer shows:

![Process results](https://blog.vocdoni.io/content/images/2020/09/vocdoni_vote_count.png "Process results")

However, if you can't wait for an encrypted process to end later or you simply want to stop vote submissions, there's a trick you can use. This will change in the near future, but for now you can `cancel` the rest of the lifespan of a process, if needed. The scrutiny will begin a few seconds later.

```javascript
import { isCanceled, cancelProcess } from "dvote-js/dist/api/vote"

async function forceEndingProcess() {
    // Already canceled?
    const canceled = await isCanceled(processId, pool)
    if (canceled) return console.log("Process already canceled")

    // Already ended?
    const processMeta = await getVoteMetadata(processId, pool)
    const currentBlock = await getBlockHeight(pool)
    if (currentBlock >= (processMeta.startBlock + processMeta.numberOfBlocks)) return console.log("Process already ended")

    console.log("Canceling process", processId)
    await cancelProcess(processId, entityWallet, pool)
    console.log("Done")
}
```

Congratulations! You just conducted an election!

A recap of the the examples featured on the article are available on this repository:

[https://github.com/vocdoni/tutorials/tree/master/voting-as-a-service](https://github.com/vocdoni/tutorials/tree/master/voting-as-a-service)
