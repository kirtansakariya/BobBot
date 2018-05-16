const Discord = require('discord.js');
const auth = require('./auth.json');
const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});
bot.on('ready', function(evt) {
  console.log("BobBot is ready");
});
bot.on('message', message => {
//  console.log(message);
//  console.log(message.guild);
  console.log(message.content);
  if (message.content.substring(0, 1) == ';') {
    var args = message.content.substring(1).split(' ');
    var cmd = args[0];
    args = args.splice(1);
    switch(cmd) {
      case 'ping':
        console.log(bot.voiceConnections[0] + "\n\n\n\n\n\n\n" + bot.voiceConnections[1]);
        console.log(message.channel.connection);
        message.channel.send('pong');
        message.member.voiceChannel.join()
          .then(connection => {
            message.reply("hello");
            console.log("catching");
          })
          .catch(console.log);
      break;
    }
  }
});

bot.login(auth.token);
