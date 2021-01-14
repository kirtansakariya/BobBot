const pg = require('pg');

// const client = new pg.Client({
//   connectionString: ((process.env.DATABASE_URL !== undefined) ? process.env.DATABASE_URL : require('../../auth.json').db_url),
//   ssl: true,
//   rejectUnauthorized: true,
// });

// const client = new pg.Client({
//   connectionString: ((process.env.DATABASE_URL !== undefined) ? process.env.DATABASE_URL : require('../../auth.json').db_url),
//   ssl: {
//     rejectUnauthorized: false,
//   }
// });

const client = new pg.Client({
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOSTNAME,
  database: process.env.RDS_DATABASE,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT
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
  // console.log('in getUserById');

  client.query(queryConfig, (error, results) => {
    // console.log('post query');
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
 * @param {Object} playlists Array of playlists and their song counts
 * @param {String} id Id of entry in the DB
 * @param {Object} callback Callback to laeve the function
 */
function updateUser(username, discordId, status, auth, discordUsername, passHash, playlists, id, callback) {
  const queryConfig = {
    text: 'UPDATE users SET username = ($1), discord_id = ($2), status = ($3), auth = ($4), discord_username = ($5), pass_hash = ($6), playlists = ($7) WHERE id = ($8)',
    values: [username, discordId, status, auth, discordUsername, passHash, playlists, id],
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
 * Updates list of songs that were cleaned up
 * @param {String} discordId Discord ID of the user
 * @param {Object} deletes The value to be updated
 * @param {Object} callback Callback to leave the function
 */
function updateUserDeleted(discordId, deletes, callback) {
  const queryConfig = {
    text: 'UPDATE users SET deletes = ($1) WHERE discord_id = ($2)',
    values: [deletes, discordId],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in updateUserDeleted');
      callback(false);
    } else {
      console.log('SUCCESS in updateUserDeleted');
      callback(true);
    }
  });
}

/**
 * Add a new session to the database.
 * @param {String} sid Session id
 * @param {String} username Username for the frontend portal
 * @param {String} discordId Discord identifier for an account
 * @param {Boolean} forgot If user is resetting password or not
 * @param {Object} callback Callback to leave the function
 */
function addSession(sid, username, discordId, forgot, callback) {
  const queryConfig = {
    text: 'INSERT INTO sessions(sid, username, discord_id, forgot) VALUES($1, $2, $3, $4);',
    values: [sid, username, discordId, forgot],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in addSession');
      console.log(error);
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

/**
 * Set if the user is trying to resert their password or not.
 * @param {Boolean} forgot If user is resetting password or not
 * @param {String} sid Session identifier
 * @param {Object} callback Callback to leave the function
 */
function updateSession(forgot, sid, callback) {
  const queryConfig = {
    text: 'UPDATE sessions SET forgot = ($1) WHERE sid = ($2)',
    values: [forgot, sid],
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
 * Gets the current queue
 * @param {Number} gid Guild id
 * @param {Object} callback Callback to leave the function
 */
function getQueue(gid, callback) {
  const queryConfig = {
    text: 'SELECT data FROM queues where gid = $1',
    values: [gid],
  };

  console.log('getting queue');

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in getQueue');
      console.log(error);
      callback(null);
    } else {
      console.log('SUCCESS in getQueue');
      console.log(results);
      callback(results);
    }
  });
}

/**
 * Adds the queue to the table
 * @param {Number} gid Guild id
 * @param {Object} queue Queue to add
 * @param {Object} callback Callback to leave the function
 */
function addQueue(gid, queue, callback) {
  const queryConfig = {
    text: 'INSERT INTO queues(gid, data) VALUES($1, $2);',
    values: [gid, queue],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in addQueue');
      console.log(error);
      callback(false);
    } else {
      console.log('SUCCESS in addQueue');
      // console.log(results);
      callback(true);
    }
  });
}

/**
 * Updates the queue in the table
 * @param {Number} gid Guild id
 * @param {Object} queue Queue to be updated
 * @param {*} callback Callback to leave the function
 */
function updateQueue(gid, queue, callback) {
  const queryConfig = {
    text: 'UPDATE queues SET data = ($2) WHERE gid = ($1)',
    values: [gid, queue],
  };

  // console.log(queue);

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in updateQueue');
      // console.log(error);
      callback(false);
    } else {
      console.log('SUCCESS in updateQueue');
      // console.log(results);
      callback(true);
    }
  });
}

