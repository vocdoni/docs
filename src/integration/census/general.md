# Census Integration

The Voting Protocol requires a [Census](../../architecture/census/census-overview.md) to be created and published before an organization can host a voting process. The voting protocol itself accepts three main census integration methods:
+ [on-chain](on-chain.md) 
+ [off-chain credential service provider](off-chain-csp.md) 
+ [off-chain Merkle tree](off-chain-tree.md)

Between the three of these census methods, an incredible range of use-cases and third-party integrations for voter eligibility management is possible. Furthermore, the flexibility of the voting protocol is designed to allow more census types to be easily added in the future.

When creating a voting process, the [Census Origin](../../architecture/smart-contracts/process.md#census-origin) must be set to signify which type of census the process will use. 
