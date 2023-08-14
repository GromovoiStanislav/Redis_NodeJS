import { Repository, Schema, EntityId } from 'redis-om';

import client from './client.js';

const personSchema = new Schema('Person', {
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  age: { type: 'number' },
  verified: { type: 'boolean' },
  location: { type: 'point' },
  locationUpdated: { type: 'date' },
  skills: { type: 'string[]' },
  personalStatement: { type: 'text' },
});

export const personRepository = new Repository(personSchema, client);
await personRepository.createIndex();

const personExist = async (id) => client.EXISTS(`Person:${id}`);

export { EntityId, personExist };
