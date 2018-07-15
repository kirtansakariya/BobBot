/*
 * Youtube Class
 */
function Youtube(u) {
  this.url = u;
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
  return ytdl(this.url, { filter : 'audioonly' });
};

module.exports = {
  Youtube: Youtube
}
