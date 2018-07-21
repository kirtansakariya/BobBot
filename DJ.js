const auth = require('./auth.json');
const SC = require('node-soundcloud');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(auth.youtubeApi);
const Youtube = require('./Youtube.js');
const Soundcloud = require('./Soundcloud.js');

/*
 * DJ class
 */
function DJ(user) {
  this.user = user;
  this.num = 0;
  this.songs = [];
}

function addYoutube(dj, url) {
  // need to implement adding youtube songs
  if(!url.includes("list")) {
    console.log("adding singular youtube track");
    dj.songs.push(new Youtube.Youtube(url));
    dj.num++;
    return;
  }
  console.log("adding youtube playlist");
  youtube.getPlaylist(url).then(playlist => {
    playlist.getVideos().then(videos => {
      console.log(videos);
      while(videos.length > 0) {
        dj.songs.push(new Youtube.Youtube('https://www.youtube.com/watch?v=' + videos.shift().id));
        dj.num++;
      }
    });
  });
}

function addSoundcloud(dj, url) {
  console.log("in addSoundcloud");
  //var data = getPromise(url);
  //console.log("data: " + data);
  SC.init({
    id: auth.scid
  });
  //console.log(SC);
  SC.get('/resolve?url=' + url + '&client_id=' + auth.scid, function(err, track) {
    console.log("making SC call");
    //console.log("track: " + track.kind);
    //console.log("kind: " + track.kind);
    //data = track;
    if(track != null) {
      console.log("once");
      pass(track);
    }
    /*if(track.kind == "track") {
      console.log("adding singular soundcloud track");
      dj.songs.push(new Soundcloud.Soundcloud(url));
      dj.num++;
      return;
    }
    console.log("adding soundcloud playlist");
    while(track.tracks.length >= 0) {
      dj.songs.push(new Soundcloud.Soundcloud(track.tracks.shift().permalink_url));
      dj.num++;
    }*/
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
DJ.prototype.addSong = function(url) {
  //determine song method to figure out if its youtube or soundcloud and assign to song
  console.log(typeof(url));
  console.log(url);
  if(url.includes("youtube")) {
    console.log("adding youtube url");
    addYoutube(this, url);
  } else if(url.includes("soundcloud")) {
    console.log("adding soundcloud url");
    addSoundcloud(this, url);
  } else {
    console.log("needs to provide valid url");
  }
};

DJ.prototype.getStream = function() {
  return this.songs.shift().getStream();
};

module.exports = {
  DJ: DJ
}
