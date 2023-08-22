import { client } from './lib/redis.js';


console.log('===================zset===========================');

console.log('zadd', await client.zadd('sortedSet', 1, 'one', 2, 'two', 4, 'quatro', 3, 'three'))//Add one or more members to a sorted set, or update its score if it already exists 
console.log('zadd', await client.zadd('sortedSet', 0, 'zerro', 10, 'ten'))

console.log('zrange', await client.zrange('sortedSet', 0, -1, 'WITHSCORES'))//Return a range of members in a sorted set
console.log('zcard', await client.zcard('sortedSet'))//Get the number of members in a sorted set
console.log('zcount', await client.zcount('sortedSet', 2, 10))//Count the members in a sorted set with scores within the given values

console.log('zincrby', await client.zincrby('sortedSet', 1, 'ten'))//Increment the score of a member in a sorted set

console.log('zscore', await client.zscore('sortedSet', 'ten'))//Get the score associated with the given member in a sorted set
console.log('zscore', await client.zscore('sortedSet', ['ten']))//Get the score associated with the given member in a sorted set


console.log('zrange', await client.zrange('sortedSet', 0, -1, 'WITHSCORES'))
console.log('zrangebyscore', await client.zrangebyscore('sortedSet', 1, 100, 'WITHSCORES'))//Return a range of members in a sorted set, by score

console.log('zrevrange', await client.zrevrange('sortedSet', 0, -1, 'WITHSCORES'))//Return a range of members in a sorted set, by index, with scores ordered from high to low
console.log('zrevrange', await client.zrevrange('sortedSet', -2, -1, 'WITHSCORES'))
console.log('zrevrange', await client.zrevrange('sortedSet', 2, 3, 'WITHSCORES'))

console.log('zrevrangebyscore', await client.zrevrangebyscore('sortedSet', 100, 1, 'WITHSCORES'))//Return a range of members in a sorted set, by score, with scores ordered from high to low

console.log('zrank', await client.zrank('sortedSet','quatro'))//Determine the index of a member in a sorted set
console.log('zrank', await client.zrank('sortedSet','undefined'))//null

console.log('zrevrank', await client.zrevrank('sortedSet','quatro'))//Determine the index of a member in a sorted set, with scores ordered from high to low


console.log('zscan', await client.zscan('sortedSet',0)); //Incrementally iterate sorted sets elements and associated scores


console.log('zrem', await client.zrem('sortedSet','ten'))//Remove one or more members from a sorted set
console.log('zrem', await client.zrem('sortedSet',['ten','quatro']))//Remove one or more members from a sorted set
console.log('zrange', await client.zrange('sortedSet', 0, -1, 'WITHSCORES'))


console.log('zadd', await client.zadd('sortedSet', 4, 'quatro', 10, 'ten'))
console.log('zremrangebyrank', await client.zremrangebyrank('sortedSet',4, -1))//Remove all members in a sorted set within the given indexes
console.log('zrange', await client.zrange('sortedSet', 0, -1, 'WITHSCORES'))

console.log('zadd', await client.zadd('sortedSet', 4, 'quatro', 10, 'ten'))
console.log('zremrangebyscore', await client.zremrangebyscore('sortedSet',2, 4))//Remove all members in a sorted set within the given scores
console.log('zrange', await client.zrange('sortedSet', 0, -1, 'WITHSCORES'))



console.log('type', await client.type('sortedSet')); //zset
console.log('del', await client.del('sortedSet'))//1
console.log('type', await client.type('sortedSet')); //none

console.log('===================Exit===========================');

setTimeout(async () => {
  if (client) {

    //await client.flushall(); //Очистка ВСЕХ данных
    await client.flushdb(); //Очистка ВСЕХ данных

    //await client.disconnect();
    await client.quit();
  }
  if (redisServer) {
    await redisServer.stop();
  }
}, 10 * 1000);
