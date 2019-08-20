# Boot node

In order to get an initial list of Gateways, Vocdoni uses boot node servers.

Boot node servers typically provide an HTTP `GET` endpoint to fetch the list.

## JSON API schema

The data schema used to define a set of boot nodes is a JSON file like the example:

```json
{
   "goerli": [
      {
         "host":"hostname.net",
         "wss": [  // What Gateway API's are available on the WSS protocol
            "file",
            "dvote",
            "census"
         ],
         "https": [  // What Gateway API's are available on the HTTPS protocol
            "web3"
         ],
         "pubkey":"02325f284f50fa52d53579c7873a480b351cc20f7780fa556929f5017283ad2449"  // ECDSA Public key
      },
      {
         "host":"hostname2.net",
         "wss": [
            "file",
            "dvote",
            "census"
         ],
         "https": [
            "web3"
         ],
         "pubkey":"0381290a9b7fabe99c24d8edcf4746859f17ee8e6099288fcf9170c356545fcac0"
      }
   ]
}
```
