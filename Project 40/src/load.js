import 'dotenv/config';
import csv from 'csv-parser';
import fs from 'node:fs';
import { createClient, SchemaFieldTypes } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});
await redis.connect();

const PLACES_INDEX = 'places:index';
const CITIES_INDEX = 'cities:index';
const STATES_INDEX = 'states:index';

async function addIndices() {
  const indices = await redis.ft._list();

  const pipeline = redis.multi();
  await addPlaceIndex(pipeline, indices);
  await addCityIndex(pipeline, indices);
  await addStateIndex(pipeline, indices);
  return pipeline.exec();
}

async function addPlaceIndex(pipeline, indices) {
  if (indices.includes(PLACES_INDEX)) {
    await dropIndex(PLACES_INDEX, indices);
  }
  addIndex(pipeline, PLACES_INDEX, 'place:', {
    '$.location': {
      type: SchemaFieldTypes.TEXT,
      SORTABLE: true,
    },
    '$.description': {
      type: SchemaFieldTypes.TEXT,
      SORTABLE: 'UNF',
    },
    '$.coordinates': {
      type: SchemaFieldTypes.GEO,
    },
    '$.city': {
      type: SchemaFieldTypes.TAG,
      AS: 'city',
    },
    '$.state': {
      type: SchemaFieldTypes.TAG,
      AS: 'state',
    },
  });
}

async function addCityIndex(pipeline, indices) {
  if (indices.includes(CITIES_INDEX)) {
    await dropIndex(CITIES_INDEX, indices);
  }
  addIndex(pipeline, CITIES_INDEX, 'city:', {
    '$.name': {
      type: SchemaFieldTypes.TAG,
      AS: 'name',
    },
    '$.state': {
      type: SchemaFieldTypes.TAG,
      AS: 'state',
    },
    '$.coordinates': {
      type: SchemaFieldTypes.GEO,
      AS: 'coordinates',
    },
  });
}

async function addStateIndex(pipeline, indices) {
  if (indices.includes(STATES_INDEX)) {
    await dropIndex(STATES_INDEX, indices);
  }
  await addIndex(pipeline, STATES_INDEX, 'state:', {
    '$.name': {
      type: SchemaFieldTypes.TAG,
      AS: 'name',
    },
    '$.abbreviation': {
      type: SchemaFieldTypes.TAG,
      AS: 'abbreviation',
    },
  });
}

async function dropIndex(index, indices) {
  if (indices.includes(index)) {
    redis.ft.dropIndex(index);
  }
}

async function addIndex(pipeline, index, prefix, schema) {
  await pipeline.ft.create(index, schema, {
    ON: 'JSON',
    PREFIX: prefix,
  });
}

async function loadData() {
  let pipeline = redis.multi();
  let id = 1;

  return new Promise((resolve) => {
    fs.createReadStream('data/haunted_places.csv')
      .pipe(csv())
      .on('data', (data) => {
        addPlace(pipeline, id++, data);
        addCity(pipeline, data);
        addState(pipeline, data);
      })
      .on('end', () => resolve(pipeline.exec()));
  });
}

async function addPlace(pipeline, id, data) {
  let { location, description, longitude, latitude, city, state_abbrev } = data;

  pipeline.json.set(`place:${id}`, '$', {
    id,
    location,
    description,
    coordinates: buildCoordinateString(latitude, longitude),
    city,
    state: state_abbrev,
  });
}

async function addCity(pipeline, data) {
  let { city, state_abbrev, city_longitude, city_latitude } = data;

  pipeline.json.set(`city:${city}:${state_abbrev}`, '$', {
    name: city,
    state: state_abbrev,
    coordinates: buildCoordinateString(city_latitude, city_longitude),
  });
}

async function addState(pipeline, data) {
  let { state, state_abbrev } = data;

  pipeline.json.set(`state:${state_abbrev}`, '$', {
    name: state,
    abbreviation: state_abbrev,
  });
}

function buildCoordinateString(latitude, longitude) {
  return longitude && latitude ? `${longitude},${latitude}` : '';
}

async function flushAll() {
  return redis.flushAll();
}

async function quit() {
  return redis.quit();
}

async function main() {
  //await flushAll();
  await addIndices();
  //await loadData();
  await quit();
}

main();
