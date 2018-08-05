const SC = require('node-soundcloud');
const auth = require('./auth.json');

/*
 * Soundcloud class
 */
function Soundcloud(u, s, t, l, p) {
  this.url = u;
  this.stream = s;
  this.title = t;
  this.pid = p;
  this.length = l;
  /*SC.get('/resolve?url=' + this.url + '&client_id=' + auth.scid, function(err, track) {
    //console.log(track);
    this.stream = track.stream_url;
    this.title = track.title;
  });*/
}

/*
 * Initializes a Soundcloud song with the url
 *
 * @param {String} u
 * @return {Soundcloud} this
 */
Soundcloud.prototype.init = function(u) {
  console.log("soundcloud init");
  this.url = u;
  return this;
};

/*
 * Gets the stream url for the Soundcloud url
 *
 * @return {String} streamable url
 */
Soundcloud.prototype.getStream = function() {
  /*SC.get('/resolve?url=' + this.url + '&client_id=' + auth.scid, function(err, track) {
      console.log(track);
      return track.stream_url + "?client_id=" + auth.scid;
  });*/
  console.log("getting stream: " + this.stream);
  return this.stream;
};

Soundcloud.prototype.getTitle = function() {
  return this.title;
};

module.exports = {
  Soundcloud: Soundcloud
}
