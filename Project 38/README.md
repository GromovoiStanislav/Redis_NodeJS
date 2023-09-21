# Haunted Places Data Service: Using Apollo GraphQL, and Redis (JS)\*\*

This is a simple data service that use Apollo GraphQL to expose data on Redis.

## Load the Haunted Places

Now, _From a new terminal_, load the data into Redis with the following command:

    $ npm run load

This should run for a couple seconds without much fanfare. But, you now have about 10,000 haunted places loaded into Redis.

## Run the Server

Redis is running. The data is loaded. Nothing else left to do but run the server:

    $ npm start

And you should see the following response:

    > haunted-places-data-service@1.0.0 start
    > node src/app.js

    👻 Server ready at http://localhost:3000/ 👻

Point your browser to http://localhost:3000/graphql and start messing with the server.

Examples:

```
query State {
  state(state: "NY") {
    name
    abbreviation
  }
}

///////////////////////////////

query City {
  city(city: "Westland", state: "MI") {
    name
    state {
      name
      abbreviation
    }
    coordinates {
      latitude
      longitude
    }
    places {
      id
      description
    }
  }
}

///////////////////////////////

query Place {
  place(id: 2) {
    id
    location
    description
    coordinates {
      latitude
      longitude
    }
    city {
      name
      state {
        abbreviation
        name
      }
    }
  }
}

///////////////////////////////////////////
query States {
  states {
    name
    abbreviation
    cities {
      name
      coordinates {
        latitude
        longitude
      }
    }
  }
}

query States {
  states {
    name
    abbreviation
    places {
      id
      description
      city {
        name
      }
    }
  }
}

query States {
  states {
    name
    abbreviation
    cities {
      name
      places {
        id
        description
      }
    }
  }
}

```
