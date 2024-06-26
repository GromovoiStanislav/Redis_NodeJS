import 'dotenv/config';
import csv from 'csv-parser';
import fs from 'node:fs';
import { createClient } from 'redis';
import Redis from 'ioredis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});
await redis.connect();

const PLACES_INDEX = 'places:index';
const CITIES_INDEX = 'cities:index';
const STATES_INDEX = 'states:index';

async function addIndices() {
  let redis = new Redis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379');
  let indices = await redis.call('FT._LIST');

  let pipeline = redis.pipeline();
  addPlaceIndex(pipeline, indices);
  addCityIndex(pipeline, indices);
  addStateIndex(pipeline, indices);
  pipeline.exec();
  redis.quit();
  return;
}

function addPlaceIndex(pipeline, indices) {
  if (indices.includes(PLACES_INDEX)) {
    dropIndex(pipeline, PLACES_INDEX, indices);
  }
  addIndex(
    pipeline,
    PLACES_INDEX,
    'place:',
    'location',
    'TEXT',
    'description',
    'TEXT',
    'coordinates',
    'GEO',
    'city',
    'TAG',
    'state',
    'TAG'
  );
}

function addCityIndex(pipeline, indices) {
  if (indices.includes(CITIES_INDEX)) {
    dropIndex(pipeline, CITIES_INDEX, indices);
  }
  addIndex(
    pipeline,
    CITIES_INDEX,
    'city:',
    'name',
    'TAG',
    'state',
    'TAG',
    'coordinates',
    'GEO'
  );
}

function addStateIndex(pipeline, indices) {
  if (indices.includes(STATES_INDEX)) {
    dropIndex(pipeline, STATES_INDEX, indices);
  }
  addIndex(
    pipeline,
    STATES_INDEX,
    'state:',
    'name',
    'TAG',
    'abbreviation',
    'TAG'
  );
}

function dropIndex(pipeline, index, indices) {
  if (indices.includes(index)) {
    pipeline.call('FT.DROPINDEX', index);
  }
}

function addIndex(pipeline, index, prefix, ...schema) {
  pipeline.call(
    'FT.CREATE',
    index,
    'ON',
    'hash',
    'PREFIX',
    1,
    prefix,
    'SCHEMA',
    ...schema
  );
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

  pipeline.hSet(`place:${id}`, {
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

  pipeline.hSet(`city:${city}:${state_abbrev}`, {
    name: city,
    state: state_abbrev,
    coordinates: buildCoordinateString(city_latitude, city_longitude),
  });
}

async function addState(pipeline, data) {
  let { state, state_abbrev } = data;

  pipeline.hSet(`state:${state_abbrev}`, {
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
  await flushAll();
  await addIndices();
  await loadData();
  await quit();
}

main();
