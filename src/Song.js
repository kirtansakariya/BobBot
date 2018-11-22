/*
 * Song class
 */
function Song(a, b) {
  this.url = a;
  this.user = b;
}

Song.prototype.init = function(param1, param2) {
  console.log("init");
  this.url = param1;
  this.user = param2;
  return this;
};

Song.prototype.hello = function() {
  console.log("hello");
};

Song.prototype.getUrl = function() {
  return this.url;
};

Song.prototype.getUser = function() {
  console.log(this.user);
  return this.user;
};

module.exports = {
  Song: Song
}
