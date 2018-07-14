module.exports = (function() {
  /*
   * DJ class
   */
  function DJ(user) {
    this.user = user;
    this.head = null;
    this.last = null
  }

  DJ.prototype.init = new function() {
    console.log("need to update init");
  };

  /*
   * Add song to its appropriate DJ
   *
   * @param {Song} song
   */
  DJ.prototype.addSong = new function(song) {
    if(this.head == null) {
      this.head = song;
      this.last = song;
      return;
    }
    this.last.next = song;
    this.last = song;
  };

  return new DJ();

})();
