# Boot node

In order to get an initial list of Gateways, Vocdoni uses boot node servers.

Boot node servers typically provide an HTTP `GET` endpoint to fetch the list.

## JSON API schema

The data schema used to define a set of boot nodes is a JSON file like the example:

```json
{
   "goerli": { // The Ethereum network ID
      "web3": [
         { "uri": "https://host1/web3" },
         { "uri": "https://host3/web3" }
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
