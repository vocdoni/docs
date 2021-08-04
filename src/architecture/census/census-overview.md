# The Census

In Vocdoni, a census of identities can be represented in one of three ways. For Ethereum-based processes, in which eligible voters are represented by Ethereum addresses holding a specific token, an [on-chain](on-chain.md) (ERC-20) census is used. In cases where a central authority wants to manually validate each voter at the time of voting, [off-chain credential service provider](off-chain-csp.md) is used. For all other voting processes (organizations that are not represented as DAOs), an [off-chain tree](off-chain.md) census is used. 

:::tip
Between the three of these census methods, an incredible range of use-cases and third-party integrations for voter eligibility management is possible. Furthermore, the flexibility of the voting protocol is designed to allow more census types to be easily added in the future.
:::

When a voting process is created, the [Census Origin](/architecture/smart-contracts/process.html#census-origin) is set to signify which type of census the process should expect to use. 

## On-Chain Based Census (Ethereum ERC-20)

On-chain census allow the set of eligible voters to be expressed as a weighted census of holders of a specific token on Ethereum. There is only one entity per Ethereum token, where the address of that entity is the contract address of the given token. 

To this end, [Ethereum Storage Proofs](../smart-contracts/storage-proofs.md) are used. 

Anyone can permissionlessly register a token to the Storage Proof Smart Contract, incurring some gas cost. Then any holder of the token can create a voting process for that token and set the proper [census origin](/architecture/smart-contracts/process.html) value to signal the use of an on-chain census. The Census Merkle Root is the Ethereum Root Hash at a given block height, and any user can request a Merkle Proof that their address holds tokens on the target ERC20 smart contract. They can then provide this proof to vote on processes for the entity representing that token address. Weighted processes enable users to employ a voting power that is proportionate to the number of tokens they hold.

Technical details for on-chain census can be found at [On-Chain Census](on-chain.md).

## Off-Chain CSP Based Census (Credential Service Provider)

In order to support frequent modifications to the census of an ongoing process and to bring more flexibility to the Vocdoni stack, a census based on Credential Service Providers (CSP) or Certificate Authorities (CAs) is implemented. This method allows organizations to set up a centralized authority that provides credentials to each voter, one-by-one, based on any arbitrary criteria decided by the organization. 

Technical details for off-chain CSP census can be found at [Off-Chain CSP Census](off-chain-csp.md).

## Off-Chain Tree Based Census (Merkle Tree)

An off-chain tree census allows organizations to centrally manage the set of members who can vote on any given process. Organizations can generate the Census Merkle Tree itself with the help of the [Census Service](../services/census-service.md), but they are responsible for manually generating a list of voters. [Vocdoni.app](https://vocdoni.app) currently provides a CSV-based census mechanism.

Technical details for off-chain tree census can be found at [Off-Chain Tree Census](off-chain-tree.md).

:::tip
Details for integrating census mechanisms are documented [here](../../integration/census/general.md).
:::