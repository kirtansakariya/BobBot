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
  console.log("youtube init");
  Youtube(u);
  return this;
};

Youtube.prototype.getStream = function() {
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
