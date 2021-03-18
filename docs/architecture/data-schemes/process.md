# Process Data Schemes

As stated before, governance processes span across the [Process Smart Contract](/architecture/smart-contracts/process), the [Vochain](/architecture/services/vochain) and distributed file storage, providing the human readable metadata. 

Along the different stages of a governance process, the following data schemes are used:

- [Process metadata](#process-metadata)
- [Vote Envelope](#vote-envelope)
- [Vote Package](#vote-package)
- [Results](#results)
<!-- - [Support multi-layer vote encryption](#support-multi-layer-vote-encryption) -->

## Process Metadata

The creation of this data structure is critical. Multiple checks should be in place to ensure that the data is coherent (well formatted, all relevant locales present, etc).

Since the Process Metadata defines the human readable information, it should not be confused with the [Process Parameters](/architecture/smart-contracts/process?id=contract-structs) in the Smart Contract, which define how the process should behave.

The metadata of a process is represented as follows:

```json
{
    "version": "1.1", // Protocol version
    "title": {
        "en": "Universal Basic Income",
        "ca": "Renda Bàsica Universal"
    },
    "description": {
        "en": "The description goes here",
        "ca": "La descripció va aquí"
    },
    "media": {
        "header": "<content uri>",
        "streamUri": "https://.../"
    },
    "questions": [
        {
            "title": {
                "en": "Should universal basic income become a human right?",
                "ca": "Estàs d'acord amb que la renda bàsica universal sigui un dret humà?"
            },
            "description": {
                "en": "The description goes here",
                "ca": "La descripció va aquí"
            },
            "choices": [
                {
                    "title": {
                        "en": "Yes",
                        "ca": "Sí"
                    },
                    "value": 0
                },
                {
                    "title": {
                        "en": "No",
                        "ca": "No"
                    },
                    "value": 1
                }
            ]
        }
    ],
    "results": {
        "aggregation": "index-weighted", // "index-weighted" | "discrete-counting",
        "display": "rating" // "rating" | "simple-question" | "multiple-choice" | "linear-weighted" | "quadratic-voting" | "multiple-question" | "raw"
    }
}
```

The `results` fields are informational only. Regardless of the chosen `aggregation` or `display`, the scrutiny is the same for all cases. However, these fields help the UI components to know how results should be interpreted and displayed. 

## Vote Envelope

The Vote Envelope contains a (possibly encrypted) Vote Package and provides the details to check that the incoming vote is valid. Some fields may be optional depending on the process `mode` and `envelopeType`.

##### When `envelopeType.ANONYMOUS` is enabled

This section will be available soon.

<!--
An anonymous Vote Envelope features the proces ID, the ZK Proof, a nonce to prevent replay attacks, the user's nullifier for the vote, the index of the encryption keys used and a base64 representation of the Vote Package.

```json
{
    "processId": "0x1234567890...",  // The process for which the vote is casted
    "proof": "0x1234...",  // ZK Proof
    "nonce": "1234567890",  // Unique number per vote attempt, so that replay attacks can't reuse this payload
    "nullifier": "0x1234...",   // Hash of the private key + processId
    "encryptionKeyIndexes": [0, 1, 2, 3, 4],  // (optional) On encrypted votes, contains the (sorted) indexes of the keys used to encrypt
    "votePackage": "base64-vote-package"  // base64(jsonString) or base64( encrypt(jsonString) )
}
```

The `nullifier` uniquely identifies the vote in the blockchain and it is computed as follows: 

`nullifier = keccak256(bytes(hex(addr(signature))) + bytes(hex(processId)))`

-->

##### When `envelopeType.ANONYMOUS` is disabled

A signed (non-anonymous) Vote Envelope features the process ID, the Census Merkle Proof of the user, a nonce to prevent replay attacks, the index of the encryption keys used, a Base64 representation of the Vote Package and the user's signature.

In order to guarantee a 100% reproduceability of the signature, the Vote Envelope is encoded as a Protobuf model and serialized into a byte array. Such byte array is then signed and both fields are sent via a `SignedTx` model to a Gateway. 

```proto
// Protobuf models

message VoteEnvelope {
        bytes nonce = 1;  // Unique number per vote attempt, so that replay attacks can't reuse this payload
        bytes processId = 2;  // The process for which the vote is casted
        Proof proof = 3;  // One of ProofGraviton, ProofIden3, ProofEthereumStorage, ProofEthereumAccount, or ProofCA
        bytes votePackage = 4;   // JSON string of the Vote Package, encoded as bytes. It may be encrypted.
        bytes nullifier = 5;  // Hash of the private key + processId (optional, depending on the type)

        repeated uint32 encryptionKeyIndexes = 6; // On encrypted votes, contains the (sorted) indexes of the keys used to encrypt
}

// ...

message Tx {
	oneof payload {
		VoteEnvelope vote = 1;
		// ...
	}
}

message SignedTx {
	bytes tx = 1; // The bytes produced by Marshaling a Tx{} message
	optional bytes signature = 2; // The signature for the tx bytes. 
	// signature is only required in those transactions that actually need signature.
        // I.e zk-Snarks based transactions won't needed, however the transaction should use
        // this message type in order to preserve consistency on the Vochain
}

```

## Vote Package

Contains the actual votes and is part of the Vote Envelope.

```json
{
    "nonce": "01234567890abcdef", // 8+ byte random string to prevent guessing the encrypted payload before the reveal key is released
    "votes": [  // Direclty mapped to the `questions` field of the metadata
        1, 3, 2
    ]
}
```

##### When `envelopeType.ENCRYPTED_VOTE` is disabled
- The `nonce` can be omitted.
- The package has to be serialized as a JSON string and encoded as bytes.

##### When `envelopeType.ENCRYPTED_VOTE` is enabled
- The `nonce` is mandatory.
- The package has to be serialized as a JSON string encoded as bytes.
- It must be encrypted with a subset of the public keys or all of them.
- The index of the public keys used to encrypt must be included in the Vote Envelope in the exact order they have been used.

## Results

Requests to the Results API will return an Array of number arrays, following the [Ballot Protocol](/architecture/data-schemes/ballot-protocol). They will contain a bidimensional array of integers, aggregating the values currently stored on the Vochain.

The interpretation of these values is left to the Client apps, and is determined by the `results.aggregation` and `results.display` fields of the Process Metadata, listed above.

Given diferent processes with various parameters, below is an example of the results that would be returned given the votes of 3 users.

<table><thead><tr><th>Name</th><th>Vote examples</th><th>Results</th><th>maxCount</th><th>maxValue</th><th>maxTotalCost</th><th>costExponent</th><th>uniqueValues</th></tr></thead><tbody><tr><td class="cell-title">Rate a product</td>
	<td class="cell-one">[3] [5] [3]</td>
<td class="cell-two">[ [0,0,2,0,1] ]</td>
<td class="cell-three">1</td>
<td class="cell-four">5</td>
<td class="cell-five">-</td>
<td class="cell-six">-</td>
<td class="cell-seven">false</td></tr>
<tr><td class="cell-title">Rate 3 candidates: A, B, C ⇒ 0, 1, 2</td>
	<td class="cell-one">[2,1,2] [0,1,2] [0,0,0]</td>
<td class="cell-two">[ [2,0,1], [1,2,0], [1,0,2] ]</td>
<td class="cell-three">3</td>
<td class="cell-four">2</td>
<td class="cell-five">-</td>
<td class="cell-six">-</td>
<td class="cell-seven">false</td></tr>
<tr><td class="cell-title">Single choice (1 out of 3)</td>
	<td class="cell-one">[0,1,0] [0,1,0] [1,0,1]
</td>
<td class="cell-two">[ [2,1], [1,2], [2,1] ]</td>
<td class="cell-three">3</td>
<td class="cell-four">1</td>
<td class="cell-five">1</td>
<td class="cell-six">-</td>
<td class="cell-seven">false</td></tr>
<tr><td class="cell-title">Multiple choice (3 out of 5)</td>
	<td class="cell-one">[1,1,1,0,0] [0,1,1,1,0] [1,1,0,0,0]</td>
<td class="cell-two">[ [1, 2], [0, 3], [1, 2], [2, 1], [3, 0] ] </td>
<td class="cell-three">5</td>
<td class="cell-four">1</td>
<td class="cell-five">3</td>
<td class="cell-six">-</td>
<td class="cell-seven">false</td></tr>
<tr><td class="cell-title">Weighted choice: Sort the 5 candidates</td>
	<td class="cell-one">[1,4,2,5,3] [4,1,2,5,3] [2,3,4,5,1]</td>
<td class="cell-two">[ [0,1,1,0,1,0], [0,1,0,1,1,0], [0,0,2,0,1,1], [0,1,0,2,0,0] ]</td>
<td class="cell-three">5</td>
<td class="cell-four">5</td>
<td class="cell-five">-</td>
<td class="cell-six">-</td>
<td class="cell-seven">true</td></tr>
<tr><td class="cell-title">Quadratic voting: 4 options, 9 credits to spend</td>
	<td class="cell-one">[2,2,1,0] [1,1,1,1] [0,3,0,0]</td>
<td class="cell-two">[ [1,1,1,0], [0,1,1,1], [1,2,0,0], [2,1,0,0] ]</td>
<td class="cell-three">4</td>
<td class="cell-four">-</td>
<td class="cell-five">9</td>
<td class="cell-six">2.0000</td>
<td class="cell-seven">false</td></tr>
<tr><td class="cell-title">Election: 3 positions (CEO, COO, CFO), 5 candidates</td>
	<td class="cell-one">[4,3,2] [4,2,3] [0,1,4]</td>
<td class="cell-two">[ [1,0,0,0,2], [0,1,1,1,0], [0,0,1,1,1] ]</td>
<td class="cell-three">3</td>
<td class="cell-four">4</td>
<td class="cell-five"></td>
<td class="cell-six"></td>
<td class="cell-seven">false</td></tr>
</tbody></table>

### Coming next

See the [Ballot Protocol](/architecture/data-schemes/ballot-protocol) section.
