# Blind Signatures

The current approach by Vocdoni regarding determining the eligibility of a potential voter is to use a Census Merkle Tree. All voter public keys must be known in advance and aggregated together into a hash tree to compute a Merkle root. Then each voter needs to fetch their own Merkle proof to demonstrate their eligibility on a public ledger. The Merkle proof can be anonymized using a zk-SNARK so that the public ledger will verify the SNARK proof instead.

This approach is nice since the same census Merkle Tree can be reused repeatedly and by anyone (not only the owner). It adds resiliency to the process since any third party can obtain the tree (there is no private information involved; thus, it can be published into IPFS) to help the potential voters fetch their proofs. Finally, it is reproducible since anyone with the same list of keys could build the same root hash and verify the Tree generation was correctly executed.

However, this approach lacks flexibility since it is a static way to create a voter list (adding or deleting a public key requires rebuilding and publishing the census again). The current Vocdoni protocol implements an `updateCensus` mechanism, but this is not very convenient for use cases that require constant census modifications (each update requires an Ethereum transaction).

In order to support such scenarios and bring more flexibility to the Vocdoni stack, a new approach is proposed based on Credential Service Providers (CSP). A voter will need to show a proof provided by the election CSP for proving its eligibility which is made up of the CSP's signature to the voter's public key.

For preserving the anonymity of the voter, the CSP server will perform a blind signature. Blind signatures were first suggested by David Chaum: a cryptographic scheme that allows for signatures over disguised (blinded) messages. The blinder (voter in our scenario) can then un-blind the signature and use it as a normal/standard one. This protocol was designed for RSA, but we will use it over EC secp256k1 (Ethereum and Vocdoni standard).

## Salted CSP keys

For making the CSP voter approval valid only for a specific election process (processId) and attached to a specific weight while preserving the privacy, a deterministic key derivation is used. So the CSP is only required to publish a single root public key. The specific per-election keys will be computed independently by all parties (CSP will derive its election private key and the election organizers will derive the election public key). To this end we use the following simple approach (G is the EC generator point):

$$PubKeyRoot = PrivKeyRoot * G\\
PrivKey2 = PrivkeyRoot + ProcessId + Weight\\
PubKey2 = PubKeyRoot + (ProcessId + Weight)*G$$

So if PubKey2 becomes the election CSP public key, there is no way the CSP can share signature proofs before the processId is known and there is no way to reuse a CSP signature for a different election process.

## Flow diagram

<div style="padding: 20px;">
	<img src="https://kroki.io/mermaid/svg/eNp9U01PwzAMvfMrfAOEGAJuE0zi44KQJgQSF8TBS9w2aklGkm7avyd2OzWs23pp6z6_vPfsBvptySp6Nlh6_DmBdC3RR6PMEm2ETxfJj6pPH2-j2mPjVK0qNFY-SePlbDaUp1BShKV3ikJ40UdR6QDwziV4u2iMgpo2__ByZ6glj5HA0hpWLhpbjqCJagrYxops0orROAuF8ztCEmqLVRWpeqdDMPPECN6UVQRXgGBZpyZlNAW4W_irGaQuqI3VDNnD0Z3Ty4-uJvsOmNBrYt59HhetaTSbI1BhmV6tbiglr2osadDVUCGy-q4vVtZhv0XY9UQ4_JzWD1r75FzKN5MhCCncTo5padjZQA1t4Mg7H-PUBU76sgezzwyaRb4ib4rNNg8TYIWNGQ0mYJNtxnbOe6aStuGVNnAvQH66GEym58xfzm5Ku6t4bWLVs42nx3JI95lwN8bWE4vouvcF2NpduFwH_wWFIcpKyfzPurg5gp6IcioMbNMV54dykVQxOh_6JWfmbm2ZszeUWUlzydZa9uc0AHb7k-_tH9ykZ4Y=" alt="flow_diagram_csp"/>
</div>

## Known Problems

- Time correlation, the CSP might know which voter is actually casting a vote.
*Could be solved using a delay mixnet (such as Nymtech)*


## Links

1. H. Mala, N. Nezhadansari, *"New Blind Signature Schemes Based on the (Elliptic Curve) Discrete Logarithm Problem"* [https://sci-hub.st/10.1109/iccke.2013.6682844](https://sci-hub.st/10.1109/iccke.2013.6682844) Implementation: [https://github.com/arnaucube/go-blindsecp256k1](https://github.com/arnaucube/go-blindsecp256k1)
2. *EC deterministic derivation key schema PoC implementation*
[https://github.com/p4u/go-eckey-derivation](https://github.com/p4u/go-eckey-derivation/blob/master/main.go)