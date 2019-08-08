$('#search-form').on('submit', (e) => {
  console.log('jquery');
  console.log(e);
  e.preventDefault();
});

$(document).ready(() => {
  // const results = document.getElementById('results');
  // const footer = document.getElementsByTagName('footer')[0];
  // results.style.height = '0px';
  // console.log('ready: ' + results.style.height);
  // console.log(window.innerHeight);
  // console.log(document.body.clientHeight);
  // console.log(footer.clientHeight);
  // // const resultsHeight = window.innerHeight - document.body.clientHeight - footer.clientHeight - 10;
  // const resultsHeight = window.innerHeight - document.getElementById('wrapper').clientHeight - footer.clientHeight - 10;
  // console.log(resultsHeight);
  // results.style.height = resultsHeight + 'px';
  // document.getElementById('songs').style.height = document.getElementById('search-bar').clientHeight + resultsHeight;
  setResultsHeight();
});

$(window).on('resize', () => {
  // const results = document.getElementById('results');
  // const footer = document.getElementsByTagName('footer')[0];
  // results.style.height = '0px';
  // // console.log('resize: ' + results.style.height);
  // console.log(window.innerHeight);
  // console.log(document.body.clientHeight);
  // console.log(footer.clientHeight);
  // const resultsHeight = window.innerHeight - document.body.clientHeight - footer.clientHeight - 10;
  // console.log(resultsHeight);
  // results.style.height = resultsHeight + 'px';
  // document.getElementById('songs').style.height = document.getElementById('search-bar').clientHeight + resultsHeight + 'px';
  setResultsHeight();
});

/**
 * Sets the height of the results div
 */
function setResultsHeight() {
  console.log('in setResultsHeight');
  const songs = document.getElementById('songs');
  const results = document.getElementById('results');
  const footer = document.getElementsByTagName('footer')[0];
  const select = document.getElementById('select-results');
  const wrapper = document.getElementById('wrapper');
  let higher = 0;
  if (results.clientHeight >= songs.clientHeight) {
    higher = results.clientHeight;
  } else {
    higher = songs.clientHeight;
  }
  console.log(select.clientHeight);
  console.log('window: ' + window.innerHeight);
  console.log('wrapper: ' + wrapper.clientHeight);
  console.log('footer: ' + footer.clientHeight);
  const resultsHeight = window.innerHeight - wrapper.clientHeight + higher - footer.clientHeight - 10;
  console.log('results: ' + resultsHeight);
  results.style.height = resultsHeight + 'px';
  document.getElementById('songs').style.height = resultsHeight + 'px';
}

/**
 * Handles the search according to the dropdown value selected
 * @param {Object} e Information about the event fired by the input field
 */
function search(e) {
  if (e.keyCode === 13) {
    // document.getElementById('results').innerHTML = '<div class="text-center">Loading...</div>';
    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('invalid').classList.add('d-none');
    const type = document.getElementById('type').value;
    const query = document.getElementById('search-form').value;
    if (type === '1') {
      console.log('is link');
      link(query);
    } else if (type === '2') {
      console.log('is SC');
      sc(query);
    } else if (type === '3') {
      console.log('YT');
      yt(query);
    }
  }
}

/**
 * Handles the case for showing the songs of a link
 * @param {String} query URL that was passed in
 */
function link(query) {
  // console.log(Session);
  // console.log('first query: ' + query);
  document.getElementById('select-results').classList.add('d-none');
  document.getElementById('select-all').checked = false;
  document.getElementById('results').innerHTML = '';
  const request = makeRequest('GET', '/api/urlsongs?query=' + encodeURIComponent(query));
  request.send();
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    // console.log(data.songs);
    if (data.songs.length === 0) {
      document.getElementById('loading').classList.add('d-none');
      document.getElementById('invalid').classList.remove('d-none');
      return;
    }
    const songs = JSON.parse(data.songs);
    document.getElementById('loading').classList.add('d-none');
    if (songs.length === 0) {
      // document.getElementById('results').textContent = 'Invalid URL';
      document.getElementById('invalid').classList.remove('d-none');
      return;
    }
    // const results = document.getElementById('results');
    // console.log(document.body.clientHeight);
    // console.log('window: ' + window.innerHeight);
    document.getElementById('select-results').classList.remove('d-none');
    // console.log(document.body.clientHeight);
    // const resultsHeight = window.innerHeight - document.body.clientHeight + results.style.height;
    // results.style.height = resultsHeight + 'px';
    // console.log(resultsHeight);
    console.log(songs);
    displaySongs(songs, true);
    setResultsHeight();
  };
  request.onerror = () => {
    console.log(request.error);
  };
}

