# Using RedisJSON is a NoSQL database with Express and Redis-OM (JS)\*

This application aims to provide an example of the [Redis-OM client](https://github.com/redis/redis-om-node/blob/main/README.md) connected to a [Redis](https://redis.io/) instance. Typical database actions such as create, read, update, and destroy are covered.

## Running the app

Let's populate the Redis instance with some albums. There will be 3 users that will 'own' these albums. This will allow us to search for albums by owner later on.

```
npm run load
```

To run the application:

```
npm start
```

HTTP requests can now be sent to the server.

# HTTP Request and Routing Table:

| Action             | Method | Route                  | Notes                                              |
| ------------------ | ------ | ---------------------- | -------------------------------------------------- |
| Create an entry    | POST   | `api/albums/{entryID}` | include data in body                               |
| Get all entries    | GET    | `api/albums`           | offset and count query parameters                  |
| Get one entry      | GET    | `api/albums/{entryID}` |
| Search for entries | GET    | `api/albums/search`    | property and value query parameters                |
| Update an entry    | PUT    | `api/albums/{entryID}` | include update data in body                        |
| Remove an entry    | DELETE | `api/albums/{entryID}` |
| Reload and reindex | POST   | `api/reload`           | reloads data and reindexes after any schema change |

## Create One Album

To create a new album entry, we pass an album object within the request body along to the server.
Example Call:

```
POST - api/albums
body: {
       "artist": "The Smashing Pumpkins",
       "title": "Siamese Dream",
       "condition": 5,
       "format": "CD",
       "comments": "a bit dented and scratched, but plays still.",
       "price": 4,
       "forSale": true
       }
```

This will return the new Redis entry with the associated entryID.

## Get All albums

This endpoint includes optional offset and count values for pagination. You would normally want this as retrieving THE ENTIRE database of entires would be quite large in production.
Example Call:

```
GET - api/albums/?offset=00&count=10
```

This would return the first ten entries the database retrieves

## Get One album

This endpoint retrieves one single album based on the the EntryID included as a URL parameter.
Example Call:

```
GET - api/albums/01FWJ4TBXZSQEMNENDF7KJ4BE8
```

This would return the the entry with the associated entryID. Note that this entryID is for RediSearch.

## Search Albums

This endpoint takes one query parameter and performs a search based on the property and value passed in.
Example Call:

```
GET - api/albums/search/?artist=Majeure
```

This would return all entries with the artist property containing the string `Majeure` in an array.

```
GET - api/albums/search/?format=vinyl
```

This would return all entries where the format is set to `Vinyl`

## Update One Album

With Redis, an update is simply an overwrite of the specific values that are to be updated. The path parameter will contain the `entityID` and the request body will contain the key/value pairs to be updated within the entry.
Example Call:

```
PUT - api/albums/01FWJ4TBXZSQEMNENDF7KJ4BE8
body:     body: { artist: updatedValue, comments: updatedValue }
```

This updates only the properties and values you send within the request body. A receipt of update is sent back in the form of the original `entityID`.

## Delete One Album

This endpoint removes one entry based on the URL parameter.
Example Call:

```
DELETE - api/albums/01FWJ4TBXZSQEMNENDF7KJ4BE8
```

This removes the album with `entityID` `01FWJ4TBXZSQEMNENDF7KJ4BE8` and returns a successful `OK 200`.
