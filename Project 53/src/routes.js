import Router from '@koa/router';
import { EntityId, postRepository, personExist } from './db.js';

const router = new Router();

router.get('/post', async (ctx) => {
  const allPosts = await postRepository.search().returnAll();
  ctx.body = allPosts.map((post) => ({ id: post[EntityId], ...post }));
});

router.get('/post/:id', async (ctx) => {
  const postId = ctx.params.id;

  const exist = await personExist(postId);
  if (!exist) {
    ctx.body = { id: 'Not found' };
    return;
  }

  const post = await postRepository.fetch(postId);
  ctx.body = { id: post[EntityId], ...post };
});

router.post('/post', async (ctx) => {
  const post = await postRepository.save({
    ...ctx.request.body,
  });

  ctx.body = { id: post[EntityId], ...post };
});

router.put('/post/:id', async (ctx) => {
  const postId = ctx.params.id;

  const exist = await personExist(postId);
  if (!exist) {
    ctx.body = { id: 'Not found' };
    return;
  }

  const post = await postRepository.fetch(postId);

  Object.entries(ctx.request.body).forEach(([key, val]) => {
    post[key] = val;
  });

  const postUpdate = await postRepository.save(post);
  ctx.body = { postUpdate, post };
});

router.delete('/post/:id', async (ctx) => {
  const postId = ctx.params.id;

  const exist = await personExist(postId);
  if (!exist) {
    ctx.body = { id: 'Not found' };
    return;
  }

  await postRepository.remove(postId);
  ctx.body = { postId };
});

export { router };
