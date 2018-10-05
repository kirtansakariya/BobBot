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
let current = null;

bot.login(auth.token);

bot.on('ready', function(evt) {
  bot.user.setActivity(';commands').then(presence => {
    console.log('setting activity');
  }).catch(console.error);
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
        if(dispatcher == null) nextSong(message);
        break;
      case 'leave':
        bot.leaveVoiceChannel(message.member.voiceState.channelID);
        break;
      case 'queue':
      case 'q':
        var page = args.shift();
        var queue = getQueue();
        console.log(page);
        if(queue.length == 0) {
          message.channel.send("The queue is currently empty");
        } else if(page == null) {
          printQueue(0, queue, function(q) {
            console.log("should print now");
            var mes = parseQueue(q, 0, queue.length);
            message.channel.send(mes);
          });
        } else if (page > 0 && ((page - 1) * 10) < queue.length) {
          console.log(page);
          printQueue(page - 1, queue, function(q) {
            console.log("should print now");
            var mes = parseQueue(q, ((page - 1) * 10), queue.length);
            message.channel.send(mes);
          });
        } else {
          message.channel.send("Please enter a valid page number");
        }
        break;
      case 'clean':
        clean(function() {
          console.log("done cleaning, updating now");
          console.log(djs[0].songs);
        });
        break;
      case 'skip':
        nextSong(message);
        break;
      case 'current':
        if(current == null) {
          message.channel.send("No songs playing currently");
        } else {
          message.channel.send('`' + current.title + '` [' + current.length + '] req by ' + current.user);
        }
        break;
      case 'pause':
      case 'p':
        if(dispatcher == null) {
          message.channel.send("No songs playing currently");
        } else {
          dispatcher.pause();
        }
        break;
      case 'resume':
      case 're':
      case 'r':
        if(dispatcher == null) {
          message.channel.send("No songs playing currently");
        } else {
          dispatcher.resume();
        }
        break;
      case 'shuffle':
        var boo = shuffle(message);
        if(boo) {
          message.channel.send(message.member.displayName + '\'s songs have been shuffled');
        } else {
          message.channel.send(message.member.displayName + ' has no songs in the queue to shuffle');
        }
        break;
      case 'remove':
      case 'rm':
        if(args.length == 0) {
          message.channel.send("Please provide the queue number(s) of the song(s) to remove");
        } else {
          var queue = getQueue();
          var removed = removeElements(args, queue);
          cleanUp(removed);
          var remMes = '';
          for(var i = 0; i < removed.length; i++) {
            remMes += removed[i][2] + '. ' + removed[i][1] + '\n';
          }
          message.channel.send('Removed the following songs:\n' + remMes);
        }
        break;
      case 'tiny':
        message.channel.send("Dong?");
        break;
      case 'commands':
        var mes = 'Play song: `;play <url>`\nStart player: `;start`\nSkip song: `;skip`\nQueue: `;queue` or `;q`\nCurrent song: `;current` or `;curr`\nPause player: `;pause`\nResume player: `;resume` or `;re` or `;r`\n' +
                  'Fun commands: `;tiny`';
        message.channel.send(mes);
        break;
    }
  }
});

// Add songs to the appropriate DJ
function addSongs(member, url) {
  dj = getDJ(member);
  console.log(dj);
  dj.addSong(url, function() {
    console.log("done");
  });
}

// Gets the DJ
function getDJ(member) {
  var dj = 0;
  console.log("hello in dj " + member);
  while(dj < djs.length) {
    if(djs[dj].id == member) {
      console.log("returning dj: " + djs[dj].user);
      return djs[dj];
    }
    dj++;
  }
  dj = new DJ.DJ(member);
  djs.push(dj);
  console.log("djs:\n" + djs);
  counter++;
  return dj;
}

