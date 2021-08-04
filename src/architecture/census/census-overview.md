# The Census

In Vocdoni, a census of identities can be represented in one of two ways. For Ethereum-based processes, in which eligible voters are represented by Ethereum addresses holding a specific token, an [on-chain](on-chain.md) (ERC-20) census is used. For all other voting processes (organizations that are not represented as DAOs), an [off-chain](off-chain.md) census is used. For those integrating the Vocdoni protocol into third-party clients or using the API, census integration is documented [here](../../integration/census/general.md). 

When a voting process is created, the [Census Origin](/architecture/smart-contracts/process.html#census-origin) is set to signify which type of census the process should expect to use. 

## On-Chain Based Census (Ethereum ERC-20)

On-chain census allow the set of eligible voters to be expressed as a weighted census of holders of a specific token on Ethereum. There is only one entity per Ethereum token, where the address of that entity is the contract address of the given token. 

To this end, [Ethereum Storage Proofs](../smart-contracts/storage-proofs.md) are used. 

Anyone can permissionlessly register a token to the Storage Proof Smart Contract, incurring some gas cost. Then any holder of the token can create a voting process for that token and set the proper [census origin](/architecture/smart-contracts/process.html) value to signal the use of an on-chain census. The Census Merkle Root is the Ethereum Root Hash at a given block height, and any user can request a Merkle Proof that their address holds tokens on the target ERC20 smart contract. They can then provide this proof to vote on processes for the entity representing that token address. Weighted processes enable users to employ a voting power that is proportionate to the number of tokens they hold.

Technical details for on-chain census can be found at [On-Chain Census](on-chain.md).

## Off-Chain Based Census (Merkle Tree)

An off-chain census allows organizations to centrally manage the set of members who can vote on any given process. Organizations can generate the Census Merkle Tree itself with the help of the [Census Service](../services/census-service.md), but they are responsible for manually generating a list of voters. [Vocdoni.app](https://vocdoni.app) currently provides a CSV-based census mechanism. Details for integrating CSV and other census mechanisms are documented [here](../../integration/census/general.md).

Technical details for off-chain census can be found at [Off-Chain Census](off-chain.md).
