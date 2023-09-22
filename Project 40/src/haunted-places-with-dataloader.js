import DataLoader from 'dataloader';

const PLACES_INDEX = 'places:index';
const CITIES_INDEX = 'cities:index';
const STATES_INDEX = 'states:index';

const LIMIT = 5;

export default class HauntedPlacesDataSource {
  constructor(redis) {
    this.redis = redis;
    this.loader = new DataLoader((requests) => this.load(requests), {
      cacheKeyFn: JSON.stringify,
    });
  }

  async load(requests) {
    return Promise.all(
      requests.map(async (request) => {
        if (request.type === 'json') {
          return this.redis.json.get(request.key);
        }

        if (request.type === 'search') {
          const { documents } = await this.redis.ft.search(
            request.index,
            request.query,
            {
              LIMIT: { from: 0, size: LIMIT },
            }
          );

          return documents;
        }
      })
    );
  }

  async fetchPlace(id) {
    return this.fetch(`place:${id}`);
  }

  async fetchCity(city, state) {
    return this.fetch(`city:${city}:${state}`);
  }

  async fetchState(state) {
    return this.fetch(`state:${state}`);
  }

  async findPlacesContaining(text) {
    return this.find(PLACES_INDEX, text);
  }

  async findPlacesNear(latitude, longitude, radiusInMiles) {
    return this.find(
      PLACES_INDEX,
      `@coordinates:[${longitude} ${latitude} ${radiusInMiles} mi]`
    );
  }

  async findPlacesForCity(city, state) {
    return this.find(PLACES_INDEX, `@city:{${city}} @state:{${state}}`);
  }

  async findPlacesForState(state) {
    return this.find(PLACES_INDEX, `@state:{${state}}`);
  }

  async findCitiesForState(state) {
    return this.find(CITIES_INDEX, `@state:{${state}}`);
  }

  async findAllCities() {
    return this.find(CITIES_INDEX, '*');
  }

  async findAllStates() {
    return this.find(STATES_INDEX, '*');
  }

  async fetch(key) {
    return this.loader.load({ type: 'json', key });
  }

  async find(index, query) {
    const documents = await this.loader.load({
      type: 'search',
      index,
      query,
    });

    let data = [];
    documents.forEach((document) => {
      this.loader.prime({ type: 'json', key: document.id }, document.value);
      data.push(document.value);
    });

    return data;
  }
}