function nextSong(message) {
  //console.log(mes);
  if(message.member.voiceChannel == null) {
    console.log("please join a voice channel");
    return;
  }
  var temp = djs.shift();
  if(temp == null) {
    console.log("no more djs");
    return;
  }
  var song = temp.getSong();
  console.log(song);
  if(song == null) {
    nextSong(message);
    return;
  }
  if(temp.songs.length != 0) {
    console.log(temp.songs.length + " more songs");
    djs.push(temp);
  }
  console.log("in mem.voiceChannel");
  message.member.voiceChannel.join().then(connection => {
    console.log("using connection and logging song");
    console.log(song);
    console.log("post song log");
    var s = song.getStream();
    console.log("logging stream");
    console.log(s);
    console.log("post stream log");
    current = song;
    dispatcher = connection.play(song.getStream());
    dispatcher.on('end', () => nextSong(message));
    dispatcher.on('error', () => nextSong(message));
    connection.on('error', () => {
      message.channel.send('Problem with song: ' + current.title + ' url: ' + current.url);
      nextSong(mem);
    });
  }).catch(console.log);
}

function nextSongEnd(a, b) {
  console.log("end song");
  console.log(a);
  console.log(b);
  console.log(conn);
}

function getQueue() {
  var temp = JSON.parse(JSON.stringify(djs));
  var ret = [];
  var dj;
  var song;
  ret.push(current);
  console.log("temp original");
  while(temp.length > 0) {
    var dj = temp.shift();
    var song = dj.songs.shift();
    if(song == null) continue;
    ret.push(song);
    temp.push(dj);
  }
  console.log(ret);
  return ret;
}

function printQueue(page, queue, callback) {
  var i = page * 10;
  var count = 0;
  var ret = [];
  console.log("QUEUE");
  console.log(queue);
  if(i >= queue.length) {
    console.log("invalid page");
    return;
  }
  for(var j = 0; j < 10 && (i + j) < queue.length; j++) {
    console.log('j: ' + j + ' i + j; ' + (i + j));
    (function(k) {
      //console.log('k: ' + k + ' j: ' + j);
      var song = queue[i + j];
      var ind = j;
      if(queue[i + j].url.includes("youtube")) {
        ytdl.getInfo(song.url, function(err, info) {
          if(info) {
            var seconds = info.length_seconds % 60;
            var minutes = Math.floor(info.length_seconds / 60);
            song.length = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
          } else {
            song.length = "N/A";
          }
          //console.log("ind: " + ind);
          ret[ind] = song;
          count++;
          //console.log("count + i: " + (count + i) + " queue.length - 1: " + (queue.length - 1));
          if(count == 10 || (count + i) == queue.length) {
            console.log("retting: " + count);
            callback(ret);
          }
        });
      } else {
        ret[ind] = song;
        count++;
        if(count == 10 || (count + i) == queue.length) {
          console.log("retting: " + count);
          callback(ret);
        }
      }
    }(i));
  }
}

function parseQueue(q, p, l) {
  var message = '';
  console.log("parse");
  console.log(q);
  for(var i = 0; i < q.length; i++) {
    if(p == 0 && i == 0) {
      message += (p + i + 1) + '. :play_pause: `' + q[i].title + '` [' + q[i].length + '] req by ' + q[i].player + '\n';
      continue;
    }
    message += (p + i + 1) + '. `' + q[i].title + '` [' + q[i].length + '] req by ' + q[i].player + '\n';
  }
  message += 'Page: ' + ((p / 10) + 1) + ' Total number of songs: ' + l;
  return message;
}

function shuffle(mes) {
  var dj = null;
  for(var i = 0; i < djs.length; i++) {
    if(djs[i].id == mes.member.id) {
      dj = djs[i];
    }
  }
  if(dj == null) return false;
  if(dj.songs.length == 0) return false;
  var arr = dj.songs;
  var j;
  var temp;
  for(var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  dj.songs = arr;
  return true;
}

function removeElements(nums, q) {
  var j = 0;
  var arr = [];
  for(var i = 0; i < nums.length; i++) {
    j = nums.shift();
    q[j - 1].remove = true;
    arr.push([]);
    arr[arr.length - 1].push(q[j - 1].pid);
    arr[arr.length - 1].push(q[j - 1].title);
    arr[arr.length - 1].push(i + 1);
  }
  return arr;
}

function cleanUp(arr) {
  var dj = null;
  console.log('cleaning up');
  for(var i = 0; i < arr.length; i++) {
    for(var j = 0; j < djs.length; j++) {
      if(djs[j].id == arr[i][0]) {
        dj = djs[j];
      }
    }
    for(var k = 0; k < dj.songs.length; k++) {
      if(dj.songs[k].title == arr[i][1]) {
        console.log('should remove ' + dj.songs[k].title);
        dj.songs.splice(k, 1);
      }
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
