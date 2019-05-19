const express = require('express');
const db = require('../../database/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
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
app.use(flash());
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
      res.render('login', {layout: 'default', subtitle: 'Login'});
    } else if (results.rows[0].discord_id === null) { // Session data but no one is logged in
      console.log('redirect to login page');
      res.render('login', {layout: 'default', subtitle: 'Login'});
    } else { // User is logged in
      console.log('redirect to home page');
      res.redirect('/home');
    }
  });
});

app.post('/login', (req, res) => {
  console.log('POST in /login');
  console.log(req.body);
  let missing = false;
  if (req.body['username_field'] === '') {
    req.flash('username_error', 'Username required');
    missing = true;
  }
  if (req.body['password_field'] === '') {
    missing = true;
  }
  if (missing) {
    return res.render('login', {layout: 'default', subtitle: 'Login',
      username_error: req.flash('username_error'), password_error: 'Password required',
      username: req.body['username_field']});
  }

  db.getUserByUsername(req.body['username_field'], (results) => {
    if (results === null) {
      return res.render('login', {layout: 'default', subtitle: 'Login',
        username_error: req.flash('username_error'), password_error: 'Password required',
        username: req.body['username_field'], credentials_error: 'Invalid credentials.'});
    } else if (bcrypt.compareSync(req.body['password_field'], results.rows[0].pass_hash)) {
      console.log('success logging in');
      db.addSession(req.session.id, req.body['username_field'], (boo) => {
        if (!boo) {
          return res.render('login', {layout: 'default', subtitle: 'Login',
            username_error: req.flash('username_error'), password_error: 'Password required',
            username: req.body['username_field'], credentials_error: 'Error updating session.'});
        } else {
          return res.redirect('/home');
        }
      });
    } else {
      return res.render('login', {layout: 'default', subtitle: 'Login',
        username_error: req.flash('username_error'), password_error: 'Password required',
        username: req.body['username_field'], credentials_error: 'Invalid credentials.'});
    }
  });
});

app.get('/signup', (req, res) => {
  db.getSession(req.sessionID, (results) => {
    if (results === null) { // Error encountered
      console.log('error encountered');
      res.redirect('/error');
    } else if (results.rows.length === 0) { // No session data
      res.render('signup', {layout: 'default', subtitle: 'Signup'});
    } else if (results.rows[0].discord_id === null) { // Session data but no one is logged in
      res.render('signup', {layout: 'default', subtitle: 'Signup'});
    } else { // User is logged in
      res.redirect('/home');
    }
  });
});

app.post('/signup', (req, res) => {
  let missing = false;
  if (req.body['username_field'] === '') {
    req.flash('username_error', 'Username required');
    missing = true;
  }
  if (req.body['password_field'] === '') {
    missing = true;
  }
  if (req.body['confirm_password_field'] === '') {
    missing = true;
  }
  if (req.body['discord_username_field'] === '') {
    req.flash('discord_username_error', 'Discord username required');
    missing = true;
  }
  if (req.body['discord_id_field'] === '') {
    req.flash('discord_id_error', 'Discord ID required');
    missing = true;
  }
  if (req.body['auth_code_field'] === '') {
    missing = true;
  }
  if (missing) {
    res.render('signup', {layout: 'default', subtitle: 'Signup',
      username_error: req.flash('username_error'), password_error: 'Password required',
      confirm_password_error: 'Password confirmation required', discord_username_error: req.flash('discord_username_error'),
      discord_id_error: req.flash('discord_id_error'), auth_code_error: 'Auth code required',
      username: req.body['username_field'], discord_username: req.body['discord_username_field'],
      discord_id: req.body['discord_id_field']});
    return;
  }
  db.getUserById(req.body['discord_id_field'], (results) => {
    const entry = results.rows[0];
    if (results === null) {
      return res.render('signup', {layout: 'default', subtitle: 'Signup',
        password_error: 'Password required', confirm_password_error: 'Password confirmation required',
        username: req.body['username_field'], discord_username: req.body['discord_username_field'],
        discord_id: req.body['discord_id_field'], credentials_error: 'Error fetching user, please try again.'});
    }

    if (req.body['password_field'] !== req.body['confirm_password_field']) {
      return res.render('signup', {layout: 'default', subtitle: 'Signup',
        password_error: 'Password required', confirm_password_error: 'Password confirmation required',
        username: req.body['username_field'], discord_username: req.body['discord_username_field'],
        discord_id: req.body['discord_id_field'], credentials_error: 'Passwords do not match.'});
    }

    console.log(req.body);
    db.getUserByUsername(req.body['username_field'], (results) => {
      if (results === null) {
        return res.render('signup', {layout: 'default', subtitle: 'Signup',
          password_error: 'Password required', confirm_password_error: 'Password confirmation required',
          username: req.body['username_field'], discord_username: req.body['discord_username_field'],
          discord_id: req.body['discord_id_field'], credentials_error: 'Error fetching user, please try again.'});
      } else if (results.rows.length !== 0) {
        res.render('signup', {layout: 'default', subtitle: 'Signup',
          password_error: 'Password required', confirm_password_error: 'Password confirmation required',
          username: req.body['username_field'], discord_username: req.body['discord_username_field'],
          discord_id: req.body['discord_id_field'], credentials_error: 'Username taken.'});
      } else if (entry.discord_id === req.body['discord_id_field'] && entry.status === 'init' && entry.auth === req.body['auth_code_field'] &&
      entry.discord_username === req.body['discord_username_field'] && req.body['password_field'] === req.body['confirm_password_field']) {
        db.updateUser(req.body['username_field'], entry.discord_id, 'signed up', null, entry.discord_username, bcrypt.hashSync(req.body['password_field'], 10), entry.id, (boo) => {
          if (!boo) {
            res.render('signup', {layout: 'default', subtitle: 'Signup',
              password_error: 'Password required', confirm_password_error: 'Password confirmation required',
              username: req.body['username_field'], discord_username: req.body['discord_username_field'],
              discord_id: req.body['discord_id_field'], credentials_error: 'Error fetching user, please try again.'});
          } else {
            res.redirect('/login');
          }
        });
      } else {
        return res.render('signup', {layout: 'default', subtitle: 'Signup',
          password_error: 'Password required', confirm_password_error: 'Password confirmation required',
          username: req.body['username_field'], discord_username: req.body['discord_username_field'],
          discord_id: req.body['discord_id_field'], credentials_error: 'Invalid credentials, please reissue signup again.'});
      }
    });
  });
});

app.get('/home', (req, res) => {
  db.getSession(req.session.id, (results) => {
    if (results === null) {
      return res.redirect('/login');
    } else if (results.rows.length === 0) {
      return res.redirect('/login');
    } else {
      console.log(results.rows);
      return res.render('home', {layout: 'default', subtitle: results.rows[0].username});
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
