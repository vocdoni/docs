# What are we solving ?

There is no scarcity of solutions for digital governance and voting platforms.

## Problem

> How is it possible for millions of people to vote from a smart phone, annonymously, in a censorship-resistant way?

Unless we have a solution that has a user experience at least on par with current, centralized solutions, these will be the user's choice.

The _mass adoption_ part is important to understand the chosen technical solutions, and uncovers two critical problems to be solved:

- Scalability of decentralized technologies
- Usablility and education of decentralized technologies to the masses.

This is well ilustrated by [Zooko's triangle](https://en.wikipedia.org/wiki/Zooko%27s_triangle):

![](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Zooko%27s_Triangle.svg/440px-Zooko%27s_Triangle.svg.png)

## Solution

After months of iterations, we have a design with well balanced compromises:

We achieve this by externalizing the computational heavy lifting to a relay network - thereby allowing for lightweight end-user clients. This fundamental architectural choice has the following implications:

- Minimizes transactions to the blockchain. Can potentially be used in the Ethereum Mainnet
- Voters do not write, only read from the blockchain
- Voters can participate with a light-client (static Web or Android/iOS APP)
- Secure vote anonymization using [zk-SNARKs](https://en.wikipedia.org/wiki/Non-interactive_zero-knowledge_proof) or [Linkable Ring Singatures](https://eprint.iacr.org/2004/027.pdf)
- Data availability via decentralized content-addressed storage ([IPFS](https://ipfs.io/), [SWARM](https://swarm-guide.readthedocs.io))
- Economically incentivized server network performs actions not possible by light-clients
- The user can verify the correctness of the results and that their ballot has been properly counted
- The entire process is verifiable by any external observer

> Design details can be found in the [Whitepaper](http://vocdoni.io/docs/#/whitepaper)