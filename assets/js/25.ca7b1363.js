(window.webpackJsonp=window.webpackJsonp||[]).push([[25],{391:function(e,t,a){"use strict";a.r(t);var r=a(24),s=Object(r.a)({},(function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[a("h1",{attrs:{id:"blind-signatures"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#blind-signatures"}},[e._v("#")]),e._v(" Blind Signatures")]),e._v(" "),a("p",[e._v("The current approach by Vocdoni regarding determining the eligibility of a potential voter is to use a Census Merkle Tree. All voter public keys must be known in advance and aggregated together into a hash tree to compute a Merkle root. Then each voter needs to fetch their own Merkle proof to demonstrate their eligibility on a public ledger. The Merkle proof can be anonymized using a zk-SNARK so that the public ledger will verify the SNARK proof instead.")]),e._v(" "),a("p",[e._v("This approach is nice since the same census Merkle Tree can be reused repeatedly and by anyone (not only the owner). It adds resiliency to the process since any third party can obtain the tree (there is no private information involved; thus, it can be published into IPFS) to help the potential voters fetch their proofs. Finally, it is reproducible since anyone with the same list of keys could build the same root hash and verify the Tree generation was correctly executed.")]),e._v(" "),a("p",[e._v("However, this approach lacks flexibility since it is a static way to create a voter list (adding or deleting a public key requires rebuilding and publishing the census again). The current Vocdoni protocol implements an "),a("code",[e._v("updateCensus")]),e._v(" mechanism, but this is not very convenient for use cases that require constant census modifications (each update requires an Ethereum transaction).")]),e._v(" "),a("p",[e._v("In order to support such scenarios and bring more flexibility to the Vocdoni stack, a new approach is proposed based on Credential Service Providers (CSP). A voter will need to show a proof provided by the election CSP for proving its eligibility which is made up of the CSP's signature to the voter's public key.")]),e._v(" "),a("p",[e._v("For preserving the anonymity of the voter, the CSP server will perform a blind signature. Blind signatures were first suggested by David Chaum: a cryptographic scheme that allows for signatures over disguised (blinded) messages. The blinder (voter in our scenario) can then un-blind the signature and use it as a normal/standard one. This protocol was designed for RSA, but we will use it over EC secp256k1 (Ethereum and Vocdoni standard).")]),e._v(" "),a("h2",{attrs:{id:"salted-csp-keys"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#salted-csp-keys"}},[e._v("#")]),e._v(" Salted CSP keys")]),e._v(" "),a("p",[e._v("For making the CSP voter approval valid only for a specific election process (processId) and attached to a specific weight while preserving the privacy, a deterministic key derivation is used. So the CSP is only required to publish a single root public key. The specific per-election keys will be computed independently by all parties (CSP will derive its election private key and the election organizers will derive the election public key). To this end we use the following simple approach (G is the EC generator point):")]),e._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[e._v("PubKeyRoot "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" PrivKeyRoot "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("*")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[e._v("G")]),e._v("\nPrivKey2   "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" PrivkeyRoot "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("+")]),e._v("  ProcessId "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("+")]),e._v(" Weight\nPubKey2    "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" PubKeyRoot  "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("+")]),e._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("ProcessId "),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("+")]),e._v(" Weight"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),a("span",{pre:!0,attrs:{class:"token operator"}},[e._v("*")]),a("span",{pre:!0,attrs:{class:"token constant"}},[e._v("G")]),e._v("\n")])])]),a("p",[e._v("So if PubKey2 becomes the election CSP public key, there is no way the CSP can share signature proofs before the processId is known and there is no way to reuse a CSP signature for a different election process.")]),e._v(" "),a("h2",{attrs:{id:"flow-diagram"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#flow-diagram"}},[e._v("#")]),e._v(" Flow diagram")]),e._v(" "),a("div",{staticStyle:{padding:"20px"}},[a("img",{attrs:{src:"https://kroki.io/mermaid/svg/eNp9U01PwzAMvfMrfAOEGAJuE0zi44KQJgQSF8TBS9w2aklGkm7avyd2OzWs23pp6z6_vPfsBvptySp6Nlh6_DmBdC3RR6PMEm2ETxfJj6pPH2-j2mPjVK0qNFY-SePlbDaUp1BShKV3ikJ40UdR6QDwziV4u2iMgpo2__ByZ6glj5HA0hpWLhpbjqCJagrYxops0orROAuF8ztCEmqLVRWpeqdDMPPECN6UVQRXgGBZpyZlNAW4W_irGaQuqI3VDNnD0Z3Ty4-uJvsOmNBrYt59HhetaTSbI1BhmV6tbiglr2osadDVUCGy-q4vVtZhv0XY9UQ4_JzWD1r75FzKN5MhCCncTo5padjZQA1t4Mg7H-PUBU76sgezzwyaRb4ib4rNNg8TYIWNGQ0mYJNtxnbOe6aStuGVNnAvQH66GEym58xfzm5Ku6t4bWLVs42nx3JI95lwN8bWE4vouvcF2NpduFwH_wWFIcpKyfzPurg5gp6IcioMbNMV54dykVQxOh_6JWfmbm2ZszeUWUlzydZa9uc0AHb7k-_tH9ykZ4Y=",alt:"flow_diagram_csp"}})]),e._v(" "),a("h2",{attrs:{id:"known-problems"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#known-problems"}},[e._v("#")]),e._v(" Known Problems")]),e._v(" "),a("ul",[a("li",[e._v("Time correlation, the CSP might know which voter is actually casting a vote.\n"),a("em",[e._v("Could be solved using a delay mixnet (such as Nymtech)")])])]),e._v(" "),a("h2",{attrs:{id:"links"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#links"}},[e._v("#")]),e._v(" Links")]),e._v(" "),a("ol",[a("li",[e._v("H. Mala, N. Nezhadansari, "),a("em",[e._v('"New Blind Signature Schemes Based on the (Elliptic Curve) Discrete Logarithm Problem"')]),e._v(" "),a("a",{attrs:{href:"https://sci-hub.st/10.1109/iccke.2013.6682844",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://sci-hub.st/10.1109/iccke.2013.6682844"),a("OutboundLink")],1),e._v(" Implementation: "),a("a",{attrs:{href:"https://github.com/arnaucube/go-blindsecp256k1",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://github.com/arnaucube/go-blindsecp256k1"),a("OutboundLink")],1)]),e._v(" "),a("li",[a("em",[e._v("EC deterministic derivation key schema PoC implementation")]),e._v(" "),a("a",{attrs:{href:"https://github.com/p4u/go-eckey-derivation/blob/master/main.go",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://github.com/p4u/go-eckey-derivation"),a("OutboundLink")],1)]),e._v(" "),a("li",[e._v("CSP server implementation https://github.com/vocdoni/blind-csp")])])])}),[],!1,null,null,null);t.default=s.exports}}]);