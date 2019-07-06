$('#search-form').on('submit', (e) => {
  console.log('jquery');
  console.log(e);
  e.preventDefault();
});

function search(e) {
  if (e.keyCode === 13) {
    console.log('Enter');
    console.log(e.value);
    console.log(e);
    document.getElementById('results').textContent = document.getElementById('search-form').value;
  }
}
console.log('loaded in script.js');
