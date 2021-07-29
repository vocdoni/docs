# On-chain Census

:::tip
This is the census mechanism used by [Aragon Voice](https://voice.aragon.org/)
:::

On-chain census are defined as part of the Voting Protocol, so organizations using this method do not need to generate their own Census Merkle Tree. Rather, the Merkle Tree is an [Ethereum Storage Proof](../../architecture/smart-contracts/storage-proofs.md) and the census is a weighted set of holders of a given Ethereum token.

There is only one entity per Ethereum token, where the address of that entity is the contract address of the given token. Anyone can permissionlessly `register` a token, incurring some gas cost, to ensure that the Ethereum token address is registered and valid. From that point on, anyone can create a voting process for that token and set the [census origin](/architecture/smart-contracts/process.html) enumeration of the process to the correct Ethereum token type:
```
	ERC20 = 11;
	ERC721 = 12;
	ERC1155 = 13;
	ERC777 = 14;
	MINI_ME = 15;
```

The Voting Protocol will generate the Storage Proof and publish the Census Merkle Root automatically and trustlessly. 

