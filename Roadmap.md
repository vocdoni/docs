# Roadmap

It wants to represent a very high-level roadmap overview  si it can be used as guidline in order to reach a production state for Vocdoni's libraries.
- Everything here is subject to change
- It does not take in consideration any kind of dead-lines
- It does not take in consideration available human resouorces
- It does not make assumptions on how the libraries will be materailized (app/ web / platform...)
  
- It uses [user stories](https://en.wikipedia.org/wiki/User_story) in order to represent that final user needs.
- Its designed so each epic is useful on its own so we can validate the progress


## Users
- `V` is a bunch of idealists that dream of a world were the civil society can't be oppresed.  
`V` energies are directed toward accelerating change by creating decentralized tools that allow society to be self-organized from the bottom up.

- `Bob` is an sponge excited by the new decentralized paradigm.  
`Bob` is an early adopter with an advanced technical understanding  
`Bob` wants to helps to test new tools and provide user feedback 
`Bob` has an especial interest for creating 


- `Alice` and her friends like to drink tea and do not have a clue about how tech works.  
`Alice` just wants to be able to vote using a simple user interface.

- `Piolin` is a bad person  
`Piolin` thinks he is superior to the rest and he wants to impose his will   
`Piolin` does not want Vocdoni to exists and will do everything he can to censor it


## `Epic 0`: Theoric design and validation
- [x] `V` wants to have a complete Whitepaper draft.  
So fellow decentralization developers can validate it.

- [ ] `V` wants understand and identify the main development blocks  
So she can start working on a proof of concept

## `Epic 1`: Proof of concept
- [ ] `V` wants an end-to-end implementation of the proposed design  
So she can get a better of understanding of...  
    ... how to structure the code base  
    ... potential flaws in the current design  
    ... potential bottle necks  

- [ ] `V` wants the simplest implementaion possible  
    So we can move fast to the next epic
  - No relay (user transacts directly blockchain)
  - No user interface
  - No tests
  - No nice code
  - No identities (just keys)
  - No documentation
  - No optimizations

- [ ] `V` wants the specs of the next phase as outcome.  
So we have a base to design the necessary libraries  
So we can better quantifiy the work and distribute it among the team.

- [ ] `Bob` needs to be able through the whole voting process on his local computer.  
So he can test that everything works and provide early feedback.

## `Epic 2`: Minimum valuable product
- [ ] `V` wants a simple but usable product  
So `Alice` and her friends can help testing

- [ ] `V` wants to have centralized relay
So `Alice` does not need to use the blockchain

- [ ] `V` wants the code-base to be modular.  
So alternative implementations can be done

- [ ] `V` wants the implementation written using good coding practices.  
So future development is flawless

- [ ] `V` wants the code-base to be well documented  
So external devs can jump in easly

- [ ] `Bob` wants a basic interface to assist the creation a voting process.  
So `Alice` and friends can vote.

- [ ] `Alice` wants to use a simple UI (even if its ugly)  
So she can vote, even without understanding how it works


## `Epic 3`: Identities
- [ ] `Alice` wants a basic identity UI  
So she can see third party claims   
So she can create claims to her-self (voting keys)

- [ ] `V` wants to have at least one instance of a full identity managment suport   
So Vocdoni does not rely on third party implementations and can test easily

- [ ] `V` wants a well documented identity api  
So alternative impementations can interface Vocodni with their own identity scheme  
So outside entities can have their own claims integration 

## `Epic 4`: Relays

- [ ] `V` wants to have a decentralized relay network  
So `Piolin` can't censor it easily

- [ ] `V` wants the network to be trust-less and open  
So its self-sustained

## `Epic N`: Complementary tools / Optimizations
- Key managament/migration
- Performance optimitzations
- Refactoring
- Specific integrations
- More identity support
- Comunication channels
- Platform
- Clients

# Captains

# Regular meetings
+ Daily standyp call, every weekday at 10:00
    + To talk about document
+ Weekly call, every Thursday at 10:00
    - It may include sprint planning
  
# Ideas
- How can we create a  better narrative? `V` of Vendetta
- How can we have more fun?
    - 404 pages are Piolins looking for stuff
- How can we get to know each other?
- Private repositories to talk about
    - 