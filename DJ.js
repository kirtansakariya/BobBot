/*
 * DJ class
 */
function DJ(user) {
  this.user = user;
  this.num = 0;
  this.songs = [];
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
};

module.exports = {
  DJ: DJ
}
