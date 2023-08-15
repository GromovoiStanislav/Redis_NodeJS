import express, { json, urlencoded } from 'express';
import { engine } from 'express-handlebars';
import methodOverride from 'method-override';
import { createClient } from 'redis';

// Create Redis Client
let client = createClient();
await client.connect();
console.log('Connected to Redis...');

const app = express();

// View Engine
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(json());
app.use(urlencoded({ extended: false }));

// methodOverride
app.use(methodOverride('_method'));

app.get('/', async (req, res, next) => {
  res.render('searchusers');
});

app.post('/user/search', async (req, res, next) => {
  let id = req.body.id;

  const obj = await client.hGetAll(id);

  if (!obj) {
    res.render('searchusers', {
      error: 'User does not exist',
    });
  } else {
    obj.id = id;
    res.render('details', {
      user: obj,
    });
  }
});

app.get('/user/add', async (req, res, next) => {
  res.render('adduser');
});

app.post('/user/add', async (req, res, next) => {
  const { id, first_name, last_name, email, phone } = req.body;

  await client
    .multi()
    .hSet(`${id}`, 'first_name', first_name)
    .hSet(`${id}`, 'last_name', last_name)
    .hSet(`${id}`, 'email', email)
    .hSet(`${id}`, 'phone', phone)
    .exec();

  res.redirect('/');
});

app.delete('/user/delete/:id', async (req, res, next) => {
  client.del(req.params.id);
  res.redirect('/');
});

const port = 3000;
app.listen(port, async () => {
  console.log('Server started on port ' + port);
});
