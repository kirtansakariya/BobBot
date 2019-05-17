const pg = require('pg');

const client = new pg.Client({
  connectionString: ((process.env.DATABASE_URL !== undefined) ? process.env.DATABASE_URL : require('../../auth.json').db_url),
  ssl: true,
});

client.connect();

/**
 * Add a new user to the database.
 * @param {String} username Discord name
 * @param {String} discordId Discord account identifier
 * @param {String} status Status of the user's account
 * @param {Object} callback Callback to leave the function
 */
function addUser(username, discordId, status, callback) {
  const queryConfig = {
    text: 'INSERT INTO users(username, discord_id, status) VALUES($1, $2, $3);',
    values: [username, discordId, status],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('OH NO in addUser');
      // console.log(error);
      callback(false);
    } else {
      console.log('OH YES in addUser');
      // console.log(results);
      callback(true);
    }
  });
}

/**
 * Get a user from the database.
 * @param {String} discordId Discord account identifier
 * @param {Object} callback Callback to leave the function
 */
function getUser(discordId, callback) {
  const queryConfig = {
    text: 'SELECT * FROM users WHERE discord_id = $1',
    values: [discordId],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('OH NO in getUser');
      // console.log(error);
      callback(null);
    } else {
      console.log('OH YES in getUser');
      // console.log(results);
      callback(results);
    }
  });
}

/**
 * Add a new session to the database.
 * @param {String} sid Session id
 * @param {String} discordId Discord account identifier
 * @param {Object} callback Callback to leave the function
 */
function addSession(sid, discordId, callback) {
  const queryConfig = {
    text: 'INSERT INTO sessions(sid, discord_id) VALUES($1, $2);',
    values: [sid, discordId],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('OH NO in addSession');
      // console.log(error);
      callback(false);
    } else {
      console.log('OH YES in addSession');
      // console.log(results);
      callback(true);
    }
  });
}

/**
 * Get a user from the database.
 * @param {String} sid Session id
 * @param {Object} callback Callback to leave the function
 */
function getSession(sid, callback) {
  const queryConfig = {
    text: 'SELECT * FROM sessions WHERE sid = $1',
    values: [sid],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('OH NO in getSession');
      // console.log(error);
      callback(null);
    } else {
      console.log('OH YES in getSession');
      // console.log(results);
      callback(results);
    }
  });
}

module.exports = {
  addUser: addUser,
  getUser: getUser,
  addSession: addSession,
  getSession: getSession,
};
