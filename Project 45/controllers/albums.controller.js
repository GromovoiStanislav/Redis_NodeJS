import { albumsRepository as repository, EntityId } from '../db/db.config.js';

/*
  GetAll: retrieve all album objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/albums/?offset=10&count=10
*/
export const getAll = async (req, res) => {
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  //const albums = await repository.search().returnAll();

  await repository
    .search()
    .sortAsc('id')
    .return.page(offset, count)
    .then((albums) =>
      res.json(
        albums.map((album) => ({
          entityID: album[EntityId],
          ...album,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetAll: retrieve all album objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/users/:userId/albums/?offset=10&count=10
*/
export const getAllByUserId = async (req, res) => {
  const userId = req.params.userId;

  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  await repository
    .search()
    .where('userId')
    .eq(userId)
    .sortAsc('id')
    .return.page(offset, count)
    .then((albums) =>
      res.json(
        albums.map((album) => ({
          entityID: album[EntityId],
          ...album,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetOne: Retrieve a single album with a given entityID
  Example Call:
  GET - api/albums/{id}
*/
export const getOne = async (req, res) => {
  const id = req.params.id;

  await repository
    .search()
    .where('id')
    .eq(id)
    .returnFirst()
    .then((album) => res.json({ entityID: album[EntityId], ...album }))
    .catch((e) => res.json({ error: e.message }));
};
