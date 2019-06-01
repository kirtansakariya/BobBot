const Discord = require('discord.js');
const bot = new Discord.Client({
  token: ((process.env.TOKEN !== undefined) ? process.env.TOKEN : require('../../auth.json').token),
  autorun: true,
});
const DJ = require('./DJ');
const Soundcloud = require('./Soundcloud');
const Youtube = require('./Youtube');
const db = require('../database/db');
const https = require('https');
const http = require('http');
const moment = require('moment');
const decode = require('unescape');
const djs = [];
const front = {};
const removeHelp = {};
let dispatcher = null;
let current = null;
const searches = {};

// bot.login(((process.env.TOKEN !== undefined) ? process.env.TOKEN : require('../../auth.json').token));

bot.on('ready', function(evt) {
  bot.user.setActivity(';commands').then((presence) => {
    console.log('setting activity');
  }).catch(console.error);
  console.log('BobBot is ready');
});

bot.on('message', (message) => {
  console.log(message.member);
  console.log(message.content + ' message: ' + message + ' member: ' + message.member + ' type: ' + typeof(message));
  if (message.channel.type === 'dm') {
    if (message.content === 'signup') {
      db.getUserById(message.author.id, function(results) {
        if (results === null) {
          console.log('error encountered');
          message.channel.send('Apologies! Error encountered when fetching user.');
        } else if (results.rows.length === 0) {
          console.log('user does not exist');
          const auth = Math.floor(Math.random() * 899999 + 100000).toString();
          db.addUser(message.author.id, 'init', auth, message.author.username, (boo) => {
            console.log(message.author.username);
            if (boo) {
              message.channel.send('Follow these steps to signup for an account:\n' +
                                  '1. Visit https://the-bobbot.herokuapp.com/signup.\n' +
                                  '2. Enter a username.\n' +
                                  '3. Enter a password.\n' +
                                  '4. Enter your discord username.\n' +
                                  '5. Enter your discord id: ' + message.author.id + '\n' +
                                  '6. Enter the auth code: ' + auth);
            } else {
              message.channel.send('Apologies! Error encountered when attempting to create user.');
            }
          });
        } else if (results.rows[0].status === 'init') {
          console.log('in init phase');
          const auth = Math.floor(Math.random() * 899999 + 100000).toString();
          db.updateUser(null, message.author.id, 'init', auth, message.author.username, null, results.rows[0].id, (boo) => {
            if (boo) {
              message.channel.send('Follow these steps to signup for an account:\n' +
                                   '1. Visit https://the-bobbot.herokuapp.com/signup.\n' +
                                   '2. Enter a username.\n' +
                                   '3. Enter a password.\n' +
                                   '4. Enter your discord username.\n' +
                                   '5. Enter your discord id: ' + message.author.id + '\n' +
                                   '6. Enter the auth code: ' + auth);
            } else {
              message.channel.send('Apologies! Error encountered when attempting to generate new auth.');
            }
          });
        } else {
          console.log('user already exists');
          message.channel.send('You already have an account.');
        }
      });
    } else if (message.content === 'forgot') {
      db.getUserById(message.author.id, (results) => {
        if (results === null) {
          message.channel.send('Apologies! Error encountered when fetching user.');
        } else if (results.rows.length === 0) {
          message.channel.send('No account under your name, message signup to make an account.');
        } else {
          const user = results.rows[0];
          const auth = Math.floor(Math.random() * 899999 + 100000).toString();
          db.updateUser(user.username, user.discord_id, 'forgot', auth, user.discord_username, user.pass_hash, user.id, (boo) => {
            if (!boo) {
              message.channel.send('Error updating user, please try again.');
            } else {
              message.channel.send('Follow these steps to signup for an account:\n' +
                                   '1. Please visit https://the-bobbot.herokuapp.come/forgot.\n' +
                                   '2. Enter your username.\n' +
                                   '3. Enter a new password.\n' +
                                   '4. Confirm the password.\n' +
                                   '5. Enter the auth code: ' + auth);
            }
          });
        }
      });
    }
    return;
  }
  if (message.channel.name !== 'mute_this' && message.content[0] === ';') {
    message.channel.send('Please type messages for the bot in `mute_this`');
    return;
  }
  if (searches[message.member.user.id] !== undefined) {
    const selection = Number.parseInt(message.content);
    // const name = ((message.member.nickname === null) ? message.member.user.username : message.member.nickname);
    const iden = message.member.user.id;
    if (isNaN(selection) || selection < 1 || selection > 5) {
      message.channel.send('Invalid selection');
    } else {
      const song = searches[message.member.user.id][selection - 1];
      console.log(song);
      const dj = getDJ(message.member);
      if (song.type === 'yt') {
        if (front[iden] === true) {
          dj.songs.unshift(new Youtube.Youtube('https://www.youtube.com/watch?v=' + song.id, song.title, song.id, song.duration, message.member.id, message.member.displayName));
        } else {
          dj.songs.push(new Youtube.Youtube('https://www.youtube.com/watch?v=' + song.id, song.title, song.id, song.duration, message.member.id, message.member.displayName));
        }
      } else {
        console.log('add sc song');
        song.pid = message.member.id;
        song.player = message.member.displayName;
        if (front[iden] === true) {
          dj.songs.unshift(song);
        } else {
          dj.songs.push(song);
        }
      }
      const queue = getQueue();
      let i = 0;
      while (i < queue.length) {
        if (queue[i].title === song.title) {
          break;
        }
        i++;
      }
      message.channel.send(decode('Added **' + song.title + '** at position **' + (i + 1) + '**'));
    }
    searches[message.member.user.id] = undefined;
  } else if (message.content.substring(0, 1) == ';') {
    let args = message.content.substring(1).split(' ');
    const cmd = args[0];
    args = args.splice(1);
    switch (cmd) {
      case 'play':
        let start = -1;
        if (front[message.member.user.id] === true) {
          const name = message.member.displayName;
          for (let i = 0; i < djs.length; i++) {
            if (djs[i].user === name) {
              start = djs[i].songs.length;
            }
          }
        }
        if (args[0] === undefined) {
          message.channel.send('Please specify a url');
        } else {
          addSongs(message.member, args[0], function(msg, dj) {
            message.channel.send(msg);
            if (start != -1) {
              console.log('old size: ' + start);
              console.log('new size: ' + dj.songs.length);
              console.log('diff: ' + (dj.songs.length - start));
              const diff = dj.songs.splice(start);
              console.log('diff: ' + diff.length);
              console.log('songs: ' + dj.songs.length);
              dj.songs.unshift(...diff);
            }
          });
        }
        break;
      case 'start':
        if (dispatcher == null) nextSong(message);
        break;
      case 'leave':
        bot.voice.connections.get(bot.voice.connections.keys().next().value).disconnect();
        current = null;
        dispatcher = null;
        break;
      case 'queue':
      case 'q':
        const pg = args.shift();
        const q = getQueue();
        console.log(pg);
        console.log('final');
        console.log(q);
        if (q.length === 0) {
          message.channel.send('The queue is currently empty');
        } else if (pg === undefined) {
          const mes = parseQueue(q, 0, q.length);
          message.channel.send(decode(mes));
        } else if (pg > 0 && ((pg - 1) * 10) < q.length) {
          console.log(pg);
          const mes = parseQueue(q, ((pg - 1) * 10), q.length);
          console.log(typeof(mes));
          console.log(mes);
          message.channel.send(decode(mes));
        } else {
          message.channel.send('Please enter a valid page number');
        }
        break;
      case 'check':
        console.log(message.member);
        const id = message.member.user.id;
        const stat = front[id];
        if (stat === undefined || stat === false) {
          message.channel.send(name + '\'s songs will be added to the end of their queue');
        } else if (stat === true) {
          message.channel.send(name + '\'s songs will be added to the front of their queue');
        }
        break;
      case 'clean':
        clean(function() {
          console.log('done cleaning, updating now');
          console.log(djs[0].songs);
        });
        break;
      case 'skip':
        nextSong(message);
        break;
      case 'current':
      case 'curr':
      case 'c':
        if (current == null) {
          message.channel.send('No songs playing currently');
        } else {
          console.log(current);
          message.channel.send(decode('`' + current.title + '` [' + current.length + '] req by ' + current.player));
        }
        break;
      case 'front':
        const iden = message.member.user.id;
        front[iden] = !front[iden];
        // console.log('\n\n\n');
        // console.log(message.member);
        // console.log(message.member.constructor.name);
        // console.log('\n\n\n');
        message.channel.send(message.member.displayName + '\'s songs will now be added to the ' + ((front[iden]) ? 'front' : 'end') + ' of their queue');
        break;
      case 'pause':
      case 'p':
        if (dispatcher == null) {
          message.channel.send('No songs playing currently');
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
        if (args.length === 0) {
          message.channel.send('Please provide a non-empty player name');
          break;
        }
        let djName = args.join(' ');
        let dj = null;
        let msg = '';
        for (let i = 0; i < djs.length; i++) {
          if (djs[i].user === djName) {
            dj = djs[i];
            break;
          }
        }
        if (dj !== null) {
          msg = parseQueue(dj.songs, 0, dj.songs.length);
          message.channel.send(decode(msg));
          break;
        }
        const page = Number.parseInt(args[args.length - 1]);
        if (!isNaN(page)) {
          djName = args.slice(0, -1).join(' ');
          for (let i = 0; i < djs.length; i++) {
            if (djs[i].user === djName) {
              dj = djs[i];
              break;
            }
          }
          if (dj === null) {
            message.channel.send('Invalid player name');
          } else if (page <= 0 || ((page - 1) * 10) > dj.songs.length) {
            msg = 'Invalid page number, displaying first page instead\n';
            msg += parseQueue(dj.songs, 0, dj.songs.length);
            message.channel.send(decode(msg));
          } else {
            msg = parseQueue(dj.songs, (page - 1) * 10, dj.songs.length);
            message.channel.send(decode(msg));
          }
        }
        break;
      case 'resume':
      case 're':
      case 'r':
        if (dispatcher == null) {
          message.channel.send('No songs playing currently');
        } else {
          dispatcher.resume();
        }
        break;
      case 'shuffle':
        const boo = shuffle(message);
        if (boo) {
          message.channel.send(message.member.displayName + '\'s songs have been shuffled');
        } else {
          message.channel.send(message.member.displayName + ' has no songs in the queue to shuffle');
        }
        break;
      case 'soundcloud':
      case 'sc':
        if (args.length === 0) {
          message.channel.send('Need to provide search query');
        } else {
          const str = args.join(' ');
          scSearch(str, message.member.user.id, function() {
            console.log(searches[message.member.user.id]);
            let send = '**Enter a number from 1-5 to select a song**\n';
            for (let i = 0; i < searches[message.member.user.id].length; i++) {
              const info = searches[message.member.user.id][i];
              send += (i + 1) + '. **' + info.title + '** - ' + info.length + '\n';
            }
            send += '**Songs fetched from Soundcloud**';
            message.channel.send(decode(send));
          });
          console.log(str);
        }
        break;
      case 'remove':
      case 'rm':
        if (args.length == 0) {
          message.channel.send('Please provide the queue number(s) of the song(s) to remove');
        } else {
          const queue = getQueue();
          const removed = removeElements(args, queue);
          cleanUp();
          let remMes = '';
          for (let i = 0; i < removed.length; i++) {
            remMes += removed[i][2] + '. ' + removed[i][1] + '\n';
          }
          for (let i = 0; i < djs.length; i++) {
            if (djs[i].songs.length === 0) {
              djs.splice(i, 1);
              i--;
            }
          }
          message.channel.send(decode('Removed the following songs:\n' + remMes));
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
        if (args.length === 0) {
          message.channel.send('Please provide the player\'s name');
        } else {
          const name = args.join(' ');
          for (let i = 0; i < djs.length; i++) {
            console.log(djs[i].user);
            console.log((djs[i].user === name));
            console.log('name: ' + name);
            if (djs[i].user === name) {
              djs.splice(i, 1);
              message.channel.send('Removing all songs that were added by ' + name);
            }
          }
        }
        break;
      case 'tiny':
        message.channel.send('Dong?');
        break;
      case 'youtube':
      case 'yt':
        if (args.length == 0) {
          message.channel.send('Need to provide search query');
        } else {
          const str = args.join(' ');
          ytSearch(str, message.member.user.id, function() {
            let send = '**Enter a number from 1-5 to select a song**\n';
            for (let i = 0; i < searches[message.member.user.id].length; i++) {
              console.log(searches[message.member.user.id][i]);
              const info = searches[message.member.user.id][i];
              send += (i + 1) + '. **' + info.title + '** - ' + info.duration + '\n';
            }
            send += '**Songs fetched from YouTube**';
            message.channel.send(decode(send));
          });
        }
        break;
      case 'commands':
        // var mes = 'Play song: `;play <url>`\nStart player: `;start`\nSkip song: `;skip`\nQueue: `;queue` or `;q`\nCurrent song: `;current` or `;curr`\nPause player: `;pause`\nResume player: `;resume` or `;re` or `;r`\n' +
        //          'Fun commands: `;tiny`';
        const play = 'Play song: `;play <url>`';
        const st = 'Start player: `;start`';
        const leave = 'Leave player: `;leave`';
        const queue = 'Queue: `;queue` or `;queue <page number>`';
        const clean = 'Clean queue: `;clean`';
        const skip = 'Skip current song: `;skip`';
        const curr = 'Current song: `;current`';
        const pause = 'Pause player: `;pause`';
        const qpl = 'Specific player\'s queue: `;queuePlayer`';
        const resume = 'Resume player: `;resume`';
        const shuff = 'Shuffle your songs: `;shuffle`';
        const sc = 'Search soundcloud: `;soundcloud <query>`';
        const remove = 'Remove song: `;remove <place in queue>`';
        const rmpl = 'Remove player\'s queue: `;removePlayer <player name>`';
        const tiny = 'Tiny: `;tiny`';
        const yt = 'Search youtube: `;youtube <query>`';
        const mes = play + '\n' + st + '\n' + leave + '\n' + queue + '\n' + clean + '\n' + skip + '\n' + curr + '\n' + pause + '\n' + qpl + '\n' + resume + '\n' + shuff
                   + '\n' + sc + '\n' + remove + '\n' + rmpl + '\n' + tiny + '\n' + yt;
        message.channel.send(mes);
        break;
    }
  }
});

/**
 * Add songs to the appropriate DJ.
 * @param {Object} member Requestor from Discord
 * @param {String} url Url to fetch the songs from
 * @param {Object} callback Callback to leave the function
 */
function addSongs(member, url, callback) {
  dj = getDJ(member);
  /* if(dj === null) {
    dj = new DJ.DJ(member);
    djs.push(dj);
    counter++;
  }*/
  console.log(dj);
  dj.addSong(url, function(msg) {
    console.log('done');
    callback(msg, dj);
  });
}

/**
 * Gets the DJ.
 * @param {Object} member Requestor from Discord
 * @return {Object} Dj that was either created or found in current list
 */
function getDJ(member) {
  let dj = 0;
  console.log('hello in dj ' + member);
  while (dj < djs.length) {
    if (djs[dj].id == member) {
      console.log('returning dj: ' + djs[dj].user);
      return djs[dj];
    }
    dj++;
  }
  dj = new DJ.DJ(member);
  djs.push(dj);
  console.log('djs:\n' + djs);
  return dj;
}

/**
 * Plays the next song.
 * @param {Object} message Information about request from Discord
 */
function nextSong(message) {
  current = null;
  console.log(message);
  console.log(message.member.voice.channel);
  if (message.member.voice.channel == null) {
    console.log('please join a voice channel');
    return;
  }
  const temp = djs.shift();
  if (temp == null) {
    console.log('no more djs');
    return;
  }
  const song = temp.getSong();
  console.log(song);
  if (song == null) {
    nextSong(message);
    return;
  }
  if (temp.songs.length != 0) {
    console.log(temp.songs.length + ' more songs');
    djs.push(temp);
  }
  console.log('in mem.voiceChannel');
  message.member.voice.channel.join().then((connection) => {
    console.log('using connection and logging song');
    console.log(song);
    console.log('post song log');
    const s = song.getStream();
    console.log('logging stream');
    console.log(s);
    console.log('post stream log');
    current = song;
    dispatcher = connection.play(song.getStream());
    dispatcher.on('end', () => nextSong(message));
    dispatcher.on('error', () => nextSong(message));
    connection.on('error', () => {
      message.channel.send(decode('Problem with song: ' + current.title + ' url: ' + current.url));
      nextSong(message);
    });
  }).catch(console.log);
}

/**
 * Gets the queue.
 * @return {Object} Array of the songs in the queue
 */
function getQueue() {
  const temp = JSON.parse(JSON.stringify(djs));
  const ret = [];
  let dj;
  let song;
  if (current != null) {
    ret.push(current);
  }
  console.log('temp original');
  while (temp.length > 0) {
    dj = temp.shift();
    song = dj.songs.shift();
    if (song == null) continue;
    ret.push(song);
    temp.push(dj);
  }
  console.log(ret);
  return ret;
}

/**
 * Get up to 10 songs per page.
 * @param {*} q Queue of songs
 * @param {*} p Page to access
 * @param {*} l Length of the queue
 * @return {String} Information about the songs in that page
 */
function parseQueue(q, p, l) {
  let message = '';
  console.log('parse');
  console.log(q);
  for (let i = 0; i < 10 && (p + i) < q.length; i++) {
    if (p == 0 && i == 0 && current !== null) {
      message += (p + i + 1) + '. :play_pause: `' + q[i].title + '` [' + q[i].length + '] req by ' + q[i].player + '\n';
      continue;
    }
    message += (p + i + 1) + '. `' + q[p + i].title + '` [' + q[p + i].length + '] req by ' + q[p + i].player + '\n';
  }
  message += 'Page: ' + ((p / 10) + 1) + ' Total number of songs: ' + l;
  console.log(message);
  return message;
}

/**
 * Shuffle the songs of a specific DJ.
 * @param {Object} mes Information about request from Discord
 * @return {Boolean} If the operation was sucessful or not
 */
function shuffle(mes) {
  let dj = null;
  for (let i = 0; i < djs.length; i++) {
    if (djs[i].id == mes.member.id) {
      dj = djs[i];
    }
  }
  if (dj == null) return false;
  if (dj.songs.length == 0) return false;
  const arr = dj.songs;
  let j;
  let temp;
  for (let i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  dj.songs = arr;
  return true;
}

/**
 * Determines which songs to remove from the specified array of nums.
 * @param {Object} nums Indexes from which to remove the songs
 * @param {Object} q Queue of songs
 * @return {Object} Songs that were removed
 */
function removeElements(nums, q) {
  let j = 0;
  const arr = [];
  const removeCounter = {};
  for (let i = 0; i < djs.length; i++) {
    removeCounter[djs[i].id] = 0;
    removeHelp[djs[i].id] = [];
  }
  nums = nums.filter((num) => !(num < 0 || num >= q.length)).sort();
  console.log('nums at the end');
  console.log(nums);
  for (let i = 0; i < q.length && nums.length > 0; i++) {
    j = nums[0];
    if ((j - 1) == i) {
      arr.push([]);
      arr[arr.length - 1].push(q[j - 1].pid);
      arr[arr.length - 1].push(q[j - 1].title);
      arr[arr.length - 1].push(i + 1);
      removeHelp[q[j - 1].pid].push(removeCounter[q[j - 1].pid]);
      nums.shift();
    }
    removeCounter[q[j - 1].pid]++;
  }
  return arr;
}

/**
 * Removes the songs based off the indices that were selected in removeElements;
 */
function cleanUp() {
  // let dj = null;
  console.log('cleaning up');
  // console.log(arr);
  for (let i = 0; i < djs.length; i++) {
    let offset = 0;
    for (let j = 0; j < djs[i].songs.length; j++) {
      if (removeHelp[djs[i].id][0] - offset === j) {
        console.log('removingremovingremovingremovingremoving');
        console.log(removeHelp);
        console.log(djs[i].songs[j].title);
        djs[i].songs.splice(j, 1);
        removeHelp[djs[i].id].shift();
        offset++;
        j--;
      }
    }
  }
}

/**
 * Search YouTube based off the serach query that was specified.
 * @param {String} str Query
 * @param {Number} id Discord identifier for the searcher
 * @param {Object} callback Callback to use to leave the async calls
 */
function ytSearch(str, id, callback) {
  console.log('query: ' + str);
  https.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + str + '&type=video&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      const parsed = JSON.parse(data);
      console.log(parsed);
      searches[id] = [];
      for (let i = 0; i < parsed.items.length; i++) {
        searches[id][i] = {};
        searches[id][i].title = parsed.items[i].snippet.title;
        searches[id][i].id = parsed.items[i].id.videoId;
        searches[id][i].type = 'yt';
      }
      parseVideos(parsed.items, id, callback);
    });
  });
}

