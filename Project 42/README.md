## Redis Keyspace Notifications (JS)\*

in redis-cli or the command line in RedisInsight:

```bash
$ redis-cli
127.0.0.1:6379> config set notify-keyspace-events Ksg
>>>
"OK"
```

verify that your configuration changes are active using redis-cli or the command line in RedisInsight:

```bash
$ redis-cli
127.0.0.1:6379> config get notify-keyspace-events
>>>
1) "notify-keyspace-events"
2) "gsK"
```

Run Application:

```bash
npm run start:consumer
```

Generating Events:

```bash
$ redis-cli
127.0.0.1:6379> sadd tokens:simon a b c
(integer) 3
127.0.0.1:6379> sadd tokens:suze a d e f
(integer) 4
127.0.0.1:6379> sadd tokens:steve a b c f g
(integer) 5
```

Take a look at the terminal where the Node.js application is running:

```
event >>> sadd on __keyspace@0__:tokens:simon
Set cardinality tokens:simon is 3
Scores:
[ { value: 'simon', score: 3 } ]
event >>> sadd on __keyspace@0__:tokens:suze
Set cardinality tokens:suze is 4
Scores:
[ { value: 'suze', score: 4 }, { value: 'simon', score: 3 } ]
event >>> sadd on __keyspace@0__:tokens:steve
Set cardinality tokens:steve is 5
Scores:
[
  { value: 'steve', score: 5 },
  { value: 'suze', score: 4 },
  { value: 'simon', score: 3 }
]
```

Let's remove a token from one user, and delete another entirely:

```bash
$ redis-cli
127.0.0.1:6379> srem tokens:steve c
(integer) 1
127.0.0.1:6379> del tokens:simon
(integer) 1
```

The output from the Node.js application looks like this:

```
event >>> srem on __keyspace@0__:tokens:steve
Set cardinality tokens:steve is 4
Scores:
[
  { value: 'suze', score: 4 },
  { value: 'steve', score: 4 },
  { value: 'simon', score: 3 }
]
event >>> del on __keyspace@0__:tokens:simon
Set cardinality tokens:simon is 0
Scores:
[ { value: 'suze', score: 4 }, { value: 'steve', score: 4 } ]
```
