const bot = require('./src/discord/bot').bot;
const app = require('./src/frontend/js/web').app;
// const https = require('https');
const port = process.env.PORT || 8080;

//bot.login(((process.env.TOKEN !== undefined) ? process.env.TOKEN : require('./auth.json').token));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// if (process.env.IDLE === 'FALSE') {
//   console.log('using setInterval');
//   setInterval(() => {
//     https.get('https://the-bobbot.herokuapp.com/');
//   }, 1500000);
// }
