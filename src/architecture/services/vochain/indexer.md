# Indexer

## Overall

The indexer is the component that tallies and decode/decrypt (if needed) each vote stored in the voting blockchain for each process of each entity. 

The way the indexer works is defined by the process vote type and the process mode eligible configurations.

The **internal indexer database** is used for storing the results, processes, references to votes and transactions, and information about the number of items in the Vochain state. Storing data linked to the Vochain state changes adds safety and data correctness in front of numerous failures and provides much more powerful access to querying the Vochain.

## Core components

The indexer needs to be attached to a full **Vochain node** in order to access the latest state accurately. The state is for retrieving votes, processes, transactions, and other useful info for computing the results for each process.

It also maintains six pools and an internal database for data persistence:

### Vote pool

  Used for computing processes with real-time results. Votes are added to the results storage for the given process ID.

  Each pool item contains a single vote with the following fields:

  - Height
  - Nullifier
  - Process ID
  - Vote package
  - Encryption key indexes
  - Weight

### Vote Index pool 

  Used for storing all votes along with their transaction indexes, including those without live results. A reference to the vote's transaction is stored in the indexer database/

  Each pool item contains a single vote & index with the following fields:

  - Vote
    - Height
    - Nullifier
    - Process ID
    - Vote package
    - Encryption key indexes
    - Weight
  - TxIndex


### New Process pool

  Used for initially storing processes to the indexer database.

  Each pool item contains a single process with the following fields:

  - Process Id
  - Entity Id (Organization identifier)

### Update Process pool

  Used for signifying which processes may need to be updated in the indexer database. Each process in the pool is updated according to the current Vochain state, and final results are computed if applicable.

  Live processes results are computed in parallel every new Vochain block and the results of encrypted or non live processes are scheduled for the tally when the end block of a process is reached or when the keys of a processes are published.

  Each pool item contains a byte array representing the identifier for a process which needs to be updated.

### New Tx pool

  Used for storing a reference to each new transaction on the Vochain and updating the total count of transactions. Transaction references can then be used to easily access transactions directly from the Vochain state.

  Each pool item contains a single transaction reference with the following fields:

  - Index *(the transaction's height on the Vochain)*
  - BlockIndex *(The index of the block containing the transaction)*
  - TxBlockIndex *(The transaction's index on the block containing it)*

### Results pool

  The results pool is used to signal which processes need to have results computed and finalized when either:

  - The end block is reached
  - The encryption keys are revealed
  - The results need to be computed in real time

  Each pool item contains a single process with the following fields:

  - Process Id
  - Entity Id (Organization identifier)




<div style="padding: 20px; background-color: white;">
	<img src="https://github.com/vocdoni/design/raw/main/docs/indexer-comp.png" alt="indexer components"/>
</div>


## How it works

The indexer is very tied to the Vochain, this is because its functionality relies on state changes on the Vochain application state.

There are some functions that change the Vochain state that are associated to one or more **callback functions** and can be used for other processes in order to do some side logic. One of the components using this feature is the indexer.

### Commit

When the `Commit` function is called on the Vochain,  a signal is triggered in order to inform the indexer that the latest changes are finalized and persistent.

In the commit stage all the pools are iterated in order compute the results of each process that is meant to be tallied. As said, there are different situations in which the indexer must compute the results of a process:

- If the process is real time, the votes on the vote pool are fetched in order to be computed at the given Vochain height.
- If the process keys are revealed.
- The process end block is reached.

### Rollback

If the `Rollback` function is called on the Vochain, the current non persisted changes will be discarded.

### OnProcess

When a new process is created, it is added to the New Process pool to be stored on the indexer database.

### OnVote

When a new vote is registered, it is added to the Vote Index pool so the vote transaction can be referenced from the indexer. If the vote belongs to a process with live results, it is also added to the Vote pool so that the results stored by the indexer can count the new vote. 

### OnCancel

When a process is cancelled, its ID is added to the Update Process pool.

### OnProcessKeys

When a process' keys are added, its ID is added to the Update Process pool.

### OnProcessStatusChange

When a process' status is changed, its ID is added to the Update Process pool. If the process changes to the `ended` status and its votes are not encrypted, it is also added to the Results pool to compute final results.

### OnRevealKeys

When a process' keys are revealed, its ID is added to the Update Process pool. It is also added to the Results pool to decrypt the votes and compute final results.

### OnProcessResults

When the Vochain signals that a process' results are available, the results are checked for validity and then the process ID is added to the Update Process pool. 




<div style="padding: 20px; background-color: white;">
	<img src="https://github.com/vocdoni/design/raw/main/docs/indexer-flow.png" alt="indexer work flow"/>
</div>


