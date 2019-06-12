const Youtube = require('./Youtube.js');
const Soundcloud = require('./Soundcloud.js');
const ytdl = require('ytdl-core');
const http = require('http');
const https = require('https');
const url = require('url');
const moment = require('moment');

/**
 * Create a new DJ.
 * @param {String} displayName Name of the user
 * @param {Number} id Discord ID of the user
 */
function DJ(displayName, id) {
  console.log('DJ');
  this.user = displayName;
  this.id = id;
  this.songs = [];
}

/**
 * Add a Youtube song or songs from a playlists.
 * @param {Object} dj The player to add the songs to
 * @param {string} u The url of the song or playlist
 * @param {Object} arr The array of songs as pages in the playlist are parsed
 * @param {number} page The page of the Youtube playlist
 * @param {Object} callback The callback to leave the function
 */
function addYoutube(dj, u, arr, page, callback) {
  console.log('addYoutube');
  let urlParams = null;
  if (!u.includes('list')) {
    urlParams = url.parse(u, true);
    https.get('https://content.googleapis.com/youtube/v3/videos?part=snippet&id=' + urlParams.query.v + '&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.items.length === 0) {
          callback();
        } else {
          const temp = {
            'id': parsed.items[0].id,
            'title': parsed.items[0].snippet.title,
          };
          // TODO: Private video check like below before pushing
          arr.push(temp);
          callback();
        }
      });
    });
  } else {
    urlParams = url.parse(u, true);
    let append = '';
    if (page === undefined) {
      callback();
    } else {
      if (page !== null) {
        append = '&pageToken=' + page;
      }
      https.get('https://content.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + urlParams.query.list + append + '&maxResults=50&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          const parsed = JSON.parse(data);
          for (let i = 0; i < parsed.items.length; i++) {
            const temp = {
              'id': parsed.items[i].snippet.resourceId.videoId,
              'title': parsed.items[i].snippet.title,
            };
            if (temp.title !== 'Private video') {
              arr.push(temp);
            }
          }
          addYoutube(dj, u, arr, parsed.nextPageToken, callback);
        });
      });
    }
  }
}

/**
 * Retrieves detailed information about each song in the array of songs
 * @param {Object} dj Player the songs are coming from
 * @param {Object} arr Contains the songs to be added
 * @param {Object} store Dj's songs array to add the new song into
 * @param {Object} callback Callback to leave the function
 */
function parseList(dj, arr, store, callback) {
  console.log('parseList');
  const temp = arr.shift();
  https.get('https://content.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + temp.id + '&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      const parsed = JSON.parse(data);
      const mom = moment.duration(parsed.items[0].contentDetails.duration);
      const seconds = mom.asSeconds() % 60;
      const minutes = Math.floor(mom.asSeconds() / 60);
      const tempYoutube = new Youtube.Youtube('https://www.youtube.com/watch?v=' + temp.id, temp.title, temp.id, minutes + ':' + seconds, dj.id, dj.user);
      let allowed = undefined;
      let blocked = undefined;
      if (parsed.items[0].contentDetails.regionRestriction !== undefined) {
        allowed = parsed.items[0].contentDetails.regionRestriction.allowed;
        blocked = parsed.items[0].contentDetails.regionRestriction.blocked;
      }
      if (allowed !== undefined && !allowed.includes('US')) {
        // console.log(temp.title + ' not allowed');
      } else if (blocked !== undefined && blocked.includes('US')) {
        // console.log(temp.title + ' not allowed');
      } else {
        store.push(tempYoutube);
      }
      if (arr.length === 0) {
        callback(store.length);
      } else {
        parseList(dj, arr, store, callback);
      }
    });
  });
}

/**
 * Adds either a single SoundCloud song or a whole playlist of songs
 * @param {Object} dj Dj to add the songs to
 * @param {String} u Url for the song/playlist
 * @param {Object} callback Callback to leave the function
 */
function addSoundcloud(dj, u, callback) {
  console.log('addSoundcloud');
  // console.log('in addSoundcloud');
  let duration;
  let minutes;
  let seconds;
  let counter = 0;
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
              dj.songs.push(new Soundcloud.Soundcloud(u, track.stream_url + '?client_id=' + ((process.env.SCID !== undefined) ? process.env.SCID : require('../../auth.json').scid), track.title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, dj.id, dj.user));
              callback(1);
            } else {
              // console.log('adding soundcloud playlist');
              while (track.tracks.length > 0) {
                const t = track.tracks.shift();
                duration = t.duration;
                minutes = Math.floor(duration / 60000);
                seconds = ((duration % 60000) / 1000).toFixed(0);
                dj.songs.push(new Soundcloud.Soundcloud(t.permalink_url, t.stream_url + '?client_id=' + ((process.env.SCID !== undefined) ? process.env.SCID : require('../../auth.json').scid), t.title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, dj.id, dj.user));
                counter++;
              }
              callback(counter);
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

DJ.prototype.init = function(u) {
  console.log('init');
  // console.log('need to update inity');
  this.songs = [];
  this.num = 0;
  this.user = u;
  return this;
};

DJ.prototype.addSong = function(url, callback) {
  console.log('addSong');
  // console.log(typeof(url));
  // console.log(url);
  if (url.includes('youtube')) {
    // console.log('adding youtube url');
    const songs = [];
    const dj = this;
    const origLength = dj.songs.length;
    addYoutube(dj, url, songs, null, function() {
      // console.log(songs);
      // console.log(dj.songs);
      parseList(dj, songs, dj.songs, function(num) {
        // console.log(dj.songs);
        // console.log(dj.songs.length);
        callback('Added ' + (num - origLength) + ' songs');
      });
    });
  } else if (url.includes('soundcloud')) {
    // console.log('adding soundcloud url');
    addSoundcloud(this, url, function(num) {
      callback('Added ' + num + ' songs');
    });
  } else {
    // console.log('needs to provide valid url');
    callback('Invalid url');
  }
  // console.log('outside, no callback');
};

DJ.prototype.getStream = function() {
  console.log('getStream');
  return this.songs.shift().getStream();
};

DJ.prototype.getSong = function() {
  console.log('getSong');
  let song = null;
  let stream = null;
  while (song == null && this.songs.length > 0) {
    song = this.songs.shift();
    if (song.url.includes('youtube')) {
      stream = ytdl(song.url, {filter: 'audioonly'}).on('error', (err) => {
        console.log('error in ytdl');
        console.log(err);
        song = null;
      });
    }
  }
  if (song == null) return null;
  if (song.url.includes('youtube')) song.setStream(stream);
  return song;
};

module.exports = {
  DJ: DJ,
};

