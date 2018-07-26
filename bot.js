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
const djs = [];
let dispatcher = null;
let counter = 0;
let currCounter = 0;
let conn = null;

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
        break;
      case 'play':
        addSongs(message.member, args[0]);
        break;
      case 'start':
        if(dispatcher == null) nextSong(message.member);
        break;
      case 'leave':
        //console.log(bot);
        bot.leaveVoiceChannel(message.member.voiceState.channelID);
        break;
      case 'q' || 'queue':
        printQueue(message.member);
        //console.log(djs);
        break;
      case 'skip':
        nextSong(message.member);
        break;
    }
  }
});

// Add songs to the appropriate DJ
function addSongs(member, url) {
  dj = getDJ(member);
  dj.addSong(url, function() {
    console.log("done");
    /*if (dispatcher == null) {
      nextSong(member);
    }*/
  });
}

// Gets the DJ
function getDJ(member) {
  var dj = 0;
  while(dj < djs.length) {
    if(djs[dj].user == member) {
      console.log("returning dj: " + djs[dj].user);
      return djs[dj];
    }
  }
  dj = new DJ.DJ(member);
  djs.push(dj);
  counter++;
  return dj;
}

function nextSong(mem) {
  console.log(mem.voiceChannel);
//  return;
  if(mem.voiceChannel == null) {
    console.log("please join a voice channel");
    return;
  }
  var temp = djs.shift();
  if(temp == null) {
    console.log("no more djs");
    return;
  }
  var song = temp.getSong();
  if(song == null) {
    nextSong(mem);
    return;
  }
  if(temp.songs.length != 0) {
    console.log(temp.songs.length + " more songs");
    djs.push(temp);
  }
  console.log("in mem.voiceChannel");
  mem.voiceChannel.join().then(connection => {
    console.log("using connection and logging song");
    console.log(song);
    console.log("post song log");
    var s = song.getStream();
    console.log("logging stream");
    console.log(s);
    console.log("post stream log");
    dispatcher = connection.play(song.getStream());
    dispatcher.on('end', nextSong());
    dispatcher.on('error', nextSong());
  }).catch(console.log);
}

/*function nextSong() {
  console.log("dummy function");
}*/

/*function nextSong(mem) {
  var temp = djs.shift();
  var stream = temp.getStream();
  djs.push(temp);
  console.log(stream);
  console.log(mem);
  if(mem.voiceChannel) {
    console.log("hi");
    mem.voiceChannel.join().then(connection => {
      conn = connection;
      console.log("hello");
      dispatcher = connection.play(stream);
      dispatcher.on('end', nextSong());
      dispatcher.on('error', nextSong());
      console.log("using connection");
      return;
    }).catch(console.log);
    console.log(conn);
    if(conn != null) {
      console.log("using conn");
      dispatcher = conn.play(stream);
    }
  }
}*/

function printQueue(mem) {
  //var temp = JSON.parse(JSON.stringify(djs));
  const temp = Object.assign(djs);
  console.log(temp);
  //console.log(djs);
  var num = 0;
  var td = null;
  var ts = null;
  while(num < 100) {
    td = temp.shift();
    ts = td.getSong();
    console.log(ts.getTitle());
    temp.push(td);
    num++;
  }
  console.log(djs);
}

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

/*function play(message) {
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
}*/
