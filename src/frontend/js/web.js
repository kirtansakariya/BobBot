const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const pg = require('pg');

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));


// console.log(process.env.DATABASE_URL);
const client = new pg.Client({
  connectionString: ((process.env.DATABASE_URL !== undefined) ? process.env.DATABASE_URL : require('../../../auth.json').db_url),
  ssl: true,
});

client.connect();

// client.query('SELECT * FROM user')

// const user = 'test';
// const discordId = '123';
// const status = 'signing up';

// const queryConfig = {
//   text: 'INSERT INTO users(username, discord_id, status) VALUES($1, $2, $3);',
//   values: ['a', 'ab', 'b'],
// };

const text = 'INSERT INTO users(username, discord_id, status) VALUES($1, $2, $3);';
const values = ['{a}', '{ab}', '{b}'];

client.query(text, values, (error, results) => {
  if (error) {
    console.log('OH NO');
    console.log(error);
  } else {
    console.log('OH YES');
    console.log(results);
  }
});

// client.query('INSERT INTO users (username, discord_id, status) VALUES ($1, $2, $3);', [user, discordId, status], (error, results) => {
//   if (error) {
//     console.log('OH NO');
//     console.log(error);
//   } else {
//     console.log('OH YES');
//     console.log(results);
//   }
// });

client.query('SELECT * FROM users;', (err, res) => {
  if (err) throw err;
  for (const row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
