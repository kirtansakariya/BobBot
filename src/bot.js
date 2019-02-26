const Discord = require('discord.js');
const auth = require('../auth.json');
const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
const fs = require('fs');
const DJ = require('./DJ');
const Soundcloud = require('./Soundcloud');
const Youtube = require('./Youtube');
const https = require('https');
const http = require('http');
const moment = require('moment');
const djs = [];
let dispatcher = null;
let counter = 0;
let currCounter = 0;
let current = null;
let searches = {};

bot.login(auth.token);

bot.on('ready', function(evt) {
  bot.user.setActivity(';commands').then(presence => {
    console.log('setting activity');
  }).catch(console.error);
  console.log("BobBot is ready");
});

bot.on('message', message => {
  console.log(message.content + " message: " + message + " member: " + message.member + " type: " + typeof(message));
  if(searches[message.member.displayName] !== undefined) {
    var selection = Number.parseInt(message.content);
    if(isNaN(selection) || selection < 1 || selection > 5) {
      message.channel.send("Invalid selection");
    } else {
      var song = searches[message.member.displayName][selection - 1];
      console.log(song);
      var dj = getDJ(message.member);
      if(song.type === 'yt') {
        dj.songs.push(new Youtube.Youtube('https://www.youtube.com/watch?v=' + song.id, song.title, song.id, song.duration, message.member.id, message.member.displayName));
      } else {
        console.log("add sc song");
        song.pid = message.member.id;
        song.player = message.member.displayName;
        dj.songs.push(song);
      }
      var queue = getQueue();
      var i = 0;
      while(i < queue.length) {
        if(queue[i].title === song.title) {
          break;
        }
        i++;
      }
      message.channel.send('Added **' + song.title + '** at position **' + (i + 1) + '**');
    }
    searches[message.member.displayName] = undefined;
  } else if (message.content.substring(0, 1) == ';') {
    var args = message.content.substring(1).split(' ');
    var cmd = args[0];
    args = args.splice(1);
    switch(cmd) {
      case 'ping':
        play(message);
        break;
      case 'play':
        if(args[0] === undefined) {
          message.channel.send("Please specify a url");
        } else {
          addSongs(message.member, args[0], function(msg) {
            message.channel.send(msg);
          });
        }
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
        console.log("final");
        console.log(queue);
        if(queue.length === 0) {
          message.channel.send("The queue is currently empty");
        } else if(page === undefined) {
          var mes = parseQueue(queue, 0, queue.length);
          message.channel.send(mes);
        } else if (page > 0 && ((page - 1) * 10) < queue.length) {
          console.log(page);
          var mes = parseQueue(queue, ((page - 1) * 10), queue.length);
          console.log(typeof(mes));
          console.log(mes);
          message.channel.send(mes);
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
      case 'curr':
      case 'c':
        if(current == null) {
          message.channel.send("No songs playing currently");
        } else {
          console.log(current);
          message.channel.send('`' + current.title + '` [' + current.length + '] req by ' + current.player);
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
      case 'queuePlayer':
      case 'queueplayer':
      case 'queuePl':
      case 'queuepl':
      case 'qPlayer':
      case 'qplayer':
      case 'qPl':
      case 'qpl':
      case 'qP':
      case 'qp':
        console.log(djs);
        console.log(args);
        if(args.length === 0) {
          message.channel.send("Please provide a non-empty player name");
          break;
        }
        var djName = args.join(' ');
        var dj = null;
        var msg = '';
        for(var i = 0; i < djs.length; i++) {
          if(djs[i].user === djName) {
            dj = djs[i];
            break;
          }
        }
        if(dj !== null) {
          msg = parseQueue(dj.songs, 0, dj.songs.length);
          message.channel.send(msg);
          break;
        }
        var page = Number.parseInt(args[args.length - 1]);
        if(!isNaN(page)) {
          djName = args.slice(0, -1).join(' ');
          for(var i = 0; i < djs.length; i++) {
            if(djs[i].user === djName) {
              dj = djs[i];
              break;
            }
          }
          if(dj === null) {
            message.channel.send("Invalid player name");
          } else if(page <= 0 || ((page - 1) * 10) > dj.songs.length) {
            msg = "Invalid page number, displaying first page instead\n";
            msg += parseQueue(dj.songs, 0, dj.songs.length);
            message.channel.send(msg);
          } else {
            msg = parseQueue(dj.songs, (page - 1) * 10, dj.songs.length);
            message.channel.send(msg);
          }
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
      case 'soundcloud':
      case 'sc':
        if(args.length === 0) {
          message.channel.send("Need to provide search query");
        } else {
          var str = args.join(" ");
          scSearch(str, message.member.displayName, function() {
            console.log(searches[message.member.displayName]);
            var send = '**Enter a number from 1-5 to select a song**\n';
            for(var i = 0; i < searches[message.member.displayName].length; i++) {
              var info = searches[message.member.displayName][i];
              send += (i + 1) + '. **' + info.title + '** - ' + info.length + '\n';
            }
            send += "**Songs fetched from Soundcloud**";
            message.channel.send(send);
          });
          console.log(str);
        }
        break;
      case 'remove':
      case 'rm':
        if(args.length == 0) {
          message.channel.send("Please provide the queue number(s) of the song(s) to remove");
        } else {
          var page = 0;
          var queue = getQueue();
          var removed = removeElements(args, queue);
          cleanUp(removed);
          var remMes = '';
          for(var i = 0; i < removed.length; i++) {
            remMes += removed[i][2] + '. ' + removed[i][1] + '\n';
          }
          for(var i = 0; i < djs.length; i++) {
            if(djs[i].songs.length === 0) {
              djs.splice(i, 1);
              i--;
            }
          }
          message.channel.send('Removed the following songs:\n' + remMes);
        }
        break;
      case 'removeplayer':
      case 'removePlayer':
      case 'removepl':
      case 'removePl':
      case 'rmplayer':
      case 'remPlayer':
      case 'rmpl':
      case 'rmPl':
        console.log(args);
        if(args.length === 0) {
          message.channel.send("Please provide the player's name");
        } else {
          var name = args[0];
          for(var i = 0; i < djs.length; i++) {
            console.log(djs[i].user);
            console.log((djs[i].user === name));
            console.log("name: " + name);
            if(djs[i].user === name) {
              djs.splice(i, 1);
              message.channel.send('Removing all songs that were added by ' + name);
            }
          }
        }
        break;
      case 'tiny':
        message.channel.send("Dong?");
        break;
      case 'youtube':
      case 'yt':
        if(args.length == 0) {
          message.channel.send("Need to provide search query");
        } else {
         var str = args.join(" ");
         ytSearch(str, message.member.displayName, function() {
           //console.log(searches);
           var send = '**Enter a number from 1-5 to select a song**\n';
           for(var i = 0; i < searches[message.member.displayName].length; i++) {
             console.log(searches[message.member.displayName][i]);
             var info = searches[message.member.displayName][i];
             send += (i + 1) + '. **' + info.title + '** - ' + info.duration + '\n';
           }
           send += '**Songs fetched from YouTube**'
           message.channel.send(send);
         });
        }
        break;
      case 'commands':
        //var mes = 'Play song: `;play <url>`\nStart player: `;start`\nSkip song: `;skip`\nQueue: `;queue` or `;q`\nCurrent song: `;current` or `;curr`\nPause player: `;pause`\nResume player: `;resume` or `;re` or `;r`\n' +
        //          'Fun commands: `;tiny`';
        var play = 'Play song: `;play <url>`';
        var start = 'Start player: `;start`';
        var leave = 'Leave player: `;leave`';
        var queue = 'Queue: `;queue` or `;queue <page number>`';
        var clean = 'Clean queue: `;clean`';
        var skip = 'Skip current song: `;skip`';
        var current = 'Current song: `;current`';
        var pause = 'Pause player: `;pause`';
        var qpl = 'Specific player\'s queue: `;queuePlayer`';
        var resume = 'Resume player: `;resume`';
        var shuffle = 'Shuffle your songs: `;shuffle`';
        var sc = 'Search soundcloud: `;soundcloud <query>`';
        var remove = 'Remove song: `;remove <place in queue>`';
        var rmpl = 'Remove player\'s queue: `;removePlayer <player name>`';
        var tiny = 'Tiny: `;tiny`';
        var yt = 'Search youtube: `;youtube <query>`';
        var mes = play + '\n' + start + '\n' + leave + '\n' + queue + '\n' + clean + '\n' + skip + '\n' + current + '\n' + pause + '\n' + qpl + '\n' + resume + '\n' + shuffle
                   + '\n' + sc + '\n' + remove + '\n' + rmpl + '\n' + tiny + '\n' + yt;
        message.channel.send(mes);
        break;
    }
  }
});

// Add songs to the appropriate DJ
function addSongs(member, url, callback) {
  dj = getDJ(member);
  /*if(dj === null) {
    dj = new DJ.DJ(member);
    djs.push(dj);
    counter++;
  }*/
  console.log(dj);
  dj.addSong(url, function(msg) {
    console.log("done");
    callback(msg);
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
  current = null;
  console.log(message);
  console.log(message.member.voice.channel);
  if(message.member.voice.channel == null) {
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
  message.member.voice.channel.join().then(connection => {
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
  if(current != null) {
    ret.push(current);
  }
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

function parsePlayerQueue(q, p) {
  var message = '';
  for(var i = p * 10; i < q.length; i++) {
    if(current !== null && q[i].title === current.title) {
      message += (i + 1) + '. :play_pause: `' + q[i].title + '` [' + q[i].length + '] req by ' + q[i].player + '\n';
      continue;
    }
    message += (i + 1) + '. `' + q[i].title + '` [' + q[i].length + '] req by ' + q[i].player + '\n';
  }
  message += 'Page: ' + (p + 1) + ' Total number of songs: ' + q.length;
  return message;
}

function parseQueue(q, p, l) {
  var message = '';
  console.log("parse");
  console.log(q);
  for(var i = 0; i < 10 && (p + i) < q.length; i++) {
    if(p == 0 && i == 0 && current !== null) {
      message += (p + i + 1) + '. :play_pause: `' + q[i].title + '` [' + q[i].length + '] req by ' + q[i].player + '\n';
      continue;
    }
    message += (p + i + 1) + '. `' + q[p + i].title + '` [' + q[p + i].length + '] req by ' + q[p + i].player + '\n';
  }
  message += 'Page: ' + ((p / 10) + 1) + ' Total number of songs: ' + l;
  console.log(message);
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

function ytSearch(str, name, callback) {
  console.log("query: " + str);
  https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + str + '&type=video&key=' + auth.youtubeApi, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      var parsed = JSON.parse(data);
      console.log(parsed);
      searches[name] = [];
      for(var i = 0; i < parsed.items.length; i++) {
        searches[name][i] = {};
        searches[name][i].title = parsed.items[i].snippet.title;
        searches[name][i].id = parsed.items[i].id.videoId;
        searches[name][i].type = 'yt';
      }
      parseVideos(parsed.items, name, callback);
    });
  });
}

function parseVideos(videos, name, callback) {
  https.get('https://content.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + videos[0].id.videoId + '&key=' + auth.youtubeApi, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      var parsed = JSON.parse(data);
      console.log("len: " + videos.length + " index: " + (((videos.length - 1) % 5) * -1));
      searches[name][((videos.length - 1) % 5)].info = parsed;
      var mom = moment.duration(parsed.items[0].contentDetails.duration);
      var seconds = mom.asSeconds() % 60;
      var minutes = Math.floor(mom.asSeconds() / 60);
      searches[name][((videos.length - 1) % 5)].duration = minutes + ':' + ((seconds < 10) ? ('0' + seconds) : seconds);
      videos.shift();
      if(videos.length === 0) {
        callback();
      } else {
        parseVideos(videos, name, callback);
      }
    });
  });
}

function scSearch(str, name, callback) {
  http.get('http://api.soundcloud.com/tracks?q=' + str + '&client_id=' + auth.scid, function(resp) {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      searches[name] = [];
      var parsed = JSON.parse(data);
      console.log(parsed);
      console.log(parsed.length);
      parsed = parsed.slice(0, 5);
      for(var i = 0; i < parsed.length; i++) {
        var duration = parsed[i].duration;
        minutes = Math.floor(duration / 60000);
        seconds = ((duration % 60000) / 1000).toFixed(0);
        searches[name][i] = new Soundcloud.Soundcloud(parsed[i].permalink_url, parsed[i].stream_url + "?client_id=" + auth.scid, parsed[i].title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
      }
      callback();
    });
  });
}

