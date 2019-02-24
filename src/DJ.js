const auth = require('../auth.json');
const Youtube = require('./Youtube.js');
const Soundcloud = require('./Soundcloud.js');
const ytdl = require('ytdl-core');
const http = require('http');
const https = require('https');
const url = require('url');
const moment = require('moment');

function DJ(user) {
  this.user = user.displayName;
  this.id = user.id;
  this.songs = [];
}

function addYoutube(dj, u, arr, page, callback) {
  if(!u.includes('list')) {
    var urlParams = url.parse(u, true);
    https.get('https://content.googleapis.com/youtube/v3/videos?part=snippet&id=' + urlParams.query.v + '&key=' + auth.youtubeApi, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        var parsed = JSON.parse(data);
        if(parsed.items.length === 0) {
          callback();
        } else {
          var temp = {
            "id": parsed.items[0].id,
            "title": parsed.items[0].snippet.title
          };
          arr.push(temp);
          callback();
        }
      });
    })
  } else {
    var urlParams = url.parse(u, true);
    var append = '';
    if(page === undefined) {
      callback();
    } else {
      if(page !== null) {
        append = "&pageToken=" + page;
      }
      https.get('https://content.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + urlParams.query.list + append + '&maxResults=50&key=' + auth.youtubeApi, (resp) => {
        var data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          var parsed = JSON.parse(data);
          for(var i = 0; i < parsed.items.length; i++) {
            var temp = {
              "id": parsed.items[i].snippet.resourceId.videoId,
              "title": parsed.items[i].snippet.title
            };
            if(temp.title !== "Private video") {
              arr.push(temp);
            }
          }
          addYoutube(dj, u, arr, parsed.nextPageToken, callback);
        });
      });
    }
  }
}

var final = [];
function parseList(dj, arr, store, callback) {
  var temp = arr.shift();
  https.get('https://content.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + temp.id + '&key=' + auth.youtubeApi, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      var parsed = JSON.parse(data);
      var mom = moment.duration(parsed.items[0].contentDetails.duration);
      var seconds = mom.asSeconds() % 60;
      var minutes = Math.floor(mom.asSeconds() / 60);
      var tempYoutube = new Youtube.Youtube('https://www.youtube.com/watch?v=' + temp.id, temp.title, temp.id, minutes + ':' + seconds, dj.id, dj.user);
      var allowed = undefined;
      var blocked = undefined;
      if(parsed.items[0].contentDetails.regionRestriction !== undefined) {
        allowed = parsed.items[0].contentDetails.regionRestriction.allowed;
        blocked = parsed.items[0].contentDetails.regionRestriction.blocked;
      }
      if(allowed !== undefined && !allowed.includes("US")) {
        console.log(temp.title + " not allowed");
      } else if(blocked !== undefined && blocked.includes("US")) {
        console.log(temp.title + " not allowed");
      } else {
        store.push(tempYoutube);
      }
      if(arr.length === 0) {
        callback(store.length);
      } else {
        parseList(dj, arr, store, callback);
      }
    });
  });
}

function addSoundcloud(dj, u, callback) {
  console.log("in addSoundcloud");
  var data = null;
  var duration;
  var minutes;
  var seconds;
  var counter = 0;
  console.log("SC");
  http.get('http://api.soundcloud.com/resolve?url=' + u + '&client_id=' + auth.scid, function(resp) {
    let data1 = '';
    resp.on('data', (chunk) => {
      data1 += chunk;
    });

    resp.on('end', () => {
      console.log(data1);
      data1 = JSON.parse(data1);
      https.get(data1.location, (resp) => {
        let data2 = '';
        resp.on('data', (chunk) => {
          data2 += chunk;
        });

        resp.on('end', (chunk) => {
          track = JSON.parse(data2);
          if(track != null) {
            console.log(track);
            if(track.kind == "track") {
              console.log("adding singular soundcloud track");
              duration = track.duration;
              minutes = Math.floor(duration / 60000);
              seconds = ((duration % 60000) / 1000).toFixed(0);
              dj.songs.push(new Soundcloud.Soundcloud(u, track.stream_url + "?client_id=" + auth.scid, track.title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, dj.id, dj.user));
              callback(1);
            } else {
              console.log("adding soundcloud playlist");
              while(track.tracks.length > 0) {
                var t = track.tracks.shift();
                duration = t.duration;
                minutes = Math.floor(duration / 60000);
                seconds = ((duration % 60000) / 1000).toFixed(0);
                dj.songs.push(new Soundcloud.Soundcloud(t.permalink_url, t.stream_url + "?client_id=" + auth.scid, t.title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, dj.id, dj.user));
                counter++;
              }
              callback(counter);
            }
          }
        });
      }).on("error", (err) => {
        console.log("error: " + err.message);
      });
    });
  }).on("error", (err) => {
    console.log("error: " + err.message);
  });
  console.log("outside");
}

DJ.prototype.init = function(u) {
  console.log("need to update inity");
  this.songs = [];
  this.num = 0;
  this.user = u;
  return this;
};

DJ.prototype.addSong = function(url, callback) {
  console.log(typeof(url));
  console.log(url);
  if(url.includes("youtube")) {
    console.log("adding youtube url");
    var songs = [];
    var dj = this;
    var origLength = dj.songs.length;
    addYoutube(dj, url, songs, null, function() {
      console.log(songs);
      console.log(dj.songs);
      parseList(dj, songs, dj.songs, function(num) {
        console.log(dj.songs);
        console.log(dj.songs.length);
        callback("Added " + (num - origLength) + " songs");
      });
    });
  } else if(url.includes("soundcloud")) {
    console.log("adding soundcloud url");
    addSoundcloud(this, url, function(num) {
      callback("Added " + num + " songs");
    });
  } else {
    console.log("needs to provide valid url");
    callback("Invalid url");
  }
  console.log("outside, no callback");
};

DJ.prototype.getStream = function() {
  return this.songs.shift().getStream();
};

DJ.prototype.getSong = function() {
  var song = null;
  var stream = null;
  while(song == null && this.songs.length > 0) {
    song = this.songs.shift();
    if(song.url.includes("youtube")) {
      stream = ytdl(song.url, { filter : 'audioonly' }).on('error', (err) => { console.log(err); song = null; });
    }
  }
  if(song == null) return null;
  if(song.url.includes("youtube")) song.setStream(stream);
  return song;
}

module.exports = {
  DJ: DJ
}

