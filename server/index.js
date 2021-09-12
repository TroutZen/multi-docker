const keys = require('./keys');

// Express App Setup
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // allows us to make requests from react app to different domain
app.use(express.json());

// Postgres client setup
const Pool = require('pg-pool');

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on('error', (err) => {
  console.error(err);
});

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});


// Redis setup
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

// According to docs need to have sub and pub on different cxns (hence duplicate)
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  res.send('hi');
});

// NOTE(Devin): In production I could proxy requests through an express server
// that is also serving static files. That way I do not need nginx, though it could be cleaner to have nginx
app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');

  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.send(422).send('Index too high');
  };

  // nothing yet bc we async worker has not run
  redisClient.hset('values', index, 'Nothing yet!');

  // Publish on 'insert' to take up the worker that is subbed to insert
  redisPublisher.publish('insert', index);

  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, () => {
  console.log('listening on port 5000');
});