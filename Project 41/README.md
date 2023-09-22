## Redis Streams Jobs (JS)\*\*

#### Start the Producer:

```
npm run start:producer
```

You should see the Producer creating new jobs every few seconds:

```
Created job 1695376179284-0: { room: '487', job: 'extra_towels' }
Created job 1695376187292-0: { room: '104', job: 'extra_pillows' }
Created job 1695376206303-0: { room: '139', job: 'cleaning' }
```

#### Start the Consumer:

```
npm run start:consumer
```

You should see the Consumer reading jobs from the stream and printing the details of each one:

```
Checking for jobs...
Performing job 1695375950566-0: {"room":"351","job":"extra_towels"}

Checking for jobs...
Performing job 1695375956579-0: {"room":"392","job":"extra_towels"}

Checking for jobs...
Nothing to do right now, sleeping...
```

#### Start the Consumer Groupe:

```
npm run start:consumer-group <name1>
npm run start:consumer-group <name2>
```

Each Consumer Group Consumer should be allocated jobs and display their details, then acknolwedge receipe of the job with Redis:

```
Starting consumer <name>.
Created consumer group.

Performing job 1695375981502-0: {"room":"422","job":"room_service"}
Acknowledged processing of job 1695375981502-0

Performing job 1695375991505-0: {"room":"265","job":"taxi"}
Acknowledged processing of job 1695375991505-0

Performing job 1695376001509-0: {"room":"346","job":"extra_towels"}
Acknowledged processing of job 1695376001509-0
```
