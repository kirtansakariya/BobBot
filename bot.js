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
        var page = args.shift();
        var queue = getQueue();
        var data = [];
        console.log(page);
        if(page == null) {
          printQueue(0, queue, function(q) {
            console.log("should print now");
          });
        } else {
          console.log(page);
          printQueue(page - 1, queue, data, function(q) {
            console.log("should print now");
          });
        }
        break;
      case 'clean':
        clean(function() {
          console.log("done cleaning, updating now");
          console.log(djs[0].songs);
        });
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

/*function clean(callback) {
  var temp = [];
  var dj = djs[0];
  var length = dj.songs.length;
  var count = 0;
  var k = 0;
  for(var i = 0; i < 100; i++) {
    console.log("i: " + i);
    (function(j) {
      ytdl.getInfo(dj.songs[j].url, function(err, info) {
        console.log(j);
        if(info == null) {
          count++;
          return;
        }
        dj.songs[j].seconds = info.length_seconds;
        /*var valid = true;
        var stream = ytdl(dj.songs[j].url, { filter: 'audioonly' }).on('error', (err) => { console.log(err); valid = false; });
        if(valid) {
          dj.songs[j].stream = stream;
        }
        count++;
        if(count > 100 - 1) {
          //dj.songs = temp;
          //console.log(dj);
          callback();
        }
      });
    }(i));
  }
}*/

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

function getQueue() {
  //var temp = deepCopy(djs);
  var temp = JSON.parse(JSON.stringify(djs));
  var ret = [];
  var dj;
  var song;
  console.log("temp original");
  /*for(var i in temp) {
    console.log("hello");
    console.log(i);
    for(var j in temp[i].songs) {
      console.log(temp[i].songs[j].title);
    }
  }*/
  while(temp.length > 0) {
    var dj = temp.shift();
    var song = dj.songs.shift();
    if(song == null) continue;
    ret.push(song);
    temp.push(dj);
  }
  /*for(var i in ret) {
    console.log(ret[i].title);
  }*/
  return ret;
  temp[0].songs.shift();
  temp[0].songs.shift();
  console.log("temp after");
  console.log(temp);
}

function printQueue(page, queue, d, callback) {
  var i = page * 10;
  var count = d.length;
  console.log(queue);
  if(i >= queue.length) {
    console.log("invalid page");
    return;
  }
  var max = d.length - i;
  for(var j = 0; j < 10 && (i + j) < queue.length; j++) {
    (function(k) {
      console.log(queue[i + j].title);
      if(queue[i + j].url.includes("youtube")) {
        ytdl.getInfo(dj.songs[i + j].url, function(err, info) {
          if(info) {
            console.log(err);
            dj.songs[i + j].seconds = info.length_seconds;
          }
          d[j] = dj.songs[i + j];
          count++;
          if(count == 10 || count == max) {
            remove(i + j, queue, d, callback);
          }
        });
      } else {
        dj[j] = dj.songs[i + j];
        count++;
      }
    });
  }
}

function remove(page, queue, d, callback) {
  var count = 0;
  for(var i = 0; i < d.length; i++) {
    if(d[i].seconds == null) {
    }
  }
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
