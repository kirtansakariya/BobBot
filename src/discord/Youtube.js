const https = require('https');
const url = require('url');
const moment = require('moment');

/**
 * Initialize a Youtube song.
 * @param {string} u The url.
 * @param {string} t The title of the song.
 * @param {number} i The Youtube id of the song.
 * @param {string} l The length of the song.
 * @param {string} p The Discord player id of the player.
 * @param {string} pl The Discord name of the player.
 * @param {String} th The thumbnail url of the song.
 * @param {String} c The channel the song is from.
 */
function Youtube(u, t, i, l, p, pl, th, c) {
  this.url = u;
  this.stream = null;
  this.title = t;
  this.id = i;
  this.pid = p;
  this.player = pl;
  this.remove = false;
  this.length = l;
  this.type = 'yt';
  this.thumbnail = th;
  this.channel = c;
}

Youtube.prototype.init = function(u) {
  console.log('init');
  this.url = u;
  return this;
};

Youtube.prototype.getStream = function() {
  console.log('getStream');
  return this.stream;
};

Youtube.prototype.setStream = function(s) {
  console.log('setStream');
  this.stream = s;
};

Youtube.prototype.getTitle = function() {
  console.log('getTitle');
  return this.title;
};

Youtube.prototype.getUrl = function() {
  console.log('getUrl');
  return this.url;
};

/**
 * Add a Youtube song or songs from a playlists.
 * @param {string} u The url of the song or playlist
 * @param {Object} arr The array of songs as pages in the playlist are parsed
 * @param {number} page The page of the Youtube playlist
 * @param {Object} callback The callback to leave the function
 */
function addYoutube(u, arr, page, callback) {
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
        if (parsed.error !== undefined) {
          callback();
        } else if (parsed.items.length === 0) {
          callback();
        } else {
          // const mom = moment.duration(parsed.items[0].contentDetails.duration);
          // const seconds = mom.asSeconds() % 60;
          // const minutes = Math.floor(mom.asSeconds() / 60);
          // const id = parsed.items[0].id;
          // const title = parsed.items[0].snippet.title;
          // const tempYoutube = new Youtube.Youtube('https://www.youtube.com/watch?v=' + id, title, id, minutes + ':' + seconds, discordId, username);
          const temp = {
            'id': parsed.items[0].id,
            'title': parsed.items[0].snippet.title,
            'thumbnail': parsed.items[0].snippet.thumbnails.medium.url,
          };
          // TODO: Private video check like below before pushing
          if (temp.title !== 'Private video') {
            console.log('pushing');
            arr.push(temp);
          }
          // let allowed = undefined;
          // let blocked = undefined;
          // if (parsed.items[0].contentDetails.regionRestriction !== undefined) {
          //   allowed = parsed.items[0].contentDetails.regionRestriction.allowed;
          //   blocked = parsed.items[0].contentDetails.regionRestriction.blocked;
          // }
          // if (allowed !== undefined && !allowed.includes('US')) {
          //   // console.log(temp.title + ' not allowed');
          // } else if (blocked !== undefined && blocked.includes('US')) {
          //   // console.log(temp.title + ' not allowed');
          // } else {
          //   arr.push(tempYoutube);
          // }
          // arr.push(temp);
          callback();
        }
      });

      resp.on('error', () => {
        console.log('error');
      });
    });
  } else {
    console.log('playlist');
    urlParams = url.parse(u, true);
    let append = '';
    if (page === undefined) {
      // console.log('leaving');
      // console.log(arr);
      callback();
    } else {
      if (page !== null) {
        console.log(page);
        append = '&pageToken=' + page;
      }
      https.get('https://content.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + urlParams.query.list + append + '&maxResults=50&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          const parsed = JSON.parse(data);
          console.log(parsed.items.length + ' songs this run');
          if (parsed.error !== undefined) callback();
          for (let i = 0; i < parsed.items.length; i++) {
            // const mom = moment.duration(parsed.items[i].contentDetails.duration);
            // console.log(parsed.items[i].contentDetails);
            // const seconds = mom.asSeconds() % 60;
            // const minutes = Math.floor(mom.asSeconds() / 60);
            // const id = parsed.items[i].id;
            // const title = parsed.items[i].snippet.title;
            // const tempYoutube = new Youtube.Youtube('https://www.youtube.com/watch?v=' + id, title, id, minutes + ':' + seconds, discordId, username);
            // console.log(parsed.items[i].snippet.thumbnails);
            const temp = {
              'id': parsed.items[i].snippet.resourceId.videoId,
              'title': parsed.items[i].snippet.title,
              'thumbnail': parsed.items[i].snippet.thumbnails.medium.url,
            };
            // TODO: Private video check like below before pushing
            if (temp.title !== 'Private video') {
              // console.log('pushing');
              arr.push(temp);
            }
            // let allowed = undefined;
            // let blocked = undefined;
            // if (parsed.items[i].contentDetails.regionRestriction !== undefined) {
            //   allowed = parsed.items[i].contentDetails.regionRestriction.allowed;
            //   blocked = parsed.items[i].contentDetails.regionRestriction.blocked;
            // }
            // if (allowed !== undefined && !allowed.includes('US')) {
            //   // console.log(temp.title + ' not allowed');
            // } else if (blocked !== undefined && blocked.includes('US')) {
            //   // console.log(temp.title + ' not allowed');
            // } else if (tempYoutube.title === 'Private video') {
            //   // console.log(tempYoutube.title + ' not allowed');
            // } else {
            //   arr.push(tempYoutube);
            // }
          }
          addYoutube(u, arr, parsed.nextPageToken, callback);
        });

        resp.on('error', () => {
          console.log('error');
        });
      });
    }
  }
}

