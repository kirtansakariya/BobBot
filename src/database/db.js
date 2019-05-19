const pg = require('pg');

const client = new pg.Client({
  connectionString: ((process.env.DATABASE_URL !== undefined) ? process.env.DATABASE_URL : require('../../auth.json').db_url),
  ssl: true,
});

client.connect();

/**
 * Add a new user to the database.
 * @param {String} discordId Discord account identifier
 * @param {String} status Status of the user's account
 * @param {String} auth Auth code to verify user
 * @param {String} discordUsername Discord username
 * @param {Object} callback Callback to leave the function
 */
function addUser(discordId, status, auth, discordUsername, callback) {
  const queryConfig = {
    text: 'INSERT INTO users(discord_id, status, auth, discord_username) VALUES($1, $2, $3, $4);',
    values: [discordId, status, auth, discordUsername],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in addUser');
      // console.log(error);
      callback(false);
    } else {
      console.log('SUCCESS in addUser');
      // console.log(results);
      callback(true);
    }
  });
}

/**
 * Get a user from the database by the Discord ID.
 * @param {String} discordId Discord account identifier
 * @param {Object} callback Callback to leave the function
 */
function getUserById(discordId, callback) {
  const queryConfig = {
    text: 'SELECT * FROM users WHERE discord_id = $1',
    values: [discordId],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in getUserById');
      // console.log(error);
      callback(null);
    } else {
      console.log('SUCCESS in getUserById');
      // console.log(results);
      callback(results);
    }
  });
}

/**
 * Get a user from the database by the username.
 * @param {String} username Username for the portal
 * @param {Object} callback Callback to leave the function
 */
function getUserByUsername(username, callback) {
  const queryConfig = {
    text: 'SELECT * FROM users WHERE username = $1',
    values: [username],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in getUserByUsername');
      callback(null);
    } else {
      console.log('SUCCESS in getUserByUsername');
      callback(results);
    }
  });
}

/**
 * Update a user's information
 * @param {String} username Username for portal login
 * @param {String} discordId Discord account identifier
 * @param {String} status Status of the user's account
 * @param {String} auth Auth code to verify the user
 * @param {String} discordUsername Discord username
 * @param {String} passHash Hash of the password
 * @param {String} id Id of entry in the DB
 * @param {Object} callback Callback to laeve the function
 */
function updateUser(username, discordId, status, auth, discordUsername, passHash, id, callback) {
  const queryConfig = {
    text: 'UPDATE users SET username = ($1), discord_id = ($2), status = ($3), auth = ($4), discord_username = ($5), pass_hash = ($6) WHERE id = ($7)',
    values: [username, discordId, status, auth, discordUsername, passHash, id],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in updateUser');
      callback(false);
    } else {
      console.log('SUCCESS in updateUser');
      callback(true);
    }
  });
}

/**
 * Add a new session to the database.
 * @param {String} sid Session id
 * @param {String} username Username for the frontend portal
 * @param {Object} callback Callback to leave the function
 */
function addSession(sid, username, callback) {
  const queryConfig = {
    text: 'INSERT INTO sessions(sid, username) VALUES($1, $2);',
    values: [sid, username],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in addSession');
      // console.log(error);
      callback(false);
    } else {
      console.log('SUCCESS in addSession');
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
      console.log('ERROR in getSession');
      // console.log(error);
      callback(null);
    } else {
      console.log('SUCCESS in getSession');
      // console.log(results);
      callback(results);
    }
  });
}

module.exports = {
  addUser: addUser,
  getUserById: getUserById,
  getUserByUsername: getUserByUsername,
  updateUser: updateUser,
  addSession: addSession,
  getSession: getSession,
};
