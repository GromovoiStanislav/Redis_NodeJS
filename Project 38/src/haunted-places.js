const PLACES_INDEX = 'places:index';
const CITIES_INDEX = 'cities:index';
const STATES_INDEX = 'states:index';

const LIMIT = 10000;

export default class HauntedPlacesDataSource {
  constructor(redis) {
    this.redis = redis;
    this.cache = new Map(); // Простое кэширование в памяти
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
    const hashKey = JSON.stringify({ type: 'hash', key });
    const cachedValue = this.cache.get(hashKey);
    if (cachedValue !== undefined) {
      return cachedValue;
    } else {
      const value = await this.redis.hgetall(key);
      this.cache.set(hashKey, value);
      return value;
    }
  }

  async find(index, query) {
    const cacheKey = JSON.stringify({ type: 'search', index, query });
    const cachedValue = this.cache.get(cacheKey);
    if (cachedValue !== undefined) {
      return cachedValue;
    } else {
      const [count, ...foundKeysAndValues] = await this.redis.call(
        'FT.SEARCH',
        index,
        query,
        'LIMIT',
        0,
        LIMIT
      );

      const keys = foundKeysAndValues.filter(
        (_entry, index) => index % 2 === 0
      );
      const values = foundKeysAndValues
        .filter((_entry, index) => index % 2 !== 0)
        .map(this.arrayToObject);

      keys.forEach((key, index) => {
        const hashKey = JSON.stringify({ type: 'hash', key });
        this.cache.set(hashKey, values[index]);
      });

      this.cache.set(cacheKey, values);

      return values;
    }
  }

  arrayToObject(array) {
    const keys = array.filter((_entry, index) => index % 2 === 0);
    const values = array.filter((_entry, index) => index % 2 !== 0);

    return keys.reduce((object, key, index) => {
      object[key] = values[index];
      return object;
    }, {});
  }
}
