var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});
bot.on('ready', function(evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', message => {
  console.log(message.member);
  if (message.substring(0, 1) == ';') {
    var args = message.substring(1).split(' ');
    var cmd = args[0];

    console.log(typeof(bot));
    args = args.splice(1);
    switch(cmd) {
      case 'ping':
        bot.sendMessage({
          to: channelID,
          message: 'Pong!'
        });
        console.log("user: " + typeof(user) + "\nuserID: " + typeof(userID) + "\nchannelID: " + typeof(channelID) + "\nmessage: " + typeof(message) + "\nevt: " + typeof(evt));
        console.log(message.member);
        console.log("user: " + user + "\nuserID: " + userID + "\nchannelID: " + channelID + "\nmessage: " + message + "\nevt: " + evt);
        console.log(bot.users);
      break;
    }
  }
});
