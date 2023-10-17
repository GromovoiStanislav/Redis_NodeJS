import { personRepository as repository, EntityId } from '../db/db.config.js';

/*
  GetAll: retrieve all album objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/persons/?offset=10&count=10
*/
export const getAll = async (req, res) => {
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  await repository
    .search()
    .return.page(offset, count)
    .then((persons) =>
      res.json(
        persons.map((person) => ({
          entityID: person[EntityId],
          ...person,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetOne: Retrieve a single album with a given entityID
  Example Call:
  GET - api/person/{entityID}
*/
export const getOne = async (req, res) => {
  const entityID = req.params.entityID;

  // try {
  //   const album = await repository.fetch(entityID);
  //   res.json({
  //     entityID: album[EntityId],
  //     ...album,
  //   });
  // } catch (e) {
  //   res.json({ error: e.message });
  // }

  await repository
    .fetch(entityID)
    .then((person) => res.json({ entityID: person[EntityId], ...person }))
    .catch((e) => res.json({ error: e.message }));
};
