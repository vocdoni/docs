# Process Metadata

Voting processes are declared on the Blockchain and store the critical information for integrity. However, the metadata of a process lives on a JSON file with the information on which voters can make a choice. It also allows Relays and Scrutinizers to fetch the technical parameters of a vote.

The creation of this document is critical. Multiple checks should be in place to ensure that the data is choerent (well formatted, all relevant locales present, etc).

The JSON payload below is typically stored on Swarm or IPFS, so anyone can fetch the metadata of a voting process through a decentralized channel.

```json
{
    "version": "1.0",    // Protocol version

    "name": "Basic income rule", // Human friendly name, not an identifier
    "address": "0x1234...", // Of the vote on the VotingProcesses smart contract
    
    "voteType": "single-choice", // Defines how the UI should allow to choose among the votingOptions.
    "proofType": "zk-snarks",  // Allowed ["zk-snarks", "lrs"]
    
    "question": {
        "default": "Should universal basic income become a human right?",
        "ca": "Estàs d'acord amb que la renda bàsica universal sigui un dret humà?"
    },
    "voteOptions": [
        {
            "default": "Yes" ,
            "ca": "Sí",
            "value": 1
        },
        {
            "default": "No",
            "ca": "No",
            "value": 2
        }
    ],
    "startBlock": 10000,
    "endBlock":  11000,
    "meta": {
        "description": {
            "default": "## Markdown text goes here\n### Abstract",
            "ca": "## El markdown va aquí\n### Resum"
        },
        "images": [ "<content uri>", ... ],
        "organizer": {
            "address": "0x1234...",  // Address of the Entity entry on the blockchain
            "resolver": "0x2345...",  // Address of the EntityResolver smart contract
            "metadata": "<content uri>" // Organizer's metadata
        }
    },
    "census": {
        "id": "entity-people-of-legal-age",  // Census ID to use
        "origin": "<messaging uri>", // Messaging URI of the Census Service to request data from
        "merkleRoot": "0x1234...",
        "modulusSize": 5000  // Only when type="lrs"
    },
    "publicKey": "0x1234...", // To encrypt vote packages

    // Only when voteType == "lrs"

    "modulusGroups": [
        { "publicKeyModulus": 0, "source": "<content uri>" },  // Resolves to a ModulusGroupArray (see below)
        { "publicKeyModulus": 1, "source": "<content uri>" },
        { "publicKeyModulus": 2, "source": "<content uri>" },
        ...
    ]
}
```

**Notes:**

- The `voteType` field indicates the scrutiny method that will be used for the process. Any vote package generated with an invalid voteType will be discarded.
- The list of authorized relays is available on the Process smart contract
