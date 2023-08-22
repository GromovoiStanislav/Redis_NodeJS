import { client } from './lib/redis.js';

console.log('===================Set===========================');

console.log('sadd', await client.sadd('users:1:tokens', 'Tm1='))//Add one or more members to a set
console.log('sadd', await client.sadd('users:1:tokens', 'Tm1='))
console.log('sadd', await client.sadd('users:1:tokens', ['Tm2=','Tm3=','Tm4=','Tm5=','Tm6=','Tm7=','Tm22=']))

console.log('smembers',await client.smembers('users:1:tokens'))//Get all the members in a set
console.log('scard',await client.scard('users:1:tokens'))//Get the number of members in a set


await client.sadd('users:2:tokens', ['Tm2=','Tm3=','Tm14=','Tm15=','Tm16=','Tm17=','Tm22='])
console.log('sdiffstore', await client.sdiffstore('diff', ['users:2:tokens','users:1:tokens']))//Subtract multiple sets and store the resulting set in a key
console.log('smembers diff',await client.smembers('diff'))
console.log('sdiffstore', await client.sdiffstore('diff', ['users:1:tokens','users:2:tokens']))//Subtract multiple sets and store the resulting set in a key
console.log('smembers diff',await client.smembers('diff'))


console.log('sscan', await client.sscan('users:1:tokens',0,"MATCH",'Tm2*'));//Incrementally iterate Set elements
cursor = await client.sscan('users:1:tokens',0)
console.log('scan',cursor)
while (+cursor[0]>0){
  cursor = await client.sscan('users:1:tokens',cursor[0])
  console.log('sscan',cursor)
}


console.log('srandmember',await client.srandmember('users:1:tokens'))//Get one or multiple random members from a set
console.log('srandmember',await client.srandmember('users:1:tokens', 2))//Get one or multiple random members from a set

console.log('srem',await client.srem('users:1:tokens', 'Tm0='))//Remove one or more members from a set
console.log('srem',await client.srem('users:1:tokens', 'Tm1='))//Remove one or more members from a set
console.log('srem',await client.srem('users:1:tokens', ['Tm2=','Tm7=']))//Remove one or more members from a set

console.log('smove', await client.smove('users:1:tokens','users:2:tokens', 'Tm3='))//Move a member from one set to another
console.log('smembers',await client.smembers('users:1:tokens'))//Get all the members in a set
console.log('smembers',await client.smembers('users:3:tokens'))//Get all the members in a set


console.log('spop',await client.spop('users:1:tokens'))//Remove and return one random members from a set
//console.log('spop',await client.spop('users:1:tokens',2))//Remove and return multiple random members from a set

console.log('smembers',await client.smembers('users:1:tokens'))//Get all the members in a set
console.log('scard',await client.scard('users:1:tokens'))//Get the number of members in a set


console.log('type', await client.type('users:1:tokens')); //set
console.log('del', await client.del('users:1:tokens'))//1
console.log('type', await client.type('users:1:tokens')); //none


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
