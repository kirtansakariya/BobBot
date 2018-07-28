const ytdl = require('ytdl-core');

/*
 * Youtube Class
 */
function Youtube(u, t, i) {
  this.url = u;
  console.log(u);
  //this.stream = ytdl(u, { filter : 'audioonly' }).on('error', (err) => console.log(err));
  this.stream = null;
  this.title = t;
  this.seconds = null;
  this.id = i;
  /*ytdl.getInfo(u, function(err, info) {
    this.title = info.title;
    console.log(err);
    callback();
  });*/
  console.log("youtube");
}

/*
 * Initializes a Youtube song with the URL
 *
 * @param {String} u
 * @return {Youtube} this
 */
Youtube.prototype.init = function(u) {
  console.log("youtube init");
  Youtube(u);
  return this;
};

/*
 * Creates a stream from the Youtube url
 *
 * @return {Object} the stream
 */
Youtube.prototype.getStream = function() {
  //return ytdl(this.url, { filter : 'audioonly' });
  console.log("getting stream");
  console.log(this.stream);
  return this.stream;
};

Youtube.prototype.setStream = function(s) {
  console.log("setting stream");
  console.log(s);
  this.stream = s;
};

Youtube.prototype.getTitle = function() {
  return this.title;
};

Youtube.prototype.getUrl = function() {
  return this.url;
};

module.exports = {
  Youtube: Youtube
}
