const ytdl = require('ytdl-core');

/*
 * Youtube Class
 */
function Youtube(u, t, s) {
  this.url = u;
  console.log(u);
  //this.stream = ytdl(u, { filter : 'audioonly' }).on('error', (err) => console.log(err));
  this.stream = s;
  this.title = t
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
  return this.stream;
};

module.exports = {
  Youtube: Youtube
}
