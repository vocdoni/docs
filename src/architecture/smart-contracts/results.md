# Results Contract

Tightly related to the Processes contract and the Genesis one, this contract acts as a registry where Oracles can push the Tally of a vote.

This contract may also evolve in the future to support interesting use cases like the ones enabled by the ERC3000 protocol, Optimistic Rollups, etc.

The instance of the Results contract is resolved from `results.vocdoni.eth` on the ENS registry.

### Contract structs

```solidity
struct ProcessResults {
    uint32[][] tally; // The tally for every question, option and value
    uint32 height; // The amount of valid envelopes registered
    bool defined;
}
mapping(bytes32 => ProcessResults) internal results; // Mapping of all processes indexed by the Process ID
```

### Methods

- `setResults` Used by Oracles to register the tally of a process. It will also try to update the `status` of the process on the Processes contract defined in `processesAddress`.
- `setProcessesAddress` Allows the creator to define which Processes contract should be notified about results being available.


