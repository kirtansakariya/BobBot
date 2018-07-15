/*
 * DJ class
 */
function DJ(user) {
  this.user = user;
  this.head = null;
  this.last = null;
  this.num = 0;
}

/*
 * Add a new DJ
 */
DJ.prototype.init = function() {
  console.log("need to update inity");
};

/*
 * Add song to its appropriate DJ
 *
 * @param {String} url
 */
DJ.prototype.addSong = function(url) {
  //determine song method to figure out if its youtube or soundcloud and assign to song
  var song;
  if(this.head == null) {
    this.head = song;
    this.last = song;
    return;
  }
  this.last.next = song;
  this.last = song;
};

module.exports = {
  DJ: DJ
}