/**
 * Adds a pinned message
 * @param {String} messageId ID of the message
 * @param {String} serverId Server ID to associate the message with
 * @param {Object} callback Callback to leave the function
 */
function addMessage(messageId, serverId, callback) {
  const queryConfig = {
    text: 'INSERT INTO messages(message_id, server_id) VALUES($1, $2)',
    values: [messageId, serverId],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in addMessage');
      callback(false);
    } else {
      console.log('SUCCESS in addMessage');
      callback(true);
    }
  });
}

/**
 * Gets the message id for a pinned message if it exists
 * @param {String} serverId ID for the server where the pinned message is
 * @param {Object} callback Callback to leave the function
 */
function getMessage(serverId, callback) {
  const queryConfig = {
    text: 'SELECT * FROM messages WHERE server_id = ($1)',
    values: [serverId],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in getMessage');
      callback(null);
    } else {
      console.log('SUCCESS in getMessage');
      callback(results);
    }
  });
}

function updateMessage(messageId, serverId, callback) {
  const queryConfig = {
    text: 'UPDATE messages SET message_id = ($2) WHERE server_id = ($1)',
    values: [serverId, messageId],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in updateMessage');
      // console.log(error);
      callback(false);
    } else {
      console.log('SUCCESS in updateMessage');
      // console.log(results);
      callback(true);
    }
  });
}

function getManga(callback) {
  console.log('in getManga');
  const queryConfig = {
    text: 'SELECT * FROM manga'
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in getManga');
      callback(null);
    } else {
      console.log('SUCCESS in getManga');
      callback(results);
    }
  })
}

function getMangaWithNullTitles(callback) {
  console.log('in getMangaWithNullTitles');
  const queryConfig = {
    text: 'SELECT * FROM manga WHERE title IS NULL'
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in getMangaWithNullTitles');
      callback(null);
    } else {
      console.log('SUCCESS in getMangaWithNullTitles');
      callback(results);
    }
  })
}

function addManga(link, title, callback) {
  console.log('in addManga');
  const queryConfig = {
    text: 'INSERT INTO manga(link, title) VALUES($1, $2)',
    values: [link, title],
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in addManga');
      callback(false);
    } else {
      console.log('SUCCESS in addManga');
      callback(true);
    }
  });
}

function updateMangaTitle(id, title, callback) {
  console.log('in updateMangaTitle');
  const queryConfig = {
    text: 'UPDATE manga SET title = ($1) WHERE id = ($2)',
    values: [title, id]
  };

  client.query(queryConfig, (error, results) => {
    if (error) {
      console.log('ERROR in updateMangaTitle');
      callback(false);
    } else {
      console.log('SUCCESS in updateMangaTitle');
      callback(true);
    }
  })
}

module.exports = {
  addUser: addUser,
  getUserById: getUserById,
  getUserByUsername: getUserByUsername,
  updateUser: updateUser,
  updateUserDeleted: updateUserDeleted,
  addSession: addSession,
  getSession: getSession,
  updateSession: updateSession,
  getQueue: getQueue,
  addQueue: addQueue,
  updateQueue: updateQueue,
  addMessage: addMessage,
  getMessage: getMessage,
  updateMessage: updateMessage,
  getManga: getManga,
  addManga: addManga,
  getMangaWithNullTitles: getMangaWithNullTitles,
  updateMangaTitle: updateMangaTitle
};
