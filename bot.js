const Discord = require('discord.js');
const auth = require('./auth.json');
const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
const fs = require('fs');
const DJ = require('./DJ');
const Song = require('./Song');
const Soundcloud = require('./Soundcloud');
const Youtube = require('./Youtube');
var players = [];

bot.login(auth.token);

bot.on('ready', function(evt) {
  console.log("BobBot is ready");
});

bot.on('message', message => {
  console.log(message.content + " message: " + message + " member: " + message.member + " type: " + typeof(message));
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

console.log(Song);
console.log(Soundcloud);
console.log(Youtube);
console.log(Song.Song);
//var so = Song.init('A', 'bob1');
var so = new Song.Song('A', 'bob1');
//console.log(Song.Song());
var so2 = new Song.Song('B', 'bob2');
//var so2 = Song.init('B', 'bob2');
console.log(so);
console.log(so.url);
console.log(so2);
console.log("afdasdf " + so.getUrl());
//console.log(so2);
console.log(so2.getUrl());

function play(message) {
  var so = Song.init('A', 'bob1');
  var so2 = Song.init('B', 'bob2');
  console.log(so);
  so.hello();
  so.getUrl();
  so.getUser();
  console.log("testing: " + so.url + " message.member: " + message.member + " message: " + message + " dream: " + message.author.username);
  if(message === "bobby1298") console.log("yayyyyyy");
  so2.getUrl();
  so2.getUser();
  console.log("hi");
  console.log(bot.voiceConnections[0] + "\n\n\n\n\n\n\n" + bot.voiceConnections[1]);
//  console.log(bot.voiceConnections);
  console.log(message.channel.connection);
  message.channel.send('pong');
  if(message.member.voiceChannel) {
    message.member.voiceChannel.join()
      .then(connection => {
        const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', { filter : 'audioonly' })
        const dispatcher = connection.play(stream);
        // const dispatcher = connection.playFile('/Users/kirtan/Desktop/BobBot/SampleAudio_0.7mb.mp3');
        console.log(dispatcher);
        //dispatcher.resume();
        dispatcher.on('error', console.error);
        connection.player.on('debug', console.log);
        connection.player.on('error', console.error);
        //const dispatcher = connection.playStream(ytdl('https://www.youtube.com/watch?v=_XXOSf0s2nk', { filter: 'audioonly' }, { passes: 3 }));
        //message.reply("hello");
        //console.log("catching");
      })
      .catch(console.log);
    var dj = getDJ(message.author.username);
    console.log("retunred value: " + dj.user);
  } else {
    message.channel.send('You must be in a voice chat to join');
  }
}

function getDJ(name) {
  var i = 0;
  while(i < players.length) {
    if(name === players[i].user) return players[i];
    i++;
  }
  console.log("new dj: " + name);
  var temp = new DJ(name);
  players.push(temp);
  return temp;
}

/*
-------------
Song class
-------------

function Song(url, user) {
  this.url = url;
  this.user = user;
  this.next = null;
}

Song.prototype.hello = function() {
  console.log("Song Hello");
}

Song.prototype.getUrl = function() {
  console.log(this.url);
  return this.url;
}

Song.prototype.getUser = function() {
  console.log(this.user);
  return this.user;
}*/

/*
-------------
DJ class
-------------

function DJ(user) {
  this.user = user;
  this.head = null;
  this.last = null;
}

DJ.prototype.addSong = new function(song) {
  if(this.head == null) {
    this.head = song;
    this.last = song;
    return;
  }
  this.last.next = song;
  this.last = song;
}*/
