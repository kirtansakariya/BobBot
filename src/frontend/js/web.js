const express = require('express');
const db = require('../../database/db');
// const cookieParser = require('cookie-parser');
const pg = require('pg');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const DJ = require('../../discord/DJ');
const discord = require('discord.js');
// const port = process.env.PORT || 5000;s
// const pg = require('pg');
// let counter = 0;

const pgPool = new pg.Pool({
  connectionString: ((process.env.DATABASE_URL !== undefined) ? process.env.DATABASE_URL : require('../../../auth.json').db_url),
  ssl: true,
});

// app.use(cookieSession({
//   name: 'session',
//   secret: 'shh',
//   maxAge: 24 * 60 * 60 * 1000,
// }));

// app.use(cookieParser());
// app.use(session({
//   secret: 'shhshhshshshshsh', // just a long random string
//   resave: false,
//   saveUninitialized: true,
// }));

app.use(session({
  store: new PgSession({
    pool: pgPool,
    tableName: 'sessions',
  }),
  secret: ((process.env.SECRET !== undefined) ? process.env.SECRET : require('../../../auth.json').secret),
  resave: false,
  cookie: {maxAge: 30 * 24 * 60 * 60 * 1000},
  saveUninitialized: true,
}));

// app.use(session({
//   store: new pgSession({
//     pool: pgPool,
//     tableName: 'user_sessions',
//   }),
//   secret: process.env.FOO_COOKIE_SECRET,
//   resave: false,
//   cookie: {maxAge: 30 * 24 * 60 * 60 * 1000}, // 30 days
// }));

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
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  // req.session.cookie.counter = counter;
  // req.session.counter = counter;
  // req.session.save();

  if (req.session.username === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/home');
  }

  // db.getSession(req.sessionID, (results) => {
  //   if (results === null) { // Error encountered
  //     console.log('error encounterd'); // maybe add session?
  //     res.redirect('/error');
  //   } else if (results.rows.length === 0) { // No session data
  //     // db.addSession(req.sessionID, null, (boo) => {
  //     //   if (boo == false) {
  //     //     console.log('rip, error');
  //     //   } else {
  //     //     console.log('yay, added, redirection to login page');
  //     //     res.redirect('/login');
  //     //   }
  //     // });
  //     res.redirect('/login');
  //   } else if (results.rows[0].discord_id === null) { // Session data but no one is logged in
  //     console.log('redirect to login page');
  //     res.redirect('/login');
  //   } else { // User is logge din
  //     console.log('redirect to home page');
  //     res.redirect('/home');
  //   }
  // });
});

app.get('/login', (req, res) => {
  if (req.session.username === undefined) {
    res.render('login', {layout: 'default', subtitle: 'Login'});
  } else {
    res.redirect('/home');
  }

  // db.getSession(req.sessionID, (results) => {
  //   if (results === null) { // Error encountered
  //     console.log('error encounterd'); // maybe add session?
  //     res.redirect('/error');
  //   } else if (results.rows.length === 0) { // No session data
  //     // db.addSession(req.sessionID, null, (boo) => {
  //     //   if (boo == false) {
  //     //     console.log('rip, error');
  //     //   } else {
  //     //     console.log('yay, added, redirectiont o login page');
  //     //     res.redirect('/login');
  //     //   }
  //     // });
  //     res.render('login', {layout: 'default', subtitle: 'Login'});
  //   } else if (results.rows[0].discord_id === null) { // Session data but no one is logged in
  //     console.log('redirect to login page');
  //     res.render('login', {layout: 'default', subtitle: 'Login'});
  //   } else { // User is logged in
  //     console.log('redirect to home page');
  //     res.redirect('/home');
  //   }
  // });
});

app.post('/login', (req, res) => {
  console.log('POST in /login');
  // console.log(req.body);
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
      if (results === null) {
        return res.render('login', {layout: 'default', subtitle: 'Login',
          username_error: req.flash('username_error'), password_error: 'Password required',
          username: req.body['username_field'], credentials_error: 'Error fetching user session.'});
      }
      if (results.rows[0].status != 'signed up') {
        const user = results.rows[0];
        db.updateUser(user.username, user.discord_id, 'signed up', null, user.discord_username, user.pass_hash, user.playlists, user.id, (boo) => {
          if (!boo) {
            return res.render('login', {layout: 'default', subtitle: 'Login',
              username_error: req.flash('username_error'), password_error: 'Password required',
              username: req.body['username_field'], credentials_error: 'Someone tried to reset your account, please message forgot to BobBot.'});
          }
          req.session.username = req.body['username_field'];
          req.session.discord_id = user.discord_id;
          req.session.forgot = false;
          return res.redirect('/home');
        });
      } else {
        req.session.username = req.body['username_field'];
        req.session.discord_id = results.rows[0].discord_id;
        req.session.forgot = false;
        return res.redirect('/home');
      }
      // db.addSession(req.session.id, req.body['username_field'], results.rows[0].discord_id, false, (boo) => {
      //   if (!boo) {
      //     return res.render('login', {layout: 'default', subtitle: 'Login',
      //       username_error: req.flash('username_error'), password_error: 'Password required',
      //       username: req.body['username_field'], credentials_error: 'Error updating session.'});
      //   } else {
      //     return res.redirect('/home');
      //   }
      // });
    } else {
      return res.render('login', {layout: 'default', subtitle: 'Login',
        username_error: req.flash('username_error'), password_error: 'Password required',
        username: req.body['username_field'], credentials_error: 'Invalid credentials.'});
    }
  });
});

