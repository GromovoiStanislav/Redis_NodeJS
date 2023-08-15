import { Router } from 'express';

import {
  createCar,
  findCarById,
  getAll,
  searchCars,
  carExist,
  putCar,
  updateCar,
  deleteCar,
} from './repository.js';

export const router = Router();

router.post('/', async (req, res) => {
  const car = await createCar(req.body);
  res.status(201).json(car);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const exist = await carExist(id);
  if (!exist) {
    res.status(404).json({ id: 'Not found' });
    return;
  }

  const car = await putCar(id, req.body);
  res.status(200).json(car);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  const exist = await carExist(id);
  if (!exist) {
    res.status(404).json({ id: 'Not found' });
    return;
  }

  const car = await updateCar(id, req.body);

  res.status(200).json(car);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const exist = await carExist(id);
  if (!exist) {
    res.status(404).json({ id: 'Not found' });
    return;
  }

  const car = await findCarById(id);
  res.status(200).json(car);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const exist = await carExist(id);
  if (!exist) {
    res.status(404).json({ id: 'Not found' });
    return;
  }

  await deleteCar(req.params.id);
  res.type('application/json');
  res.send({ status: 'OK' });
});

router.get('/', async (req, res) => {
  const cars = await getAll();
  res.status(200).json(cars);
});

router.get('/search/:q', async (req, res) => {
  const cars = await searchCars(req.params.q);
  res.status(200).json(cars);
});
