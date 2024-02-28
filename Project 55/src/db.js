import 'dotenv/config';
import { createClient } from 'redis';
import { EntityId, Repository, Schema } from 'redis-om';

export const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

await client.connect();

const schema = new Schema(
  'Car',
  {
    make: { type: 'string' },
    model: { type: 'string' },
    image: { type: 'string' },
    description: { type: 'text', textSearch: true },
  },
  {
    dataStructure: 'JSON',
  }
);

const repository = new Repository(schema, client);
await repository.createIndex();

const carExist = async (id) => client.EXISTS(`Car:${id}`);

export const createCar = async (data) => {
  const car = await repository.save(data);
  return car[EntityId];
};

export const getCar = async (id) => {
  const exist = await carExist(id);
  if (!exist) {
    return null;
  }

  const car = await repository.fetch(id);
  return { id: car[EntityId], ...car };
};

export const getCars = async () => {
  const cars = await repository.search().returnAll();
  return cars.map((car) => ({ id: car[EntityId], ...car }));
};

export const searchCars = async (q) => {
  const cars = await repository
    .search()
    .where('make')
    .eq(q)
    .or('model')
    .eq(q)
    .or('description')
    .matches(q)
    .return.all();

  return cars.map((car) => ({ id: car[EntityId], ...car }));
};
