# Considerations

## Relay network
+ How can we minimize IP address/vote mapping?
  + Multiple encryption with `relay` keys?
  + Use [I2P](https://en.wikipedia.org/wiki/I2P)
  + Use [Tor](https://en.wikipedia.org/wiki/Tor_(anonymity_network))
  
+ How does the `relay` pool look like? Is it a blockchain?
+ Do we need a `relay` market?
+ How does a `relay` compite with another `relay` pricing? Where are prices announced?
+ What is the prize of a `process` based on? Number of necessary transactions(not known before-hand)? 
+ How to check `relay` bad behaviour?
    + Who checks it? (the `organization?`)
    + Time limits for an un-returned hash?
    + Relay censoring a package

+ How to choose which relay to encrypt the `vote package` with? How can it be randomized?
+ How a `User` chooses which relay connects to?
+ How does a `user` confirms that her `vote-package` has been added into the blockchain?
  + Does it need to keep downloading every new hash of aggregated `vote packages`? 

## Merit based census
+ Current design requires that the organization has access to an existing census
+ This pretty much implies that only entities with an existing user base can create `processes` 
+ We would like a system that could generate the census based on a claim selection
+ This would allow any identity to create a `process` using any set of claims by other third parties
