# Off-chain Census

Off-chain census allow organizations to manage their voting body with varying levels of privacy and user interaction. Off-chain is the best solution for traditional organizations in the non-crypto space. The simplest method is CSV census, which is used by [Vocdoni.app](https://vocdoni.app/), and allows entities to manage their user base on a single private spreadsheet. At the other end of complexity is a registry database solution which is managed by the hosting organization and requires users to pre-register before a voting process. 

Off-chain census require the compilation of a [Census Merkle Tree](../../architecture/census-tree.md) containing public keys of all eligible voters. Assistance in creating this Merkle Tree and generating proofs is provided by the [Census Service](../../architecture/services/census-service.md)

+ [CSV](csv.md)
+ [registry database](registry.md)