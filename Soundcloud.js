/*
 * Soundcloud class
 */
function Soundcloud(u) {
  this.url = u;
}

/*
 * Initializes a Soundcloud song with the url
 *
 * @param {String} u
 * @return this
 */
Soundcloud.prototype.init = function(u) {
  console.log("soundcloud init");
  Soundcloud(u);
  return this;
};

module.exports = {
  Soundcloud: Soundcloud
}
