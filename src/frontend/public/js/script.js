$('#search-form').on('submit', (e) => {
  console.log('jquery');
  console.log(e);
  e.preventDefault();
});

$(document).ready(() => {
  const results = document.getElementById('results');
  const footer = document.getElementsByTagName('footer')[0];
  const resultsHeight = window.innerHeight - document.body.clientHeight - footer.clientHeight - 10;
  results.style.height = resultsHeight + 'px';
  document.getElementById('songs').style.height = document.getElementById('search-bar').clientHeight + resultsHeight + 'px';
});

$(window).on('resize', () => {
  const results = document.getElementById('results');
  results.style.height = '0px';
  const footer = document.getElementsByTagName('footer')[0];
  const resultsHeight = window.innerHeight - document.body.clientHeight - footer.clientHeight - 10;
  results.style.height = resultsHeight + 'px';
  document.getElementById('songs').style.height = document.getElementById('search-bar').clientHeight + resultsHeight + 'px';
});

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
  const request = makeRequest('/api/urlsongs?query=' + encodeURIComponent(query));
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
  const request = makeRequest('/api/scsongs?query=' + encodeURIComponent(query));
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
  const request = makeRequest('/api/ytsongs?query=' + encodeURIComponent(query));
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
  for (let i = 0; i < songs.length; i++) {
    const divSong = document.createElement('div');
    divSong.classList = ['song row'];

    const divSelImg = document.createElement('div');
    divSelImg.classList = ['col-lg-4 div-sel-img'];
    const select = document.createElement('input');
    select.type = 'checkbox';
    select.classList = ['checkbox search-check'];
    select.dataset.index = i;
    select.dataset.url = songs[i].url;
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
    p.innerHTML = songs[i].title + '<br />Length: ' + songs[i].length + '<br />Channel: ' + songs[i].channel;
    p.classList = ['song-info-p'];
    divP.appendChild(p);

    const divButton = document.createElement('div');
    divButton.classList = ['col-lg-2 song-info-button'];
    const button = document.createElement('button');
    button.textContent = 'Add';
    button.classList = ['btn btn-danger'];
    button.onclick = addSingle;
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
 * @param {String} uri Endpoint to make the request to
 * @return {Object} XMLHttpRequest
 */
function makeRequest(uri) {
  const url = 'http://localhost:5000' + uri;
  const request = new XMLHttpRequest();
  request.open('POST', url, true);
  return request;
}

/**
 * Checks all the checkboxes if the Select all checkbox is selected
 * @param {Object} e Information about the event fired by the input field
 */
function selectAll(e) {
  const checked = e.target.checked;
  const arr = document.getElementsByClassName('search-check');
  for (let i = 0; i < arr.length; i++) arr[i].checked = checked;
}

/**
 * Adds all the selected to the playlist
 */
function addSelected() {
  console.log('adding all');
  const checks = document.getElementsByClassName('search-check');
  for (let i = 0; i < checks.length; i++) {
    if (checks[i].checked) {
      console.log(checks[i]);
    }
  }
}

/**
 * Adds a single song to the playlist
 * @param {Object} e Information about the event fired by the button
 */
function addSingle(e) {
  document.getElementById('empty').classList.add('d-none');
  document.getElementById('select-songs').classList.remove('d-none');
  console.log('adding single');
  e.target.classList = ['btn btn-success'];
  e.target.disabled = true;
  const song = document.querySelector('.search-check[data-index="' + e.target.dataset.index + '"]');
  console.log(song.dataset);

  const divSong = document.createElement('div');
  divSong.id = 'song-' + document.getElementsByClassName('delete-check').length;
  divSong.classList = ['song row'];

  const divSelImg = document.createElement('div');
  divSelImg.classList = ['col-lg-4 div-sel-img'];
  const select = document.createElement('input');
  select.type = 'checkbox';
  select.classList = ['checkbox delete-check'];
  select.dataset.index = document.getElementsByClassName('delete-check').length;
  select.dataset.url = song.dataset.url;
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
  p.innerHTML = song.dataset.title + '<br />Length: ' + song.dataset.length + '<br />Channel: ' + song.dataset.channel;
  p.classList = ['song-info-p'];
  divP.appendChild(p);

  const divButton = document.createElement('div');
  divButton.classList = ['col-lg-2 song-info-button'];
  const button = document.createElement('button');
  button.textContent = 'Delete';
  button.classList = ['btn btn-danger'];
  button.onclick = deleteSingle;
  button.dataset.index = document.getElementsByClassName('delete-check').length;
  divButton.appendChild(button);

  divSong.appendChild(divSelImg);
  divSong.appendChild(divP);
  divSong.appendChild(divButton);

  songs.appendChild(divSong);
}

/**
 * Deletes a single song to the playlist
 * @param {Object} e Information about the event fired by the button
 */
function deleteSingle(e) {
  console.log('deleteSingle');
  console.log(e);
  const song = document.getElementById('song-' + e.target.dataset.index);
  const title = song.children[0].children[0].dataset.title;
  console.log('orig title: ' + title);
  song.parentNode.removeChild(song);
  const results = document.getElementById('results').children;
  for (let i = 0; i < results.length; i++) {
    // console.log(results[i].children[0].children[0].dataset.title);
    if (results[i].children[0].children[0].dataset.title === title) {
      results[i].children[2].children[0].classList = 'btn btn-danger';
      results[i].children[2].children[0].disabled = false;
    }
  }
  if (document.getElementById('songs').children.length === 1) {
    document.getElementById('select-songs').classList.add('d-none');
    document.getElementById('empty').classList.remove('d-none');
  }
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
