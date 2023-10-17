import { usersRepository as repository, EntityId } from '../db/db.config.js';

/*
  GetAll: retrieve all album objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/users/?offset=10&count=10
*/
export const getAll = async (req, res) => {
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  //const users = await repository.search().returnAll();

  await repository
    .search()
    .sortAsc('id')
    .return.page(offset, count)
    .then((users) =>
      res.json(
        users.map((user) => ({
          entityID: user[EntityId],
          ...user,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetOne: Retrieve a single album with a given entityID
  Example Call:
  GET - api/users/{id}
*/
export const getOne = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await repository.search().where('id').eq(id).returnFirst();
    res.json({
      entityID: user[EntityId],
      ...user,
    });
  } catch (e) {
    res.json({ error: e.message });
  }

  // await repository
  //   .fetch(entityID)
  //   .then((user) => res.json({ entityID: user[EntityId], ...user }))
  //   .catch((e) => res.json({ error: e.message }));
};
