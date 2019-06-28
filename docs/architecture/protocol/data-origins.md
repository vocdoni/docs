# Data origins

Many of the schemas discussed in the present documentation need to point to external data that may be available through various channels.

In order to denominate them and provide a prioritized list of fallbacks in a single place, **Content URI's** or **Messaging URI's** are used, depending on the type of resource. 

## Content URI

Transfering data files may be done through IPFS and http/s (Swarm and Swarm Feeds may be supported in the future). In order to use an ordered list of origins and fallbacks, Vocdoni defines data origins in a single field by using a **comma separated list of URI's** like the examples below:

- `ipfs://<content-hash>,https://cloudflare-ipfs.com/ipfs/<your-ipfs-hash-here>`
    - First, try to fetch the given &lt;content-hash&gt; from IPFS
    - In case of error, attempt to fetch &lt;your-ipfs-hash-here&gt; from the IPFS gateway provided by CloudFlare
- `ipfs://<content-hash>,https://<url>/<route>`
    - First, try to fetch the given content hash from IPFS
    - If both fail, attempt to fetch from a centralized fallback server

Supported protocols:

- `ipfs://<contentHash>`
- `https://<url>/<route>`
- ~~`bzz://<contentHash>`~~
- ~~`bzz-feed://<feedHash>`~~

URI order matters:
- Clients are expected to try using URI's from left to right
- In the event of a mismatch, the data from the leftmost functional service is used

## Messaging URI

Intended for two-way communication between two nodes, a Messaging URI field looks similar to a Content URI:

- `pss://<publicKey@address>,ws://<host>/<path>`
    - Attempt to use PSS in the first place, sending an encrypted message to the given address using the given public key
    - In case of error, attempt to connect using web sockets

The messaging protocols supported are PSS (IPFS PubSub and Whisper may be in the future):

- `pss://<publicKey@address>`
  - Uses Ethereum Swarm/PSS protocol
  - address can be empty
- `ws://<host>/<path>` and `wss://<host>/<path>`
  - Uses a web socket
- ~~`pubsub://<topic>`~~
  - ~~Uses IPFS pubsub protocol~~
- ~~`shh://<publicKey>`~~
  - ~~Uses Ethereum Whisper protocol~~

URI order matters here too:
- Clients are expected to try using URI's from left to right
- In the event of a mismatch, the data from the leftmost functional service is used
