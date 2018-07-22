const auth = require('./auth.json');
const SC = require('node-soundcloud');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(auth.youtubeApi);
const Youtube = require('./Youtube.js');
const Soundcloud = require('./Soundcloud.js');
const ytdl = require('ytdl-core');

/*
 * DJ class
 */
function DJ(user) {
  this.user = user;
  this.num = 0;
  this.songs = [];
}

function addYoutube(dj, url, callback) {
  // need to implement adding youtube songs
  if(!url.includes("list")) {
    console.log("adding singular youtube track");
    dj.songs.push(new Youtube.Youtube(url, function() {
      dj.num++;
      callback();
    }));
  }
  console.log("adding youtube playlist: " + url);
  youtube.getPlaylist(url).then(playlist => {
    playlist.getVideos().then(videos => {
      //console.log(videos);
      var fun = 0;
      while(videos.length > 0) {
        var v = videos.shift();
        console.log(v.raw.status.privacyStatus);
        console.log(v);
        console.log(videos.length);
        var stream = ytdl('https://www.youtube.com/watch?v=' + v.id, { filter : 'audioonly' }).on('error', (err) => { console.log(err); v = null; });
        if(v == null) continue;
        //console.log("still going: " + v.title);
        dj.songs.push(new Youtube.Youtube('https://www.youtube.com/watch?v=' + v.id, v.title, stream));
        dj.num++;
      }
      console.log(fun);
      callback();
    }).catch(console.log);
  }).catch(console.log);
}

function addSoundcloud(dj, url, callback) {
  console.log("in addSoundcloud");
  //var data = getPromise(url);
  //console.log("data: "+ data);
  var data = null;
  SC.init({
    id: auth.scid
  });
  console.log("SC");
  SC.get('/resolve?url=' + url + '&client_id=' + auth.scid, function(err, track) {
    console.log("making SC call");
    //console.log(track.kind);
    //console.log("track: " + track.kind);
    //console.log("kind: " + track.kind);
    //data = track;
    /*if(track != null) {
      console.log("once");
      pass(track);
    }*/
    console.log("err: " + err);
    console.log(track);
    if(track != null) {
      data = "hi";
      if(track.kind == "track") {
        console.log("adding singular soundcloud track");
        dj.songs.push(new Soundcloud.Soundcloud(url, track.stream_url, track.title));
        dj.num++;
        callback();
      }
      console.log("adding soundcloud playlist");
      while(track.tracks.length >= 0) {
        var t = track.tracks.shift();
        //console.log(t);
        dj.songs.push(new Soundcloud.Soundcloud(t.permalink_url, t.stream_url, t.title));
        dj.num++;
      }
      callback();
    }
  });
  console.log("outside");
}

function pass(track) {
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
}

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
    addYoutube(this, url, function() {
      callback();
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

module.exports = {
  DJ: DJ
}
