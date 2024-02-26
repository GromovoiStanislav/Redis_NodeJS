import { redis } from './lib/redis.js';

const main = async () => {
  redis
    .pipeline()
    .xadd('list-stream', '*', 'id', 'item1', 'name', 'Tom')
    .xadd('list-stream', '*', 'id', 'item2', 'name', 'Toma')
    .xadd('list-stream', '*', 'id', 'item3', 'name', 'Tomas')
    .exec();

  const items = await redis.xrange('list-stream', '-', '+', 'COUNT', 2);
  console.log(items);
  // [
  //   [ '1647321710097-0', [ 'id', 'item1', 'name', 'Tom' ] ],
  //   [ '1647321710098-0', [ 'id', 'item2', 'name', 'Toma' ] ]
  // ]
};

main();
