module.exports = (function() {
  /*
   * Song class
   */
  function Song(url, user) {
    this.url = url;
    this.user = user;
    this.next = null;
  }

  /*Song.prototype.hello = function() {
    console.log("Song Hello");
  }*/

  Song.prototype.init = function(param1, param2) {
    console.log("init");
    this.url = param1;
    this.url = param2;
    return this;
  }

  Song.prototype.hello = function() {
    console.log("hello");
  };

  Song.prototype.getUrl = function() {
    console.log(this.url);
    return this.url;
  };

  Song.prototype.getUser = function() {
    console.log(this.user);
    return this.user;
  };

  return new Song();

})();
