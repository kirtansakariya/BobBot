const auth = require('../auth.json');

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
  console.log("soundcloud init");
  this.url = u;
  return this;
};

Soundcloud.prototype.getStream = function() {
  console.log("getting stream: " + this.stream);
  return this.stream;
};

Soundcloud.prototype.getTitle = function() {
  return this.title;
};

module.exports = {
  Soundcloud: Soundcloud
}