app.get('/signup', (req, res) => {
  if (req.session.username === undefined) {
    return res.render('signup', {layout: 'default', subtitle: 'Signup'});
  }
  // console.log(req.session.username);
  return res.redirect('/home');
  // db.getSession(req.sessionID, (results) => {
  //   if (results === null) { // Error encountered
  //     console.log('error encountered');
  //     res.redirect('/error');
  //   } else if (results.rows.length === 0) { // No session data
  //     res.render('signup', {layout: 'default', subtitle: 'Signup'});
  //   } else if (results.rows[0].discord_id === null) { // Session data but no one is logged in
  //     res.render('signup', {layout: 'default', subtitle: 'Signup'});
  //   } else { // User is logged in
  //     res.redirect('/home');
  //   }
  // });
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

    // console.log(req.body);
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
        db.updateUser(req.body['username_field'], entry.discord_id, 'signed up', null, entry.discord_username, bcrypt.hashSync(req.body['password_field'], 10), entry.playlists, entry.id, (boo) => {
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

app.get('/forgot', (req, res) => {
  if (req.session.username === undefined) {
    return res.render('forgot', {layout: 'default', subtitle: 'Forgot Password'});
  }
  return res.redirect('/home');
  // db.getSession(req.session.id, (results) => {
  //   if (results === null) {
  //     return res.render('forgot', {layout: 'default', subtitle: 'Forgot password'});
  //   } else if (results.rows.length === 0) {
  //     return res.render('forgot', {layout: 'default', subtitle: 'Forgot password'});
  //   } else {
  //     console.log(results.rows);
  //     return res.redirect('/home');
  //   }
  // });
});

app.post('/forgot', (req, res) => {
  // console.log(req.body);
  let missing = false;
  if (req.body['username_field'] === '') {
    req.flash('username_error', 'Invalid username');
    missing = true;
  }
  if (req.body['password_field'] === '') {
    missing = true;
  }
  if (req.body['confirm_password_field'] === '') {
    missing = true;
  }
  if (req.body['auth_field'] === '') {
    missing = true;
  }
  if (missing) {
    return res.render('forgot', {layout: 'default', subtitle: 'Forgot Password',
      username_error: req.flash('username_error'), password_error: 'Password required',
      confirm_password_error: 'Password confirmation required', auth_code_error: 'Password required',
      username: req.body['username_field']});
  }

  if (req.body['password_field'] !== req.body['confirm_password_field']) {
    return res.render('forgot', {layout: 'default', subtitle: 'Forgot Password',
      password_error: 'Password required', confirm_password_error: 'Password confirmation required',
      auth_code_error: 'Password required', credentials_error: 'Passwords do not match.',
      username: req.body['username_field']});
  }
  db.getUserByUsername(req.body['username_field'], (results) => {
    if (results === null) {
      return res.render('forgot', {layout: 'default', subtitle: 'Forgot Password',
        password_error: 'Password required', confirm_password_error: 'Password confirmation required',
        auth_code_error: 'Password required', credentials_error: 'Invalid credentials',
        username: req.body['username_field']});
    } else if (results.rows.length === 0) {
      return res.render('forgot', {layout: 'default', subtitle: 'Forgot Password',
        password_error: 'Password required', confirm_password_error: 'Password confirmation required',
        auth_code_error: 'Password required', credentials_error: 'Invalid credentials',
        username: req.body['username_field']});
    }
    const user = results.rows[0];
    if (req.body['username_field'] !== user.username || req.body['auth_field'] !== user.auth) {
      return res.render('forgot', {layout: 'default', subtitle: 'Forgot Password',
        password_error: 'Password required', confirm_password_error: 'Password confirmation required',
        auth_code_error: 'Password required', credentials_error: 'Invalid credentials',
        username: req.body['username_field']});
    }
    db.updateUser(user.username, user.discord_id, 'signed up', null, user.discord_username, bcrypt.hashSync(req.body['password_field'], 10), user.playlists, user.id, (boo) => {
      if (!boo) {
        return res.render('forgot', {layout: 'default', subtitle: 'Forgot Password',
          password_error: 'Password required', confirm_password_error: 'Password confirmation required',
          auth_code_error: 'Password required', credentials_error: 'Error updating new password',
          username: req.body['username_field']});
      }
      return res.redirect('/login');
    });
  });
});

// app.get('/forgot/auth', (req, res) => {
//   db.getSession(req.session.id, (results) => {
//     if (results === null) {
//       return res.redirect('/error?data=Password+Reset+Not+Requested');
//     } else if (results.rows.length === 0) {
//       return res.redirect('/error?data=Password+Reset+Not+Requested');
//     }
//   });
// });

app.get('/home', (req, res) => {
  if (req.session.username === undefined) {
    return res.redirect('/login');
  }
  db.getUserById(req.session.discord_id, (results) => {
    if (results === null) {
      console.log('getUserById failed');
      return res.redirect('error');
    } else if (results.rows.length === 0) {
      console.log('no users with the id');
      return res.redirect('error');
    }
    console.log('playlists: ' + results.rows[0].playlists);
    return res.render('home', {layout: 'default', subtitle: req.session.username, playlists: results.rows[0].playlists, error: req.flash('error')});
  });
  // return res.render('home', {layout: 'default', subtitle: req.session.username});
  // db.getSession(req.session.id, (results) => {
  //   if (results === null) {
  //     return res.redirect('/login');
  //   } else if (results.rows.length === 0) {
  //     return res.redirect('/login');
  //   } else {
  //     console.log(results.rows);
  //     return res.render('home', {layout: 'default', subtitle: results.rows[0].username});
  //   }
  // });
});

app.get('/playlist', (req, res) => {
  if (req.session.username === undefined) {
    return res.redirect('/login');
  }
  if (req.query.name === undefined || req.query.name === '') {
    return res.redirect('/home');
  }
  db.getUserById(req.session.discord_id, (results) => {
    if (results === null) {
      console.log('error w/results in GET /playlist');
      return res.redirect('/home');
    }
    if (results.rows.length === 0) {
      console.log('no results in GET /playlist');
    }
    const user = results.rows[0];
    for (let i = 0; i < user.playlists.length; i++) {
      if (user.playlists[i].name === req.query.name) {
        return res.render('playlist', {layout: 'default', subtitle: 'BobBot - Playlist: ' + req.query.name, name: user.playlists[i].name});
      }
    }
    return res.redirect('/home');
  });
});

app.get('/playlist/new', (req, res) => {
  if (req.session.username === undefined) {
    return res.redirect('/login');
  }
  return res.render('new-playlist', {layout: 'default', subtitle: 'New Playlist'});
});

app.post('/playlist/new', (req, res) => {
  if (req.session.username === undefined) {
    return res.redirect('/login');
  }
  if (req.body['playlist_field'] === '') {
    req.flash('playlist_error', 'Please enter a non-empty playlist name');
    return res.render('new-playlist', {layout: 'default', subtitle: 'New Playlist', playlist_error: req.flash('playlist_error')});
  }
  db.getUserById(req.session.discord_id, (results) => {
    if (results === null) {
      req.flash('credentials_error', 'Error fetching user');
      return res.render('new-playlist', {layout: 'default', subtitle: 'New Playlist', credentials_error: req.flash('credentials_error')});
    }
    if (results.rows.length === 0) {
      req.flash('credentials_error', 'No users exist');
      return res.render('new-playlist', {layout: 'default', subtitle: 'New Playlist', credentials_error: req.flash('credentials_error')});
    }
    let i = 0;
    if (results.rows[0].playlists === null) results.rows[0].playlists = [];
    for (; i < results.rows[0].playlists.length; i++) {
      if (results.rows[0].playlists[i].name === req.body['playlist_field']) {
        req.flash('playlist_error', 'Playlist name already taken');
        return res.render('new-playlist', {layout: 'default', subtitle: 'New Playlist', playlist_error: req.flash('playlist_error')});
      }
    }
    const user = results.rows[0];
    user.playlists[i] = {'name': req.body['playlist_field'], 'songs': []};
    db.updateUser(user.username, user.discord_id, user.status, user.auth, user.discord_username, user.pass_hash, user.playlists, user.id, (boo) => {
      if (!boo) {
        req.flash('credentials_error', 'Failed to update user');
        return res.render('new-playlist', {layout: 'default', subtitle: 'New Playlist', credentials_error: req.flash('credentials_error')});
      }
      return res.redirect('/home');
    });
  });
});

app.get('/error', (req, res) => {
  console.log('error nooo');
  res.render('error', {layout: 'default', data: req.query['data'], template: 'error-template', subtitle: 'Error'});
});

app.post('/api/urlsongs', (req, res) => {
  console.log('query is: ' + req.query['query']);
  DJ.getSongsFromUrl(req.query['query'], null, null, (arr) => {
    const obj = {};
    if (arr.length === 0) {
      obj['songs'] = [];
      res.send(obj);
    } else {
      console.log(arr);
      obj['songs'] = JSON.stringify(arr);
      res.send(obj);
    }
  });
});

module.exports = {
  app: app,
};