/**
 * Searches for SoundCloud songs based off the query
 * @param {String} query Query for the SoundCloud song
 */
function sc(query) {
  // console.log('sc query: ' + query);
  document.getElementById('select-results').classList.add('d-none');
  document.getElementById('results').innerHTML = '';
  const request = makeRequest('GET', '/api/scsongs?query=' + encodeURIComponent(query));
  request.send();
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    console.log(data.songs);
    if (data.songs.length === 0) {
      document.getElementById('loading').classList.add('d-none');
      const invalid = document.getElementById('invalid');
      invalid.textContent = 'Query returned 0 results';
      invalid.classList.remove('d-none');
      return;
    }
    const songs = JSON.parse(data.songs);
    document.getElementById('loading').classList.add('d-none');
    if (songs.length === 0) {
      document.getElementById('invalid').classList.remove('d-none');
      return;
    }
    // const results = document.getElementById('results');
    // const results = document.getElementById('results');
    document.getElementById('select-results').classList.add('d-none');
    // const resultsHeight = window.innerHeight - document.body.clientHeight + results.style.height;
    // results.style.height = resultsHeight + 'px';
    displaySongs(songs, false);
  };
}

/**
 * Searches for YouTube songs based off the query
 * @param {String} query Query for the YouTube song
 */
function yt(query) {
  document.getElementById('select-results').classList.add('d-none');
  document.getElementById('results').innerHTML = '';
  const request = makeRequest('GET', '/api/ytsongs?query=' + encodeURIComponent(query));
  request.send();
  request.onload = () => {
    console.log(request.responseText);
    const data = JSON.parse(request.responseText);
    if (data.songs.length === 0) {
      document.getElementById('loading').classList.add('d-none');
      const invalid = document.getElementById('invalid');
      invalid.textContent = 'Query returned 0 results';
      invalid.classList.remove('d-none');
      return;
    }
    const songs = JSON.parse(data.songs);
    document.getElementById('loading').classList.add('d-none');
    if (songs.length === 0) {
      document.getElementById('invalid').classList.remove('d-none');
      return;
    }
    // const results = document.getElementById('results');
    document.getElementById('select-results').classList.add('d-none');
    // const resultsHeight = window.innerHeight - document.body.clientHeight + results.style.height;
    // results.style.height = resultsHeight + 'px';
    displaySongs(songs, false);
  };
}

/**
 * Displays the songs on the page
 * @param {Object} songs Songs to be added
 * @param {Boolean} link Determines if the results were from a link or not
 */
function displaySongs(songs, link) {
  const results = document.getElementById('results');
  const playlist = document.getElementsByClassName('delete-check');
  const map = new Map();
  for (let i = 0; i < playlist.length; i++) {
    map.set(playlist[i].dataset.title, true);
  }
  for (let i = 0; i < songs.length; i++) {
    const divSong = document.createElement('div');
    divSong.classList = ['song row'];

    const divSelImg = document.createElement('div');
    divSelImg.classList = ['col-lg-4 div-sel-img'];
    const select = document.createElement('input');
    select.type = 'checkbox';
    select.classList = ['checkbox search-check'];
    if (map.get(songs[i].title)) select.disabled = true;
    select.dataset.index = i;
    select.dataset.url = songs[i].url;
    // console.log(songs[i]);
    // console.log(songs[i].stream);
    if (songs[i].stream !== undefined) select.dataset.stream = songs[i].stream;
    select.dataset.title = songs[i].title;
    select.dataset.length = songs[i].length;
    if (songs[i].id !== undefined) select.dataset.id = songs[i].id;
    select.dataset.type = songs[i].type;
    select.dataset.thumbnail = songs[i].thumbnail;
    select.dataset.channel = songs[i].channel;
    const img = document.createElement('img');
    img.src = songs[i].thumbnail;
    if (!link) select.style.visibility = 'hidden';
    divSelImg.appendChild(select);
    divSelImg.appendChild(img);

    const divP = document.createElement('div');
    divP.classList = ['col-lg-6 song-info-div'];
    const p = document.createElement('p');
    p.innerHTML = '<b>' + songs[i].title + '</b> - ' + songs[i].length + '<br />Channel: ' + songs[i].channel;
    p.classList = ['song-info-p'];
    divP.appendChild(p);

    const divButton = document.createElement('div');
    divButton.classList = ['col-lg-2 song-info-button'];
    const button = document.createElement('button');
    button.textContent = 'Add';
    if (map.get(songs[i].title)) {
      button.classList = ['btn btn-success'];
      button.disabled = true;
    } else {
      button.classList = ['btn btn-danger'];
    }
    button.onclick = addSong;
    button.dataset.index = i;
    divButton.appendChild(button);

    divSong.appendChild(divSelImg);
    divSong.appendChild(divP);
    divSong.appendChild(divButton);

    results.appendChild(divSong);
  }
}

