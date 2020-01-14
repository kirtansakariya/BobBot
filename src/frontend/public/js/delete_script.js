$(document).ready(() => {
  setResultsHeight();
});

$(window).on('resize', () => {
  setResultsHeight();
});

/**
 * Sets the height of the results div
 */
function setResultsHeight() {
  console.log('in setResultsHeight');
  const songs = document.getElementById('songs');
  const footer = document.getElementsByTagName('footer')[0];
  const wrapper = document.getElementById('wrapper');
  const header = document.getElementById('header');
  const deleteHeader = document.getElementById('delete-header');
  let higher = 0;
  // if (results.clientHeight >= songs.clientHeight) {
  //   higher = results.clientHeight;
  // } else {
  //   higher = songs.clientHeight;
  // }
  console.log(window.innerHeight);
  console.log(wrapper.clientHeight);
  console.log('header: ' + header.clientHeight);
  const resultsHeight = window.innerHeight - header.clientHeight - deleteHeader.clientHeight - footer.clientHeight - 45;
  console.log(resultsHeight);
  songs.style.height = resultsHeight + 'px';
  document.getElementById('songs').style.height = resultsHeight + 'px';
}
