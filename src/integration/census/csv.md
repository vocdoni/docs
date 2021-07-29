#### CSV Census

:::tip
This is the census mechanism used by [Vocdoni.app](https://vocdoni.app/)
:::

The CSV census enables organizations to host voting processes without requiring users to store their own private keys, best used for a light-weight frontend with minimal user interaction. The entity generates a CSV file including user information. For example:

| name     | age | country     | favorite color |
| -------- | --- | ----------- | ----------     |
| John     | 27  | Winterfell  | red            |
| Tyrion   | 36  | Lannisport  | blue           |
| Daenerys | 22  | Dragonstone | fuchsia        |
| Jorah    | 65  | Bear Island | brown          |

This information is normalized, concatenated, and then hashed to create a public key for each user. The public keys are added to the census Merkle Tree and then discarded, and only the Merkle Tree is stored. Users can then generate their ephemeral private key in the future by entering their correct information in a web client. 

Note that this method is only as secure as the information used to generate the keys. If the CSV fields contain only publicly-available information, anyone could maliciously generate another user's key pair. 