/**
 * Gets durations of each YouTube video.
 * @param {Object} videos Array of videos
 * @param {Number} id Discord identifier for the searcher
 * @param {Object} callback Callback to use to leave the async calls
 */
function parseVideos(videos, id, callback) {
  https.get('https://content.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + videos[0].id.videoId + '&key=' + ((process.env.YOUTUBE_API !== undefined) ? process.env.YOUTUBE_API : require('../../auth.json').youtubeApi), (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      const parsed = JSON.parse(data);
      console.log('len: ' + videos.length + ' index: ' + (((videos.length - 1) % 5) * -1));
      searches[id][((videos.length - 1) % 5)].info = parsed;
      console.log((videos.length - 1) + '     ' + ((videos.length - 5) % 5));
      const mom = moment.duration(parsed.items[0].contentDetails.duration);
      const seconds = mom.asSeconds() % 60;
      const minutes = Math.floor(mom.asSeconds() / 60);
      searches[id][(((videos.length - 5) % 5) * -1)].duration = minutes + ':' + ((seconds < 10) ? ('0' + seconds) : seconds);
      videos.shift();
      if (videos.length === 0) {
        callback();
      } else {
        parseVideos(videos, id, callback);
      }
    });
  });
}

/**
 * Search YouTube based off the serach query that was specified.
 * @param {*} str Query
 * @param {*} id Discord identifier for the searcher
 * @param {*} callback Callback to use to leave the async calls
 */
function scSearch(str, id, callback) {
  http.get('http://api.soundcloud.com/tracks?q=' + str + '&client_id=' + ((process.env.SCID !== undefined) ? process.env.SCID : require('../../auth.json').scid), function(resp) {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      searches[id] = [];
      let parsed = JSON.parse(data);
      console.log(parsed);
      console.log(parsed.length);
      parsed = parsed.slice(0, 5);
      for (let i = 0; i < parsed.length; i++) {
        const duration = parsed[i].duration;
        minutes = Math.floor(duration / 60000);
        seconds = ((duration % 60000) / 1000).toFixed(0);
        searches[id][i] = new Soundcloud.Soundcloud(parsed[i].permalink_url, parsed[i].stream_url + '?client_id=' + ((process.env.SCID !== undefined) ? process.env.SCID : require('../../auth.json').scid), parsed[i].title, minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
      }
      callback();
    });
  });
}

module.exports = {
  bot: bot,
};
