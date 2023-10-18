import { todosRepository as repository, EntityId } from '../db/db.config.js';

/*
  GetAll: retrieve all todo objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/todos/?offset=10&count=10
*/
export const getAll = async (req, res) => {
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  //const todos = await repository.search().return.all();

  await repository
    .search()
    .sortAsc('id')
    .return.page(offset, count)
    .then((todos) =>
      res.json(
        todos.map((todo) => ({
          entityID: todo[EntityId],
          ...todo,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

export const getAllCompleted = async (req, res) => {
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  await repository
    .search()
    .sortAsc('id')
    .where('completed')
    .true()
    .return.page(offset, count)
    .then((todos) =>
      res.json(
        todos.map((todo) => ({
          entityID: todo[EntityId],
          ...todo,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

export const getAllNotCompleted = async (req, res) => {
  const offset = req.query.offset || 0;
  const count = req.query.count || 10;

  await repository
    .search()
    .sortAsc('id')
    .where('completed')
    .false()
    .return.page(offset, count)
    .then((todos) =>
      res.json(
        todos.map((todo) => ({
          entityID: todo[EntityId],
          ...todo,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetAll: retrieve all todo objects within Redis with a given offset and count
  (defaults to offset 0, default 10)
  Example Call:
  GET - api/users/:userId/todos/?offset=10&count=10
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
    .then((todos) =>
      res.json(
        todos.map((todo) => ({
          entityID: todo[EntityId],
          ...todo,
        }))
      )
    )
    .catch((e) => res.json({ error: e.message }));
};

/*
  GetOne: Retrieve a single todo with a given entityID
  Example Call:
  GET - api/todos/{id}
*/
export const getOne = async (req, res) => {
  const id = req.params.id;

  await repository
    .search()
    .where('id')
    .eq(id)
    .return.first()
    .then((todo) => res.json({ entityID: todo[EntityId], ...todo }))
    .catch((e) => res.json({ error: e.message }));
};
