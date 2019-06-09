/**
 * Initialize a Youtube song.
 * @param {string} u The url.
 * @param {string} t The title of the song.
 * @param {number} i The Youtube id of the song.
 * @param {string} l The length of the song.
 * @param {string} p The Discord player id of the player.
 * @param {string} pl The Discord name of the player.
 */
function Youtube(u, t, i, l, p, pl) {
  this.url = u;
  this.stream = null;
  this.title = t;
  this.length = null;
  this.id = i;
  this.pid = p;
  this.player = pl;
  this.remove = false;
  this.length = l;
}

Youtube.prototype.init = function(u) {
  console.log('init');
  this.url = u;
  return this;
};

Youtube.prototype.getStream = function() {
  console.log('getStream');
  return this.stream;
};

Youtube.prototype.setStream = function(s) {
  console.log('setStream');
  this.stream = s;
};

Youtube.prototype.getTitle = function() {
  console.log('getTitle');
  return this.title;
};

Youtube.prototype.getUrl = function() {
  console.log('getUrl');
  return this.url;
};

module.exports = {
  Youtube: Youtube,
};
