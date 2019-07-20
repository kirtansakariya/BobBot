$('#search-form').on('submit', (e) => {
  console.log('jquery');
  console.log(e);
  e.preventDefault();
});

/**
 * Handles the search according to the dropdown value selected
 * @param {Object} e Information about the event fired by the input field
 */
function search(e) {
  if (e.keyCode === 13) {
    // document.getElementById('results').innerHTML = '<div class="text-center">Loading...</div>';
    document.getElementById('loading').classList.remove('d-none');
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
  const request = makeRequest('/api/urlsongs?query=' + encodeURIComponent(query));
  request.send();
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    const songs = JSON.parse(data.songs);
    document.getElementById('loading').classList.add('d-none');
    if (songs.length === 0) {
      // document.getElementById('results').textContent = 'Invalid URL';
      document.getElementById('invalid').classList.remove('d-none');
      return;
    }
    const results = document.getElementById('results');
    // console.log(document.body.clientHeight);
    // console.log('window: ' + window.innerHeight);
    document.getElementById('select').classList.remove('d-none');
    // console.log(document.body.clientHeight);
    const resultsHeight = window.innerHeight - document.body.clientHeight + results.style.height;
    results.style.height = resultsHeight + 'px';
    console.log(resultsHeight);
    console.log(songs);
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
      divSelImg.appendChild(select);
      divSelImg.appendChild(img);

      const divP = document.createElement('div');
      divP.classList = ['col-lg-8 song-info-div'];
      const p = document.createElement('p');
      p.innerHTML = songs[i].title + '<br />Length: ' + songs[i].length + '<br />Channel: ' + songs[i].channel;
      p.classList = ['song-info-p'];
      divP.appendChild(p);

      divSong.appendChild(divSelImg);
      divSong.appendChild(divP);

      results.appendChild(divSong);
    }
  };
  request.onerror = () => {
    console.log(request.error);
  };
}

/**
 * Searches for SoundCloud songs based off the query
 * @param {String} query Query for the song
 */
function sc(query) {
  // console.log('sc query: ' + query);
  document.getElementById('select').classList.remove('d-none');
  const request = makeRequest('/api/scsongs?query=' + query);
  request.send();
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    const songs = JSON.parse(data.songs);
    document.getElementById('loading').classList.add('d-none');
    if (songs.length === 0) {
      document.getElementById('invalid').classList.remove('d-none');
      return;
    }
    // const results = document.getElementById('results');
    const results = document.getElementById('results');
    document.getElementById('select').classList.add('d-none');
  };
}

/**
 * Makes a XMLHttpRequest before sending it
 * @param {String} uri Endpoint to make the request to
 * @return {Object} XMLHttpRequest
 */
function makeRequest(uri) {
  const url = 'https://the-bobbot.herokuapp.com' + uri;
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

window.onload = function() {
  console.log(document.body.clientHeight);
  console.log(window.innerHeight);
};
