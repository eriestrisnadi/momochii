const Discord = require('discord.js');
const client = new Discord.Client();
const logger = require('winston');
const low = require('lowdb');
const Memory = require('lowdb/adapters/Memory');
const db = low(new Memory());
db.defaults({ queue: [] }).write();
const { symbol, token } = require('./config');

const play = require('./commands/play');
const skip = require('./commands/skip');
const queue = require('./commands/queue');
const help = require('./commands/help');

client.login(token);

client.on('ready', () => {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(client.user.username + ' - (' + client.user.id + ')');
});

client.on('message', message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;

  if (message.content.split(' ').length !== 0 && message.content.split(' ')[0] == symbol) {
    let args = message.content.split(' ');
    const cmd = args[1];

    args = args.splice(2);
    switch (cmd) {
      case 'play':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join()
            .then(conn => {
              play(db, message, conn, args.join(' '));
            })
            .catch(logger.info);
        }
        break;

      case 'skip':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join()
            .then(conn => {
              skip(db, message, conn);
            })
            .catch(logger.info);
        }
        break;

      case 'queue':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join()
            .then(conn => {
              queue(db, message);
            })
            .catch(logger.info);
        }
        break;

      case 'leave':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join()
            .then(conn => {
              message.member.voiceChannel.leave();
              db.get('queue').remove({ guildid: message.guild.id }).write();
            })
            .catch(logger.info);
        }
        break;

      case 'help':
        help(message);
        break;
    }
  }
});