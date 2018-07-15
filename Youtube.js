/*
 * Youtube Class
 */
function Youtube(u) {
  this.url = u;
  console.log("youtube");
}

/*
 * Initializes a Youtube song with the URL
 *
 * @param {String} u
 * @return {Youtube} this
 */
Youtube.prototype.init = function(u) {
  console.log("youtube init");
  Youtube(u);
  return this;
};

module.exports = {
  Youtube: Youtube
}
