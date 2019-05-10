const bot = require('./discord/bot');
const web = require('./frontend/js/web');
const port = process.env.PORT || 5000;

// Activate bot
bot.bot.login(((process.env.TOKEN !== undefined) ? process.env.TOKEN : require('../auth.json').token));

// Activate frontend
web.app.listen(port, () => console.log(`Example app listening on port ${port}!`));
