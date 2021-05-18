# Boot node

In order to get an initial list of Gateways, Vocdoni uses boot node servers.

Boot node servers typically provide an HTTP `GET` endpoint to fetch the list.

## JSON API schema

The data schema used to define a set of boot nodes is a JSON file like the example:

```json
{
   "goerli": {
      "web3": [
         { "uri": "https://host1/web3" },
         { "uri": "https://host3/web3" }
      ],
      "vochain": [
         { 
            "chainId": "vocdoni-development-43",
            "bootnodes": ["7440a5b086e16620ce7b13198479016aa2b07988@seed.dev.vocdoni.net:26656"]
         },
         {
            "chainId": "vocdoni-development-42",
            "bootnodes": ["6550a5b086e16620ce7b13198479016aa2b07988@seed2.dev.vocdoni.net:26656"]
         }
      ],
      "dvote": [
         { "uri": "https://host1/dvote", "apis": ["file", "vote", "results"], "pubKey": "02325f284f50fa52d53579c7873a480b351cc20f7780fa556929f5017283ad2449"  },
         { "uri": "wss://host2/dvote", "apis": ["vote", "census"], "pubKey": "02325f284f50fa52d53579c7873a480b351cc20f7780fa556929f5017283ad2449"  }
      ]
   }
}
```

### Coming next

See the [Entity Metadata](/architecture/data-schemes/entity-metadata) section.
