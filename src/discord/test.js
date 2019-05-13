const Discord = require('discord.js');
const bot = new Discord.Client({
  token: ((process.env.TOKEN !== undefined) ? process.env.TOKEN : require('../../auth.json').token),
  autorun: true,
});

bot.login(((process.env.TOKEN !== undefined) ? process.env.TOKEN : require('../../auth.json').token));

// bot.users.find

// bot.users.fetch(name).then((user) => {
//   console.log(user);
// }).catch((error) => {
//   console.log(error);
// });

// console.log(bot.users.find('bobby1298'));
// .then((user) => {
//   console.log(user);
// }).catch((error) => {
//   console.log(error);
// });
// bot.on('message', (message) => {
//   console.log(message.channel.type);
//   bot.users.fetch(message.author.id).then((user) => {
//     console.log(user);
//   }).catch((error) => {
//     console.log(error);
//   });
// });
