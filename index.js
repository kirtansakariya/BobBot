const bot = require('./src/discord/bot').bot;
const app = require('./src/frontend/js/web').app;
const port = process.env.PORT || 5000;

bot.login(((process.env.TOKEN !== undefined) ? process.env.TOKEN : require('./auth.json').token));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