/**
 * Retrieves detailed information about each song in the array of songs
 * @param {Object} arr Contains the songs to be added
 * @param {Object} store Dj's songs array to add the new song into
 * @param {String} discordId Discord identifier of the player
 * @param {String} username Discord username of the player
 * @param {Object} callback Callback to leave the function
 */
function parseList(arr, store, discordId, username, callback) {
  console.log('parseList');
  ids = arr.splice(0, 50).map((song) => song.id);
  // console.log('adding ' + ids.length + ' ids');
  idsJoined = ids.join();
  if (ids === undefined || ids.length === 0) {
    callback();
  } else {
    https.get('https://content.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' + idsJoined + '&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        const parsed = JSON.parse(data);
        // console.log(parsed.items.length + ' parsed');
        for (let i = 0; i < parsed.items.length; i++) {
          // console.log('in');
          const temp = {
            'id': parsed.items[i].id,
            'title': parsed.items[i].snippet.title,
            'thumbnail': parsed.items[i].snippet.thumbnails.medium.url,
          };
          const mom = moment.duration(parsed.items[i].contentDetails.duration);
          const seconds = mom.asSeconds() % 60;
          const minutes = Math.floor(mom.asSeconds() / 60);
          const channel = parsed.items[i].snippet.channelTitle;
          const tempYoutube = new Youtube('https://www.youtube.com/watch?v=' + temp.id, temp.title, temp.id, minutes + ':' + ((seconds < 10) ? ('0' + seconds) : seconds), discordId, username, temp.thumbnail, channel);
          let allowed = undefined;
          let blocked = undefined;
          if (parsed.items[i].contentDetails.regionRestriction !== undefined) {
            allowed = parsed.items[i].contentDetails.regionRestriction.allowed;
            blocked = parsed.items[i].contentDetails.regionRestriction.blocked;
          }
          if (allowed !== undefined && !allowed.includes('US')) {
            console.log('bad');
            // console.log(temp.title + ' not allowed');
          } else if (blocked !== undefined && blocked.includes('US')) {
            console.log('terrible');
            console.log(parsed.items[i].snippet.title);
            // console.log('https://www.youtube.com/watch?v=' + temp.id);
            // console.log(temp.title + ' not allowed');
          } else {
            store.push(tempYoutube);
          }
        }
        // console.log(parsed.items);
        // console.log('ending store length: ' + store.length);
        if (arr.length === 0) {
          callback();
        } else {
          parseList(arr, store, discordId, username, callback);
        }
      });
    });
  }
}

/**
 * Search YouTube based off the serach query that was specified.
 * @param {String} str Query
 * @param {Number} id Discord identifier for the searcher
 * @param {Object} searches Array holding all searches from users
 * @param {Object} callback Callback to use to leave the async calls
 */
function ytSearch(str, id, searches, callback) {
  console.log('ytSearch');
  // console.log('query: ' + str);
  https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + str + '&type=video&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      const parsed = JSON.parse(data);
      searches[id] = [];
      if (parsed.items === undefined) {
        callback();
      } else {
        for (let i = 0; i < parsed.items.length; i++) {
          searches[id][i] = {};
          searches[id][i].title = parsed.items[i].snippet.title;
          searches[id][i].id = parsed.items[i].id.videoId;
          searches[id][i].type = 'yt';
          searches[id][i].url = 'https://www.youtube.com/watch?v=' + parsed.items[i].id.videoId;
          searches[id][i].thumbnail = parsed.items[i].snippet.thumbnails.medium.url;
          searches[id][i].channel = parsed.items[i].snippet.channelTitle;
        }
        parseVideos(parsed.items, id, searches, callback);
      }
    });
  });
}

/**
 * Gets durations of each YouTube video.
 * @param {Object} videos Array of videos
 * @param {Number} id Discord identifier for the searcher
 * @param {Object} searches Array holding all searches from users
 * @param {Object} callback Callback to use to leave the async calls
 */
function parseVideos(videos, id, searches, callback) {
  console.log('parseVideos');
  if (videos[0] === undefined) {
    console.log('undef');
    callback();
  } else {
    https.get('https://content.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + videos[0].id.videoId + '&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        const parsed = JSON.parse(data);
        // console.log('len: ' + videos.length + ' index: ' + (((videos.length - 1) % 5) * -1));
        searches[id][((videos.length - 1) % 5)].info = parsed;
        // console.log((videos.length - 1) + '     ' + ((videos.length - 5) % 5));
        const mom = moment.duration(parsed.items[0].contentDetails.duration);
        const seconds = mom.asSeconds() % 60;
        const minutes = Math.floor(mom.asSeconds() / 60);
        const temp = searches[id][(((videos.length - 5) % 5) * -1)];
        searches[id][(((videos.length - 5) % 5) * -1)] = new Youtube(temp.url, temp.title, temp.id, minutes + ':' + ((seconds < 10) ? ('0' + seconds) : seconds), null, null, temp.thumbnail, temp.channel);
        videos.shift();
        if (videos.length === 0) {
          callback();
        } else {
          parseVideos(videos, id, searches, callback);
        }
      });
    });
  }
}

module.exports = {
  Youtube: Youtube,
  addYoutube: addYoutube,
  parseList: parseList,
  ytSearch: ytSearch,
};
