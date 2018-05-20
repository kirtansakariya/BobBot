const Discord = require('discord.js');
const auth = require('./auth.json');
const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

bot.login(auth.token);

bot.on('ready', function(evt) {
  console.log("BobBot is ready");
});

bot.on('message', message => {
  console.log(message.content);
  if (message.content.substring(0, 1) == ';') {
    var args = message.content.substring(1).split(' ');
    var cmd = args[0];
    args = args.splice(1);
    switch(cmd) {
      case 'ping':
        play(message);
    }
  }
});

function play(message) {
  var so = new Song('A', 'bob');
  var so2 = new Song('B', 'bob2');
  so.hello();
  so.getUrl();
  so2.getUrl();
  console.log("hi");
  console.log(bot.voiceConnections[0] + "\n\n\n\n\n\n\n" + bot.voiceConnections[1]);
//  console.log(bot.voiceConnections);
  console.log(message.channel.connection);
  message.channel.send('pong');
  if(message.member.voiceChannel) {
    message.member.voiceChannel.join()
    .then(connection => {
      message.reply("hello");
      console.log("catching");
    })
    .catch(console.log);
  } else {
    message.channel.send('You must be in a voice chat to join');
  }
}

/*
-------------
Song class
-------------
*/
function Song(url, user) {
  this.url = url;
  this.user = user;
}
Song.prototype.hello = function() {
  console.log("Song Hello");
}
Song.prototype.getUrl = function() {
  console.log(this.url);
  return this.url;
}
