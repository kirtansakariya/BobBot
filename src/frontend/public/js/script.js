$('#search-form').on('submit', (e) => {
  console.log('jquery');
  console.log(e);
  e.preventDefault();
});

$(document).ready(() => {
  console.log('on load');
  const results = document.getElementById('results');
  console.log(window.innerHeight);
  console.log(document.body.clientHeight);
  const footer = document.getElementsByTagName('footer')[0];
  const resultsHeight = window.innerHeight - document.body.clientHeight - footer.clientHeight - 10;
  results.style.height = resultsHeight + 'px';
});

$(window).on('resize', () => {
  console.log('resize');
  const results = document.getElementById('results');
  results.style.height = '0px';
  const footer = document.getElementsByTagName('footer')[0];
  const resultsHeight = window.innerHeight - document.body.clientHeight - footer.clientHeight - 10;
  results.style.height = resultsHeight + 'px';
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
  document.getElementById('select').classList.add('d-none');
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
    document.getElementById('select').classList.remove('d-none');
    // console.log(document.body.clientHeight);
    // const resultsHeight = window.innerHeight - document.body.clientHeight + results.style.height;
    // results.style.height = resultsHeight + 'px';
    console.log(resultsHeight);
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
  document.getElementById('select').classList.add('d-none');
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
    document.getElementById('select').classList.add('d-none');
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
  document.getElementById('select').classList.add('d-none');
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
    document.getElementById('select').classList.add('d-none');
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
  for (let i = 0; i < songs.length; i++) {
    const divSong = document.createElement('div');
    divSong.classList = ['song row'];

    const divSelImg = document.createElement('div');
    divSelImg.classList = ['col-lg-4 div-sel-img'];
    const select = document.createElement('input');
    select.type = 'checkbox';
    select.classList = ['checkbox'];
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

// function sleep(milliseconds) {
//   var start = new Date().getTime();
//   for (var i = 0; i < 1e7; i++) {
//     if ((new Date().getTime() - start) > milliseconds){
//       break;
//     }
//   }
// }

console.log('loaded in script.js');
