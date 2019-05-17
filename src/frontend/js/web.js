const express = require('express');
const db = require('../../database/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
// const pg = require('pg');
// let counter = 0;

// app.use(cookieSession({
//   name: 'session',
//   secret: 'shh',
//   maxAge: 24 * 60 * 60 * 1000,
// }));

app.use(cookieParser());
app.use(session({
  secret: 'shhshhshshshshsh', // just a long random string
  resave: false,
  saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/../views');
// console.log(__dirname);
app.engine('hbs', hbs( {
  extname: '.hbs',
  defaultView: 'default',
  layoutsDir: __dirname + '/../views/layouts/',
}));

app.get('/', (req, res) => {
  console.log(req.localID);
  db.getSession(req.sessionID, (results) => {
    if (results === null) { // Error encountered
      console.log('error encounterd'); // maybe add session?
      res.redirect('/error');
    } else if (results.rows.length === 0) { // No session data
      // db.addSession(req.sessionID, null, (boo) => {
      //   if (boo == false) {
      //     console.log('rip, error');
      //   } else {
      //     console.log('yay, added, redirection to login page');
      //     res.redirect('/login');
      //   }
      // });
      res.redirect('/login');
    } else if (results.rows[0].discord_id === null) { // Session data but no one is logged in
      console.log('redirect to login page');
      res.redirect('/login');
    } else { // User is logge din
      console.log('redirect to home page');
      res.redirect('/home');
    }
  });
});

app.get('/login', (req, res) => {
  console.log(req.query);
  db.getSession(req.sessionID, (results) => {
    if (results === null) { // Error encountered
      console.log('error encounterd'); // maybe add session?
      res.redirect('/error');
    } else if (results.rows.length === 0) { // No session data
      // db.addSession(req.sessionID, null, (boo) => {
      //   if (boo == false) {
      //     console.log('rip, error');
      //   } else {
      //     console.log('yay, added, redirectiont o login page');
      //     res.redirect('/login');
      //   }
      // });
      res.render('login', {layout: 'default'});
    } else if (results.rows[0].discord_id === null) { // Session data but no one is logged in
      console.log('redirect to login page');
      res.render('login', {layout: 'default'});
    } else { // User is logged in
      console.log('redirect to home page');
      res.redirect('/home');
    }
  });
});

app.post('/login', (req, res) => {
  console.log('POST in /login');
  console.log(req.body);
});

app.get('/signup', (req, res) => {
  db.getSession(req.sessionID, (results) => {
    if (results == null) { // Error encountered
      console.log('error encountered');
      res.redirect('/error');
    } else if (results.rows.length === 0) { // No session data
      res.render('signup', {layout: 'default'});
    } else if (results.rows[0].discord_id === null) { // Session data but no one is logged in
      res.render('signup', {layout: 'default'});
    } else { // User is logged in
      res.redirect('/home');
    }
  });
});

app.get('/error', (req, res) => {
  console.log('error nooo');
  res.render('error', {layout: 'default', data: 'is this', template: 'error-template', subtitle: 'Error'});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


// console.log(process.env.DATABASE_URL);
// const client = new pg.Client({
//   connectionString: ((process.env.DATABASE_URL !== undefined) ? process.env.DATABASE_URL : require('../../../auth.json').db_url),
//   ssl: true,
// });

// client.connect();

// client.query('SELECT * FROM user')

// const user = 'test';
// const discordId = '123';
// const status = 'signing up';

// const queryConfig = {
//   text: 'INSERT INTO users(username, discord_id, status) VALUES($1, $2, $3);',
//   values: ['a', 'ab', 'b'],
// };

// const text = 'INSERT INTO users(username, discord_id, status) VALUES($1, $2, $3);';
// const values = ['{a}', '{ab}', '{b}'];

// client.query(text, values, (error, results) => {
//   if (error) {
//     console.log('OH NO');
//     console.log(error);
//   } else {
//     console.log('OH YES');
//     console.log(results);
//   }
// });

// db.addUser('test', 't_id', 't_status', function(boo) {
//   console.log('Opeartion was successful: ' + boo);
// });

// db.getUser('t_id', function(results) {
//   console.log(results);
// });

// client.query('INSERT INTO users (username, discord_id, status) VALUES ($1, $2, $3);', [user, discordId, status], (error, results) => {
//   if (error) {
//     console.log('OH NO');
//     console.log(error);
//   } else {
//     console.log('OH YES');
//     console.log(results);
//   }
// });

// client.query('SELECT * FROM users;', (err, res) => {
//   if (err) throw err;
//   for (const row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });
