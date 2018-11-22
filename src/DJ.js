const auth = require('../auth.json');
//const SC = require('node-soundcloud');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(auth.youtubeApi);
const Youtube = require('./Youtube.js');
const Soundcloud = require('./Soundcloud.js');
const ytdl = require('ytdl-core');
const http = require('http');
const https = require('https');
const url = require('url');
const moment = require('moment');
const perfHooks = require('perf_hooks');

/*
 * DJ class
 */
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

// function addYoutube(dj, url, callback) {
//   // need to implement adding youtube songs
//   if(!url.includes("list")) {
//     console.log("adding singular youtube track");
//     ytdl.getInfo(url, function(err, info) {
//       if(!err) {
//         console.log(err);
//         callback();
// //      console.log(info);
//         var stream = ytdl(url, { filter : 'audioonly' }).on('error', (err) => { console.log(err); });
//         dj.songs.push(new Youtube.Youtube(url, info.title, info.vid, dj.id, dj.user));
//         callback();
//       } else {
//         dj.songs.push(new Youtube.Youtube(url, "title", "vid", "id", "user"));
//       }
//     });
//   } else {
//     console.log("adding youtube playlist: " + url);
//     youtube.getPlaylist(url).then(function(playlist) {
//       playlist.getVideos().then(async function(videos) {
//         //console.log(videos);
//         var count = 0;
//         //var total = videos.length;
//         //var boo = false;
//         while(videos.length > 0) {
//           var v = videos.shift();
//           console.log(v.raw.status.privacyStatus);
//           //console.log(v);
//           console.log(videos.length);
//           if(v.thumbnails == null) continue;
//           //var stream = await ytdl('https://www.youtube.com/watch?v=' + v.id, { filter : 'audioonly' }).on('error', (err) => { console.log(err); v = null; });
//           //if(v == null) continue;
//           console.log("still going: " + v.title);
//           dj.songs.push(new Youtube.Youtube('https://www.youtube.com/watch?v=' + v.id, v.title, v.id, dj.id, dj.user));
//         }
//         /*console.log(total);
//         for(var i = 0; i < total; i++) {
//           //console.log(i);
//           (function(j) {
//             //console.log(i);
//             var stream = ytdl('https://www.youtube.com/watch?v=' + videos[j].id, { filter : 'audioonly' }).on('error', (err) => { console.log(videos[j]); });
//           }(i));
//         }*/
//         console.log(dj.songs.length);
//         callback();
//       }).catch(console.log);
//     }).catch(console.log);
//   }
// }

var final = [];
function parseList(dj, arr, store, callback) {
  // console.log("done with single");
  // console.log(arr);
  // console.log(arr.length);
  var temp = arr.shift();
  // console.log(temp);
  https.get('https://content.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + temp.id + '&key=' + auth.youtubeApi, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      var parsed = JSON.parse(data);
      // console.log(parsed.items[0]);
      //console.log(parsed.items[0].contentDetails);
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
        callback();
      } else {
        parseList(dj, arr, store, callback);
      }
    });
  });
}

function addSoundcloud(dj, u, callback) {
  console.log("in addSoundcloud");
  //var data = getPromise(url);
  //console.log("data: "+ data);
  var data = null;
  var duration;
  var minutes;
  var seconds;
  /*SC.init({
    id: auth.scid
  });*/
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
              //console.log(track);
              duration = track.duration;
              minutes = Math.floor(duration / 60000);
              seconds = ((duration % 60000) / 1000).toFixed(0);
              //console.log(minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
              dj.songs.push(new Soundcloud.Soundcloud(u, track.stream_url + "?client_id=" + auth.scid, track.title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, dj.id, dj.user));
              callback();
            } else {
              console.log("adding soundcloud playlist");
              while(track.tracks.length > 0) {
                var t = track.tracks.shift();
                //console.log(t);
                duration = t.duration;
                minutes = Math.floor(duration / 60000);
                seconds = ((duration % 60000) / 1000).toFixed(0);
                //console.log(minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
                dj.songs.push(new Soundcloud.Soundcloud(t.permalink_url, t.stream_url + "?client_id=" + auth.scid, t.title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds, dj.id, dj.user));
              }
              callback();
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

/*function pass(track) {
  console.log("in pass");
  if(track.kind == "track") {
    console.log("adding singular soundcloud track");
    dj.songs.push(new Soundcloud.Soundcloud(url));
    dj.num++;
    return;
  }
  console.log("adding soundcloud playlist");
  while(track.tracks.length >= 0) {
    dj.songs.push(new Soundcloud.Soundcloud(track.tracks.shift().permalink_url));
    dj.num++;
  }
}*/

/*
 * Add a new DJ
 *
 * @param {String} url
 * @return {DJ} this
 */
DJ.prototype.init = function(u) {
  console.log("need to update inity");
  this.songs = [];
  this.num = 0;
  this.user = u;
  return this;
};

/*
 * Add song to its appropriate DJ
 *
 * @param {String} url
 */
DJ.prototype.addSong = function(url, callback) {
  //determine song method to figure out if its youtube or soundcloud and assign to song
  console.log(typeof(url));
  console.log(url);
  if(url.includes("youtube")) {
    console.log("adding youtube url");
    var songs = [];
    var dj = this;
    addYoutube(dj, url, songs, null, function() {
      console.log(songs);
      console.log(dj.songs);
      parseList(dj, songs, dj.songs, function() {
        console.log(dj.songs);
        console.log(dj.songs.length);
        callback();
      });
    });
  } else if(url.includes("soundcloud")) {
    console.log("adding soundcloud url");
    addSoundcloud(this, url, function() {
      callback();
    });
  } else {
    console.log("needs to provide valid url");
    callback();
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

/*var final = [];
function parseList(arr, store, callback) {
  // console.log("done with single");
  // console.log(arr);
  // console.log(arr.length);
  var temp = arr.shift();
  // console.log(temp);
  https.get('https://content.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + temp.id + '&key=' + auth.youtubeApi, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      var parsed = JSON.parse(data);
      // console.log(parsed.items[0]);
      //console.log(parsed.items[0].contentDetails);
      var mom = moment.duration(parsed.items[0].contentDetails.duration);
      var seconds = mom.asSeconds() % 60;
      var minutes = Math.floor(mom.asSeconds() / 60);
      var tempYoutube = new Youtube.Youtube('https://www.youtube.com/watch?v=' + temp.id, temp.title, temp.id, minutes + ':' + seconds, 'test', 'test');
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
        callback();
      } else {
        parseList(arr, store, callback);
      }
    });
  });
}*/

/*console.log('starting calls')
temp = new DJ('Bob');
var songs = [];
var final = [];
var single = 'https://www.youtube.com/watch?v=Kzj9knFJ78A';
var playlist = 'https://www.youtube.com/playlist?list=PLuZADpUBCdIU15qznzTEOfzghV__T060Y';
// var t0 = perfHooks.performance.now();
addYoutube(temp, single, songs, null, function() {
  parseList(songs, final, function() {
    // console.log(final);
    console.log("going to do playlist now");
    addYoutube(temp, playlist, songs, null, function() {
      parseList(songs, final, function() {
        console.log(final);
        console.log(final.length);
        // var t1 = perfHooks.performance.now();
        // console.log((t1 - t0));
        for(var i = 0; i < final.length; i++) {
          ytdl(final[i].url, { filter : 'audioonly' }).on('error', (error, i, final) => { console.log(error); console.log(i); console.log(final[i]);});
        }
        console.log("done");
      });
    });
  });
});*/
