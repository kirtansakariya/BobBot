/**
 * Create a Soundcloud song.
 * @param {string} u The url of the song.
 * @param {string} s The url of the stream.
 * @param {string} t The title of the song.
 * @param {string} l The length of the song.
 * @param {string} p The Discord id of the player.
 * @param {string} pl The name of the player.
 */
function Soundcloud(u, s, t, l, p, pl) {
  this.url = u;
  this.stream = s;
  this.title = t;
  this.pid = p;
  this.length = l;
  this.player = pl;
  this.remove = false;
}

Soundcloud.prototype.init = function(u) {
  console.log('init');
  this.url = u;
  return this;
};

Soundcloud.prototype.getStream = function() {
  console.log('getStream');
  return this.stream;
};

Soundcloud.prototype.getTitle = function() {
  console.log('getTitle');
  return this.title;
};

module.exports = {
  Soundcloud: Soundcloud,
};
