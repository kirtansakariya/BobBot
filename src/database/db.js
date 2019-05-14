const pg = require('pg');

const client = new pg.Client({
  connectionString: ((process.env.DATABASE_URL !== undefined) ? process.env.DATABASE_URL : require('../../auth.json').db_url),
  ssl: true,
});

client.connect();

/**
 * Add new users to the database.
 * @param {String} username discord name
 * @param {String} discordId discord account identifier
 * @param {String} status status of the user's account
 * @param {Object} callback callback to leave the function
 */
function addUser(username, discordId, status, callback) {
  const queryConfig = {
    text: 'INSERT INTO users(username, discord_id, status) VALUES($1, $2, $3);',
    values: [username, discordId, status],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('OH NO');
      console.log(error);
      callback(false);
    } else {
      console.log('OH YES');
      console.log(results);
      callback(true);
    }
  });
}

/**
 * Get a user from the database.
 * @param {String} discordId discord account identifier
 * @param {Object} callback callback to leave the function
 */
function getUser(discordId, callback) {
  const queryConfig = {
    text: 'SELECT * FROM users WHERE discord_id = $1',
    values: [discordId],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('OH NO');
      console.log(error);
      callback(null);
    } else {
      console.log('OH YES');
      console.log(results);
      callback(results);
    }
  });
}

module.exports = {
  addUser: addUser,
  getUser: getUser,
};