/**
 * Makes a XMLHttpRequest before sending it
 * @param {String} type Type of request
 * @param {String} uri Endpoint to make the request to
 * @return {Object} XMLHttpRequest
 */
function makeRequest(type, uri) {
  const url = window.location.origin + uri;
  const request = new XMLHttpRequest();
  request.open(type, url, true);
  if (type === 'POST') request.setRequestHeader('Content-Type', 'application/json');
  return request;
}

/**
 * Checks all the results checkboxes if the Select all checkbox is selected
 * @param {Object} e Information about the event fired by the input field
 */
function selectAllResults(e) {
  const checked = e.target.checked;
  const arr = document.getElementsByClassName('search-check');
  for (let i = 0; i < arr.length; i++) if (!arr[i].disabled) arr[i].checked = checked;
}

/**
 * Adds a single song to the playlist
 * @param {Object} e Information about the event fired by the button
 */
function addSong(e) {
  addSingle(e);
  updatePlaylist();
}

/**
 * Adds all the selected to the playlist
 */
function addSelected() {
  console.log('adding all');
  const checks = document.getElementsByClassName('search-check');
  for (let i = 0; i < checks.length; i++) {
    if (checks[i].checked) {
      addSingle({'target': checks[i].parentNode.parentNode.children[2].children[0]});
    }
  }
  updatePlaylist();
}

/**
 * Adds a single song to the playlist and displays it
 * @param {Object} e Information about the event fired by the button
 */
function addSingle(e) {
  document.getElementById('empty').classList.add('d-none');
  document.getElementById('select-songs').classList.remove('d-none');
  console.log('adding single');
  e.target.classList = ['btn btn-success'];
  e.target.disabled = true;
  const song = e.target.parentNode.parentNode.children[0].children[0];
  song.disabled = true;
  song.checked = false;
  console.log(song.dataset);

  const divSong = document.createElement('div');
  // divSong.id = 'song-' + document.getElementsByClassName('delete-check').length;
  divSong.classList = ['song row'];

  const divSelImg = document.createElement('div');
  divSelImg.classList = ['col-lg-4 div-sel-img'];
  const select = document.createElement('input');
  select.type = 'checkbox';
  select.classList = ['checkbox delete-check'];
  // select.dataset.index = document.getElementsByClassName('delete-check').length;
  select.dataset.url = song.dataset.url;
  if (song.dataset.stream !== undefined) select.dataset.stream = song.dataset.stream;
  select.dataset.title = song.dataset.title;
  select.dataset.length = song.dataset.length;
  if (song.dataset.id !== undefined) select.dataset.id = song.dataset.id;
  select.dataset.type = song.dataset.type;
  select.dataset.thumbnail = song.dataset.thumbnail;
  select.dataset.channel = song.dataset.channel;
  const img = document.createElement('img');
  img.src = song.dataset.thumbnail;
  divSelImg.appendChild(select);
  divSelImg.appendChild(img);

  const divP = document.createElement('div');
  divP.classList = ['col-lg-6 song-info-div'];
  const p = document.createElement('p');
  p.innerHTML = '<b>' + song.dataset.title + '</b> - ' + song.dataset.length + '<br />Channel: ' + song.dataset.channel;
  p.classList = ['song-info-p'];
  divP.appendChild(p);

  const divButton = document.createElement('div');
  divButton.classList = ['col-lg-2 song-info-button'];
  const button = document.createElement('button');
  button.textContent = 'Delete';
  button.classList = ['btn btn-danger'];
  button.onclick = deleteSong;
  // button.dataset.index = document.getElementsByClassName('delete-check').length;
  divButton.appendChild(button);

  divSong.appendChild(divSelImg);
  divSong.appendChild(divP);
  divSong.appendChild(divButton);

  songs.appendChild(divSong);
}

