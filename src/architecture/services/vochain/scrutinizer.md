# Scrutinizer

## Overall

The scrutinizer is the component that tallies and decode/decrypt (if needed) each vote stored in the voting blockchain for each process of each entity. 

The way the scrutinizer works is defined by the process vote type and the process mode eligible configurations.


## Core components

The scrutinizer needs to be connected with a full **Vochain node** in order to access the latest state accurately. The state is for retrieving votes, processes and other useful info for computing the results for each process.

It also maintains three pools and an internal database for data persistence:

### Vote pool

  Used for computing processes with real-time results.

  Each pool item contains a single vote with the following fields:

  - Encryption key indexes
  - Height
  - Nullifier
  - Process Id
  - Vote package

### Process pool

  Used for storing processes and look at each new block if the results can be computed.

  Live processes results are computed in parallel every new Vochain bloc and the results of encrypted or non live processes are scheduled for the tally when the end block of a process is reached or when the keys of a processes are published.

  Each pool item contains a single process with the following fields:

  - Process Id
  - Entity Id (Organization identifier)

### Results pool

  The results pool are used to compute the results of the processes whose:

  - End block is reached
  - Encryption keys are revealed
  - Results need to be computed on real time

  Each item pool contains a process Id and the entity Id associated to the process.


The **internal scrutinizer database** is used for storing the results, processes useful info for the tally, non finalized processes and votes. Storing data linked to the Vochain state changes adds safety and data correctness in front of numerous failures. 


<div style="padding: 20px; background-color: white;">
	<img src="https://github.com/vocdoni/design/raw/main/docs/scrutinizer-comp.png" alt="Scrutinizer components"/>
</div>


## How it works

The scrutinizer is very tied to the Vochain, this is because its functionality relies on state changes on the Vochain application state.

There are some functions that change the Vochain state that are associated to one or more **callback functions** and can be used for other processes in order to do some side logic. One of the components using this feature is the scrutinizer.

### Votes

Each time a vote is added into the Vochain (`addVote`), if the process is meant to have the results available in real-time, the vote is added to the vote pool and processed.

### Processes

Each time a process is added into the Vochain (`addProcess`) it is stored into the scrutinizer database and added into the process pool.

### Process keys

Each time the process keys are revealed (`revealProcessKeys`), the process is added to the results pool in order to process the results.


### Commit

When the `Commit` function is called on the Vochain,  a signal is triggered in order to inform the scrutinizer that the latests changes are finalized and persistent.

In the commit stage all the pools are iterated in order compute the results of each process that is meant to be tallied. As said, there are different situations in which the scrutinizer must compute the results of a process:

- If the process is real time, the votes on the vote pool are fetched in order to be computed at the given Vochain height.
- If the process keys are revealed.
- The process end block is reached.

### Rollback

If the `Rollback` function is called on the Vochain, the current non persisted changes will be discarded.


<div style="padding: 20px; background-color: white;">
	<img src="https://github.com/vocdoni/design/raw/main/docs/scrutinizer-flow.png" alt="Scrutinizer work flow"/>
</div>

### Coming next

See the [Census Service](/architecture/services/census-service) section.
