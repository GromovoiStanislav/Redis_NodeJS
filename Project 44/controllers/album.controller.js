import albumsList from '../db/albumsList.json' assert { type: 'json' };
import usersList from '../db/usersList.json' assert { type: 'json' };

import { client, repository, EntityId } from '../db/db.config.js';

/*
  Reload: Refreshes db with data from user.json and albumsList.json.
  Also reindexes the database to update any changes made to the schema.
  Example Call:
  POST - api/reload/
*/
export const reload = async (req, res) => {
  await client.flushAll();

  albumsList.forEach(async (albumJSON, index) => {
    const ownerIndex = index % usersList.length;
    albumJSON.owner = usersList[ownerIndex].username;
    await repository.save(albumJSON);
  });
  try {
    await repository.dropIndex();
    await repository.createIndex();
    res.sendStatus(201);
  } catch (e) {
    res.json({ error: e.message });
  }
};

/* 
  Create: creates an album entry based on the req.body data.
  Example Call: 
  POST - api/albums/
  body: { artist: "The Offspring",
          title: "Smash",
          condition: 8,
          format: "CD", comments: "Amazing sophomore album by a great LA band",
          price: 8,
          forSale: true
        }
*/
export const create = async (req, res) => {
  const albumData = req.body;
  albumData.condition = parseInt(albumData.condition);
  albumData.price = parseInt(albumData.price);

  await repository
    .save(albumData)
    .then(async (album) =>
      res.json({
        id: album[EntityId],
        ...album,
      })
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetAll: retrieve all album objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/albums/?offset=10&count=10
*/
export const getAll = async (req, res) => {
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  await repository
    .search()
    .return.page(offset, count)
    .then((albums) =>
      res.json(
        albums.map((album) => ({
          id: album[EntityId],
          ...album,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetOne: Retrieve a single album with a given entityID
  Example Call:
  GET - api/albums/{entityID}
*/
export const getOne = async (req, res) => {
  const entityID = req.params.entityID;

  // try {
  //   const album = await repository.fetch(entityID);
  //   res.json({
  //     id: album[EntityId],
  //     ...album,
  //   });
  // } catch (e) {
  //   res.json({ error: e.message });
  // }

  await repository
    .fetch(entityID)
    .then((album) => res.json({ id: album[EntityId], ...album }))
    .catch((e) => res.json({ error: e.message }));
};

/*
  Search: Perform a simple search with one parameter
  Example Call:
  GET - api/albums/search?artist=Sleep
*/

export const search = async (req, res) => {
  const queryParams = req.query;
  let property, value;

  for (let key in queryParams) {
    property = key;
    value = queryParams[key];
  }

  await repository
    .search()
    .where(property)
    .matches(value)
    .all()
    .then((albums) =>
      res.json(
        albums.map((album) => ({
          id: album[EntityId],
          ...album,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  Update: update the values of an existing album with data passed in via body.
  entityId must be passed as a parameter.
  Example Call:
    PUT - api/albums/{entityID}
    body: { artist: updatedValue, comments: updatedValue }
*/
export const update = async (req, res) => {
  const entityID = req.params.entityID;

  const updateData = req.body;
  if (updateData.condition) {
    updateData.condition = parseInt(updateData.condition);
  }
  if (updateData.price) {
    updateData.price = parseInt(updateData.price);
  }

  // Retrieve existing album
  const album = await repository.fetch(entityID);
  // map updated data onto existing data

  Object.assign(album, updateData);
  // save album
  await repository
    .save(album)
    .then((album) => res.json({ id: album[EntityId], ...album }))
    .catch((e) => res.json({ error: e.message }));
};

/*
  Delete: Remove a single album from the database
  Example Call:
  DELETE - /api/albums/{entityID}
*/
export const deleteAlbum = async (req, res) => {
  const entityID = req.params.entityID;
  await repository
    .remove(entityID)
    .then((response) => res.sendStatus(200))
    .catch((e) => res.json({ error: e.message }));
};
