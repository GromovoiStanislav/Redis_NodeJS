import { Router } from 'express';
import { personRepository, EntityId, personExist } from '../om/person.js';
import { client } from '../om/client.js';

export const router = Router();

// CREATE
router.post('/', async (req, res) => {
  /* create the Person from the request body which just
   *happens* to match our Schema */
  const person = await personRepository.save(req.body);

  /* return the newly created Person */
  //res.send(person);
  res.send({
    id: person[EntityId],
    ...person,
  });
});

// READ
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  const exist = await personExist(id);
  if (!exist) {
    res.send({ id: 'Not found' });
    return;
  }

  /* fetch the Person */
  const person = await personRepository.fetch(id);

  /* return the fetched Person */
  //res.send(person);
  res.send({
    id: person[EntityId],
    ...person,
  });
});

// UPDATE
router.put('/:id', async (req, res) => {
  const id = req.params.id;

  const exist = await personExist(id);
  if (!exist) {
    res.send({ id: 'Not found' });
    return;
  }

  /* fetch the Person we are updating */
  const person = await personRepository.fetch(id);

  /* set all the properties */
  person.firstName = req.body.firstName ?? person.firstName;
  person.lastName = req.body.lastName ?? person.lastName;
  person.age = req.body.age ?? person.age;
  person.verified = req.body.verified ?? person.verified;
  person.location = req.body.location ?? person.location;
  person.locationUpdated = req.body.locationUpdated ?? person.locationUpdated;
  person.skills = req.body.skills ?? person.skills;
  person.personalStatement =
    req.body.personalStatement ?? person.personalStatement;

  /* save the updated Person */
  await personRepository.save(person);

  /* return the newly updated Person we just updated */
  //res.send(person);
  res.send({
    id: person[EntityId],
    ...person,
  });
});

// DELETE
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  const exist = await personExist(id);
  if (!exist) {
    res.send({ id: 'Not found' });
    return;
  }

  /* delete the Person with its id */
  await personRepository.remove(id);

  /* delete the log the location update */
  //await client.xDel(`${id}:locationHistory`, ['1692001965495-0']); // удаляет конкретные записи из стрима
  //await client.xTrim(`${id}:locationHistory`, 'MAXLEN', 0); // очищает стрим от всех записей
  await client.del(`${id}:locationHistory`); // удаляет сам стирм

  /* return the id of the deleted person */
  res.send({ id });
});
