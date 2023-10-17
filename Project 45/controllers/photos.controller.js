import { photosRepository as repository, EntityId } from '../db/db.config.js';

/*
  GetAll: retrieve all photos objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/photos?offset=10&count=10
*/
export const getAll = async (req, res) => {
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  //const photos = await repository.search().returnAll();

  await repository
    .search()
    .sortAsc('id')
    .return.page(offset, count)
    .then((photos) =>
      res.json(
        photos.map((photo) => ({
          entityID: photo[EntityId],
          ...photo,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetAll: retrieve all photos objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/albums/:albumId/photos?offset=10&count=10
*/
export const getAllByAlbumId = async (req, res) => {
  const albumId = req.params.albumId;

  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  await repository
    .search()
    .where('albumId')
    .eq(albumId)
    .sortAsc('id')
    .return.page(offset, count)
    .then((photos) =>
      res.json(
        photos.map((photo) => ({
          entityID: photo[EntityId],
          ...photo,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetOne: Retrieve a single photo with a given entityID
  Example Call:
  GET - api/photos/{id}
*/
export const getOne = async (req, res) => {
  const id = req.params.id;

  await repository
    .search()
    .where('id')
    .eq(id)
    .returnFirst()
    .then((photo) => res.json({ entityID: photo[EntityId], ...photo }))
    .catch((e) => res.json({ error: e.message }));
};
