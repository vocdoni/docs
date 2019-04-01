# Data origins

Many of the schemas discussed in the present documentation need to point to external data that may be available through various channels.

In order to denominate them and provide a prioritized list of fallbacks in a single place, **Content URI's** or **Messaging URI's** are used, depending on the type of resource. 

## Content URI

Transfering data files may be done through Swarm, Swarm Feeds, IPFS and http/s. In order to use an ordered list of origins and fallbacks, Vocdoni defines data origins in a single field by using a **comma separated list of URI's** like the examples below:

- `bzz://<content-hash>,https://cloudflare-ipfs.com/ipfs/<your-ipfs-hash-here>`
    - First, try to fetch the given &lt;content-hash&gt; from Swarm
    - In case of error, attempt to fetch &lt;your-ipfs-hash-here&gt; from the IPFS gateway provided by CloudFlare
- `bzz-feed://<feed-hash>,ipfs://<content-hash>,https://<url>/<route>`
    - First, try to fetch the given feed from Swarm
    - In case of error, attempt to fetch the given content hash from IPFS
    - If both failed, attempt to fetch from a centralized fallback server

Supported protocols:

- `bzz://<contentHash>`
- `bzz-feed://<feedHash>`
- `ipfs://<contentHash>`
- `https://<url>/<route>`
- `http://<url>/<route>`

URI order matters:
- Clients are expected to try using URI's from left to right
- In the event of a mismatch, the data from the leftmost functional service is used

## Messaging URI

Intended for two-way communication between two nodes, a Messaging URI field looks similar to a Content URI:

- `pss://<publicKey@address>,pubsub://<topic>,shh://<publicKey>`
    - Attempt to use PSS in the first place, sending an encrypted message to the given address using the given public key
    - In case of error, attempt to post a message to the given topic on IPFS PubSub
    - If both fail, try to post a message to the given public key using Whisper

The messaging protocols supported are PSS, IPFS PubSub and Whisper:

- `pss://<publicKey@address>`
  - Uses Ethereum Swarm/PSS protocol
  - address can be empty
- `pubsub://<topic>`
  - Uses IPFS pubsub protocol
- `shh://<publicKey>`
  - Uses Ethereum Whisper protocol

URI order matters here too:
- Clients are expected to try using URI's from left to right
- In the event of a mismatch, the data from the leftmost functional service is used
