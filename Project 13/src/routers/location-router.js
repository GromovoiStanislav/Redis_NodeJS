import { Router } from 'express';
import { personRepository, personExist } from '../om/person.js';
import { client } from '../om/client.js';

export const router = Router();

router.patch('/:id/location/:lng,:lat', async (req, res) => {
  /* extract and coerce the parameters */
  const id = req.params.id;
  const longitude = Number(req.params.lng);
  const latitude = Number(req.params.lat);

  const exist = await personExist(id);
  if (!exist) {
    res.send({ id: 'Not found' });
    return;
  }

  /* set the updated date time to right now */
  const locationUpdated = new Date();

  /* update the location using Redis OM */
  const person = await personRepository.fetch(id);
  person.location = { longitude, latitude };
  person.locationUpdated = locationUpdated;
  await personRepository.save(person);

  /* log the location update to a stream using Node Redis */
  await client.xAdd(
    `${id}:locationHistory`,
    '*',
    JSON.stringify({
      updated: person.locationUpdated,
      location: person.location,
    })
  );

  /* return the changed field */
  res.send({ id, locationUpdated, location: { longitude, latitude } });
});

router.get('/:id/locationHistory', async (req, res) => {
  const id = req.params.id;

  const exist = await personExist(id);
  if (!exist) {
    res.send({ id: 'Not found' });
    return;
  }

  const dataArray = await client.xRange(`${id}:locationHistory`, '-', '+');
  const messages = [];

  for (const data of dataArray) {
    let message = '';
    for (let key in data.message) {
      message += data.message[key];
    }

    try {
      const parsedMessage = JSON.parse(message);
      messages.push(parsedMessage);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
  res.send(messages);
});
