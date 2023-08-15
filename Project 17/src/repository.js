import { Schema, Repository, EntityId } from 'redis-om';
import { redis } from './redis.js';

const schema = new Schema(
  'car',
  {
    make: { type: 'string' },
    model: { type: 'string' },
    image: { type: 'string' },
    description: { type: 'text' },
  },
  { dataStructure: 'JSON' }
);

const repository = new Repository(schema, redis);
await repository.createIndex();

export async function carExist(id) {
  return redis.EXISTS(`car:${id}`);
}

export async function createCar(data) {
  const car = await repository.save(data);
  return {
    id: car[EntityId],
    ...car,
  };
}

export async function putCar(id, data) {
  const car = await repository.save(id, data);

  return {
    id: car[EntityId],
    ...car,
  };
}

export async function updateCar(id, data) {
  const car = await repository.fetch(id);

  car.make = data.make ?? car.make;
  car.model = data.model ?? car.model;
  car.image = data.make ?? car.image;
  car.description = data.description ?? car.description;

  await repository.save(car);

  return {
    id: car[EntityId],
    ...car,
  };
}

export async function searchCars(q) {
  const cars = await repository
    .search()
    .where('make')
    .eq(q)
    .or('model')
    .eq(q)
    .or('description')
    .match(q)
    .return.all();

  return cars.map((car) => ({
    id: car[EntityId],
    ...car,
  }));
}

export async function getAll() {
  const cars = await repository.search().return.all();

  return cars.map((car) => ({
    id: car[EntityId],
    ...car,
  }));
}

export async function findCarById(id) {
  const car = await repository.fetch(id);

  return {
    id: car[EntityId],
    ...car,
  };
}

export async function deleteCar(id) {
  await repository.remove(id);
}
