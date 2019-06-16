const Youtube = require('./Youtube.js');
const Soundcloud = require('./Soundcloud.js');
// const ytdl = require('ytdl-core');
const youtubedl = require('youtube-dl');
const http = require('http');
const https = require('https');

/**
 * Create a new DJ.
 * @param {String} displayName Name of the user
 * @param {Number} id Discord ID of the user
 */
function DJ(displayName, id) {
  console.log('dname:');
  console.log(displayName);
  console.log('id:');
  console.log(id);
  console.log('DJ');
  this.user = displayName;
  this.id = id;
  this.songs = [];
}

DJ.prototype.init = function(u) {
  console.log('init');
  // console.log('need to update inity');
  this.songs = [];
  this.num = 0;
  this.user = u;
  return this;
};

// DJ.prototype.addSong = function(url, callback) {
/**
 * Gets the array of songs from the specified url
 * @param {*} url Url to be read
 * @param {String} discordId Discord identifier of the player
 * @param {String} username Discord username of the player
 * @param {*} callback Callback to leave the function
 */
function getSongsFromUrl(url, discordId, username, callback) {
  console.log('addSong');
  // console.log(typeof(url));
  // console.log(url);
  if (url.includes('youtube')) {
    // console.log('adding youtube url');
    const songs = [];
    // const dj = this;
    // const origLength = dj.songs.length;
    Youtube.addYoutube(url, songs, null, () => {
      console.log('done w/addYoutube');
      console.log(songs);
      // console.log(dj.songs);
      const final = [];
      Youtube.parseList(songs, final, discordId, username, (num) => {
        // console.log(dj.songs);
        // console.log(dj.songs.length);
        console.log('done w/parseList');
        console.log(final);
        callback('Added ' + final.length + ' songs', final);
      });
    });
  } else if (url.includes('soundcloud')) {
    // console.log('adding soundcloud url');
    const songs = [];
    Soundcloud.addSoundcloud(songs, url, discordId, username, (num) => {
      callback('Added ' + num + ' songs', songs);
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
      // stream = ytdl(song.url, {filter: 'audioonly'}).on('error', (err) => {
      //   console.log('error in ytdl');
      //   console.log(err);
      //   song = null;
      // });
      stream = youtubedl(song.url);
    }
  }
  if (song == null) return null;
  if (song.url.includes('youtube')) song.setStream(stream);
  return song;
};

module.exports = {
  DJ: DJ,
  getSongsFromUrl: getSongsFromUrl,
};

