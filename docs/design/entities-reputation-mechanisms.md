# A game of trust

In a decentralized environment, there is no authority that can silence, add or remove participants.

This means that anyone can participate with the same capacities regardless if its a state, an organization or individual, and regardless of its ideologies or intentions.

In other words. There is no _moral_ in the system.

Vocdoni inherits these properties.

## Phishing and noise

This has important consequences.

> How do you prevent the user from falling victim of a malicious entity that has supplanted an organization.

> How do you find the entity you are looking for when thousands of entities can exist with similar names

## Centralized curation

In a centralized network usually, there is an authority with the capacities to curate the participant's lists, mark accounts as "official" or "verified", and remove scammy accounts.

Likewise, a search in order to find a specific entity is based on a central unique search index, managed by a central organism.

## Decentralized curation

In Vocdoni, there is no unified list of the entities that participate in the network. Anyone can create its own entity, and they can live in smart-contracts not publicly advertised. Also, no one can prevent this entity to participate in the network.

**There is no absolute authority in Vocodni**.

Instead, each entity can act as an independent authority.

This means that each organization can curate their own lists of trusted entities or malicious ones.

A curated list by a trusted entity `T`, can later be used by the rest of participants to make their own decisions about the trustworthiness of an entity `X`.

In the same fashion, an entity can provide a search index of entities as a discovery mechanism.

> As a user, because I trust entity `T`, and `T` trusts `X`, I also trust `X`

## User choice

In the end, the choice to decide the trustworthiness of an entity is the user.

The job of the app and the underlining system is to provide enough information for the user to make an informed decision.

## Alternative reputation mechanisms

Additional mechanisms that can be used to decide for the trustworthiness on an entity can be.

- Creation time. When was the first information about an entity `X` added? If it's very recent is highly suspicious.
- ENS. An ENS domain can help a lot to guarantee the legitimacy of an entity.
- Media accounts. An entity exists that exists outside Vocdoni can use their alternative accounts (website, twitter...) to point to the legitimate Vocdoni entity.

## Vocdoni for bootstrapping

Voconi as an entity will be pre-configured on the reference app implementation. One of the reasons is to provide an entry point to the user for trusted entities.

## App Trust Report

The mechanism that the reference app will use to inform the user is exemplified in the following mockups.

- [Entity details page](https://www.figma.com/proto/e0KoX2m1aHM14sd6rLtPynRU/Vocdoni-App?node-id=454%3A387&scaling=scale-down). See `Trust report` button on the top left.
- [Trust report page.](https://www.figma.com/proto/e0KoX2m1aHM14sd6rLtPynRU/Vocdoni-App?node-id=111%3A164&scaling=scale-down&redirected=1)