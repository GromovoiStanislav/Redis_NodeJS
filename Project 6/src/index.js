import 'dotenv/config';
import express from 'express';
import { Repository, EntityId } from 'redis-om';
import { createClient } from 'redis';
import { taskSchema } from './schema/task.schema.js';

const app = express();
app.use(express.json());

const client = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

await client.connect();

const taskRepository = new Repository(taskSchema, client);

await taskRepository.dropIndex();
await taskRepository.createIndex();

app.get('/tasks', async (req, res) => {
  const tasks = await taskRepository.search().returnAll();

  res.send(
    tasks.map((task) => ({
      id: task[EntityId],
      ...task,
    }))
  );
});

app.get('/tasks/completed', async (req, res) => {
  const tasks = await taskRepository
    .search()
    .where('complete')
    .equals(true)
    .return.all();

  res.send(
    tasks.map((task) => ({
      id: task[EntityId],
      ...task,
    }))
  );
});

app.get('/tasks/name/:name', async (req, res) => {
  const tasks = await taskRepository
    .search()
    .where('name')
    //.equals('Mushroomhead')
    .matches(req.params.name)
    .and('complete')
    .equals(false)
    //.and('year').is.greaterThan(2000)
    .return.all();

  res.send(
    tasks.map((task) => ({
      id: task[EntityId],
      ...task,
    }))
  );
});

app.get('/tasks/uncompleted', async (req, res) => {
  const tasks = await taskRepository
    .search()
    .where('complete')
    .equals(false)
    .return.all();

  res.send(
    tasks.map((task) => ({
      id: task[EntityId],
      ...task,
    }))
  );
});

app.get('/tasks/:id', async (req, res) => {
  const task = await taskRepository.fetch(req.params.id);

  res.send({
    id: task[EntityId],
    ...task,
  });
});

app.post('/tasks', async (req, res) => {
  let task = {
    name: req.body.name,
    complete: false,
  };

  //task = await taskRepository.save('BWOMP', task); // id='BWOMP'
  task = await taskRepository.save(task); // id=ulid()

  res.send({
    id: task[EntityId],
    ...task,
  });
});

app.put('/tasks/:id', async (req, res) => {
  const task = await taskRepository.fetch(req.params.id);

  task.complete = req.body.complete;
  await taskRepository.save(task);

  res.send(task);
});

app.delete('/tasks/:id', async (req, res) => {
  const exists = await client.exists(`task:${req.params.id}`);
  if (exists) {
    await taskRepository.remove(req.params.id);
    res.send('OK');
  } else {
    res.send('Not found');
  }

  //   const ttlInSeconds = 12 * 60 * 60  // 12 hours
  //   await taskRepository.expire('01FJYWEYRHYFT8YTEGQBABJ43J', ttlInSeconds)
});

const PORT = 3000;
app.listen(PORT);
console.log(`Express server listening at http://localhost:${PORT}`);
