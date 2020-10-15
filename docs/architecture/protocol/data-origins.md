# Data origins

Most of the metadata schemes discussed in the documentation need to point to external data that may be available through various channels.

To overcome delays or data unavailability, a prioritized list of URI's and fallbacks is used. Depending on the type of resource, **Content URI's** or **Messaging URI's** are used.

## Content URI

Transfering data files may be done through IPFS and http/s (Swarm and Swarm Feeds may be supported in the future). In order to use an ordered list of origins and fallbacks, Vocdoni defines data origins in a single field by using a **comma separated list of URI's** like the examples below:

- `ipfs://<content-hash>,https://cloudflare-ipfs.com/ipfs/your-ipfs-hash`
    - First, try to fetch the given &lt;content-hash&gt; from IPFS
    - In case of error, attempt to fetch &lt;your-ipfs-hash-here&gt; from the IPFS gateway provided by CloudFlare
- `ipfs://<content-hash>,https://<url>/<route>`
    - First, try to fetch the given content hash from IPFS
    - If both fail, attempt to fetch from a centralized fallback server

Supported protocols:

- `ipfs://<contentHash>`
- `https://<url>/<route>`
<!-- - ~~`bzz://<contentHash>`~~ -->
<!-- - ~~`bzz-feed://<feedHash>`~~ -->

URI order matters:
- Clients are expected to try using URI's from left to right
- In the event of a mismatch, the data from the leftmost functional service is used

## Content Hashed URI

In essence, it features a Content URI with the hash of the underlying data appended at the end. 

- Content URI items are delimited by the `,` symbol.
- The hash of a Content Hashed URI is delimited by the `!` symbol.
- The hash is a SHA3-256 of the underlying content

Example:

```
ipfs://1234...1234,https://host.io/file.txt!1234567890
```

This type of link is intended for contents that don't change frequently and that require integrity checks where underlying HTTP endpoints cannot enforce it.

## Messaging URI

Intended for two-way communications between nodes, Messaging URI's look similar to a Content URI:

- `ws://<host1>/<path>,https://<host2>/<path>`
    - Attempt to use the WebSocket from host1 endpoint in the first place
    - In case of error, attempt to connect using host2

Currently, only *WebSocket* and *HTTP* protocols are supported for messaging. PSS, IPFS PubSub and Whisper may be supported as well in the future.

Same as before, URI order matters here too:
- Clients are also expected to try using URI's from left to right
- In the event of a mismatch, the data from the leftmost functional service is also used

### Privacy centric messaging

Where protocols like PSS or Whisper allow for pseudo anonymous communication, high stake elections may need additional transport guarantees for anonymity.

In this case, Vocdoni proposes the use of [Nym](https://nymtech.net/) as a mixing infrastructure for anonymous voting submission that cannot be correlated to an IP address.

### Coming next

See the [Integration overview](/integration/overview) section.
