const http = require('http');
const https = require('https');

/**
 * Create a Soundcloud song.
 * @param {String} u The url of the song.
 * @param {String} s The url of the stream.
 * @param {String} t The title of the song.
 * @param {String} l The length of the song.
 * @param {String} p The Discord id of the player.
 * @param {String} pl The name of the player.
 * @param {String} th The thumbnail of the song.
 * @param {String} c The user that uploaded the song.
 */
function Soundcloud(u, s, t, l, p, pl, th, c) {
  this.url = u;
  this.stream = s;
  this.title = t;
  this.pid = p;
  this.length = l;
  this.player = pl;
  this.remove = false;
  this.type = 'sc';
  this.thumbnail = th;
  this.channel = c;
}

Soundcloud.prototype.init = function(u) {
  console.log('init');
  this.url = u;
  return this;
};

Soundcloud.prototype.getStream = function() {
  console.log('getStream');
  return this.stream + '?client_id=' + ((process.env.SCID !== undefined) ? process.env.SCID : require('../../auth.json').scid);
};

Soundcloud.prototype.getTitle = function() {
  console.log('getTitle');
  return this.title;
};

/**
 * Adds either a single SoundCloud song or a whole playlist of songs
 * @param {Object} arr Array of songs that were found
 * @param {String} u Url for the song/playlist
 * @param {String} discordId Discord identifier of the player
 * @param {String} username Discord username of the player
 * @param {Object} callback Callback to leave the function
 */
function addSoundcloud(arr, u, discordId, username, callback) {
  console.log('addSoundcloud');
  // console.log('in addSoundcloud');
  let duration;
  let minutes;
  let seconds;
  let thumbnail;
  let channel;
  // console.log('SC');
  http.get('http://api.soundcloud.com/resolve?url=' + u + '&client_id=' + ((process.env.SCID !== undefined) ? process.env.SCID : require('../../auth.json').scid), function(resp) {
    let data1 = '';
    resp.on('data', (chunk) => {
      data1 += chunk;
    });

    resp.on('end', () => {
      // console.log(data1);
      data1 = JSON.parse(data1);
      https.get(data1.location, (resp) => {
        let data2 = '';
        resp.on('data', (chunk) => {
          data2 += chunk;
        });

        resp.on('end', (chunk) => {
          track = JSON.parse(data2);
          if (track != null) {
            // console.log(track);
            if (track.kind == 'track') {
              // console.log('adding singular soundcloud track');
              duration = track.duration;
              minutes = Math.floor(duration / 60000);
              seconds = ((duration % 60000) / 1000).toFixed(0);
              thumbnail = track.artwork_url;
              if (thumbnail === null) thumbnail = track.user.avatar_url;
              if (!thumbnail.includes('default_avatar_large.png')) thumbnail = thumbnail.replace('large', 't300x300');
              channel = track.user.username;
              arr.push(new Soundcloud(u, track.stream_url, track.title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, discordId, username, thumbnail, channel));
              callback();
            } else {
              // console.log('adding soundcloud playlist');
              while (track.tracks.length > 0) {
                const t = track.tracks.shift();
                duration = t.duration;
                minutes = Math.floor(duration / 60000);
                seconds = ((duration % 60000) / 1000).toFixed(0);
                console.log(t);
                console.log(t.artwork_url);
                thumbnail = t.artwork_url;
                if (thumbnail === null) thumbnail = t.user.avatar_url;
                console.log(thumbnail);
                if (!thumbnail.includes('default_avatar_large.png')) thumbnail = thumbnail.replace('large', 't300x300');
                channel = t.user.username;
                arr.push(new Soundcloud(t.permalink_url, t.stream_url, t.title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, discordId, username, thumbnail, channel));
              }
              callback();
            }
          }
        });
      }).on('error', (err) => {
        console.log('error: ' + err.message);
      });
    });
  }).on('error', (err) => {
    console.log('error: ' + err.message);
  });
  // console.log('outside');
}

/**
 * Search SoundCloud based off the serach query that was specified.
 * @param {String} str Query
 * @param {Number} id Discord identifier for the searcher
 * @param {Object} searches Array holding all searches from users
 * @param {Object} callback Callback to use to leave the async calls
 */
function scSearch(str, id, searches, callback) {
  console.log('scSearch');
  http.get('http://api.soundcloud.com/tracks?q=' + str + '&client_id=' + ((process.env.SCID !== undefined) ? process.env.SCID : require('../../auth.json').scid), function(resp) {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      searches[id] = [];
      let parsed = JSON.parse(data);
      // console.log(parsed);
      // console.log(parsed.length);
      parsed = parsed.slice(0, 5);
      for (let i = 0; i < parsed.length; i++) {
        const duration = parsed[i].duration;
        minutes = Math.floor(duration / 60000);
        seconds = ((duration % 60000) / 1000).toFixed(0);
        thumbnail = parsed[i].artwork_url;
        if (thumbnail === null) thumbnail = parsed[i].user.avatar_url;
        console.log(thumbnail);
        if (!thumbnail.includes('default_avatar_large.png')) thumbnail = thumbnail.replace('large', 't300x300');
        channel = parsed[i].user.username;
        searches[id][i] = new Soundcloud(parsed[i].permalink_url, parsed[i].stream_url, parsed[i].title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, null, null, thumbnail, channel);
      }
      callback();
    });
  });
}

module.exports = {
  Soundcloud: Soundcloud,
  addSoundcloud: addSoundcloud,
  scSearch: scSearch,
};