/**
 * Checks all the songs checkboxes if the Select all checkbox is selected
 * @param {Object} e Information about the event fired by the input field
 */
function selectAllSongs(e) {
  console.log('in new');
  const checked = e.target.checked;
  const arr = document.getElementsByClassName('delete-check');
  for (let i = 0; i < arr.length; i++) if (!arr[i].disabled) arr[i].checked = checked;
}

/**
 * Deletes a single song to the playlist
 * @param {Object} e Information about the event fired by the button
 */
function deleteSong(e) {
  deleteSingle(e);
  updatePlaylist();
}

/**
 * Deletes the songs that are selected
 */
function deleteSelected() {
  console.log('delete selected');
  const checks = document.getElementsByClassName('delete-check');
  console.log(checks);
  for (let i = 0; i < checks.length; i++) {
    if (checks[i].checked) {
      console.log(i);
      deleteSingle({'target': checks[i].parentNode.parentNode.children[2].children[0]});
      i--;
    }
  }
  updatePlaylist();
}

/**
 * Deletes a single song from the playlist and removes it from the display
 * @param {Object} e Information about the event fired by the button
 */
function deleteSingle(e) {
  console.log('deleteSingle');
  console.log(e);
  // const song = document.getElementById('song-' + e.target.dataset.index);
  const song = e.target.parentNode.parentNode.children[0].children[0];
  console.log(song.parentNode.parentNode);
  const title = song.dataset.title;
  console.log('orig title: ' + title);
  song.parentNode.parentNode.parentNode.removeChild(song.parentNode.parentNode);
  const results = document.getElementById('results').children;
  for (let i = 0; i < results.length; i++) {
    // console.log(results[i].children[0].children[0].dataset.title);
    if (results[i].children[0].children[0].dataset.title === title) {
      results[i].children[2].children[0].classList = 'btn btn-danger';
      results[i].children[2].children[0].disabled = false;
      results[i].children[0].children[0].disabled = false;
    }
  }
  if (document.getElementById('songs').children.length === 1) {
    document.getElementById('select-songs').classList.add('d-none');
    document.getElementById('empty').classList.remove('d-none');
  }
}

/**
 * Saves the playlist to the database
 */
function updatePlaylist() {
  const songs = document.getElementsByClassName('delete-check');
  console.log(songs);
  const obj = [];
  for (let i = 0; i < songs.length; i++) {
    obj[i] = {};
    obj[i].url = songs[i].dataset.url;
    obj[i].stream = songs[i].dataset.stream;
    obj[i].title = songs[i].dataset.title;
    obj[i].length = songs[i].dataset.length;
    obj[i].id = songs[i].dataset.id;
    obj[i].type = songs[i].dataset.type;
    obj[i].thumbnail = songs[i].dataset.thumbnail;
    obj[i].channel = songs[i].dataset.channel;
  }
  console.log(obj);

  const playlistName = new URLSearchParams(window.location.search.substring(1)).get('name');
  console.log(playlistName);
  const request = makeRequest('POST', '/api/save?playlist=' + encodeURIComponent(playlistName));
  request.send(JSON.stringify(obj));
  request.onload = () => {
    const boo = JSON.parse(request.responseText);
    if (!boo) {
      console.log('update failed');
    } else {
      console.log('update success');
    }
  };
}

// function sleep(milliseconds) {
//   var start = new Date().getTime();
//   for (var i = 0; i < 1e7; i++) {
//     if ((new Date().getTime() - start) > milliseconds){
//       break;
//     }
//   }
// }

console.log('loaded in script.js');
