# How It Works

## Components

### Gateway
The Vocdoni-node gateway provides the public APIs that enable voters and third-parties to explore information about processes and entities, generate census proofs, and cast votes. 

### Manager Backend
The manager backend provides the private API for integrators and entities to manage their account and voting processes, respectively. The manager backend requires authentication keys to access private API methods. 

The API backend is made of two components: a private database and a REST API. 

#### Database

The VaaS database holds information about integrators, organizations, elections, etc, in order to easily provide this information to the REST API. 

##### Design
A relational database is being used to store the necessary information. The following schema describes the involved relational entities:

The main entities are:
- `Integrator`: A third-party integrator of the VaaS API, including a billing plan and a set of organizations (customers of theirs)
- `Organization`: An organization identified by its entityID
- `Election`: A voting process belonging to a specific organization
- `Census`: A census for a voting process, containing a number of census items
- `CensusItem`: An item containing a public key corresponding to an eligible voter
- `BillingPlan`: A configuration item specifying the maximum census size and process count available to a given integrator's account

##### Implementation
The database is designed as a relational DB, and is implemented in Postgres. Nevertheless, the DB calls are abastracted by an the interface `database/database.go`, allowing for other implementations as well.

For the performing the with Postgres queries we use [jmoiron/sqlx](github.com/jmoiron/sqlx), which uses the [lib/pq](github.com/lib/pq) module for connection.

Database migrations ara handled with the [rubenv/sql-migrate](github.com/rubenv/sql-migrate) module.


#### APIs

##### API Service

The API service, called `UrlAPI` in the codebase, contains the logic and components for the VaaS API.

The API service wraps:
- `config`: Configuration options for the API
- `router`: Manages the incoming requests
- `api`: Contains the authentication middleware
- `metrics agent`: Graphana and Prometheus metrics system
- `db`: The VaaS database
- `vocClient`: A client to make requests to the Vocdoni-Node gateways (communication with the Vochain)
- `globalOrganizationKey`: An optional private key to encrypt organization keys in the db
- `globalMetadataKey`: An optional private key to encrypt election metadata keys in the db

###### REST API
The REST API includes the following endpoints:
- `Admin` calls for administrators (Vocdoni) to manage the set of Integrators and billing plans
- `Private` calls for integrators to manage organizations & voting processes
- `Public` public calls for end-users to submit votes & query voting process information
- `Quota` [not yet implemented] rate-limited public calls for end-users to submit votes & query voting process information

Available by default under `/api`.
A detailed version of the API can be found [here](/urlapi/README.md).

The VaaS API also requires interaction with the [Credential Service Provider](https://github.com/vocdoni/blind-csp) which provides an [authentication API](census/off-chain-csp.md) for voter authentication. 


### Blind Signature API
This component provides access to a Credential Service Provider (CSP). Users can use this API to request and retrieve a blind signature for anonymous voting processes that use CSP. Details of CSP voting is found [here](census/off-chain-csp.md). 

## Confidential Metadata

The VaaS-API also offers a new feature in the form of confidential election data. This means all human-readable information like the description and voting options is only available to election administrators and eligible voters.

### Storage

The confidential process metadata is still stored on [ipfs](../deployment/gateway.md#file-api), but it is first encrypted by the VaaS-API backend and uploaded in raw encrypted form. The encryption key is generated uniquely for each election stored in the database, salted with a separate private key specified in the server configuration. 

### Usage

There are two ways to get the data from confidential processes: the private (authenticated) endpoint and the public voter endpoint.

In the case of the [private endpoint](vaas-api.md#integrator-api-private), the presence of a valid integrator bearer API token signifies that the user is an admin who has rights to view confidential processes. The server fetches the key from the database, salts it with the configured global metadata key, and decrypts the confidential process metadata from ipfs, returning this metadata via the api call.

In the case of the [public endpoint](vaas-api.md#public-api), instead of a single admin token, the user must request a shared key from the [authentication endpoint](vaas-api.md#authentication-api) and submit this to get confidential election details endpoint. The handler derives a salted public key from the shared key, which is a salted signature of the election ID. The handler then salts this public key with the election ID, producing the CSP public key. If this public key is the same as the election's `censusRoot`, meaning the voter has submitted a valid credential proof for that election, then the server fetches, decrypts, and uses the metadata key to provide the confidential metadata to the user.