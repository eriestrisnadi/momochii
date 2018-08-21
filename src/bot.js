import { Client } from 'discord.js';
const client = new Client();
import { info } from 'winston';
import low from 'lowdb';
import Memory from 'lowdb/adapters/Memory';
const db = low(new Memory());
db.defaults({ queue: [], search: [], repeats: [], prequeue: [] }).write();
import { symbol, token } from './config';
import { _handlerSearch } from './utils';

import play from './commands/play';
import skip from './commands/skip';
import queue from './commands/queue';
import search from './commands/search';
import repeat from './commands/repeat';
import remove from './commands/remove';
import help from './commands/help';

client.login(token);

client.on('ready', () => {
  info('Connected');
  info('Logged in as: ');
  info(`${client.user.username} - ( ${client.user.id} )`);
});

client.on('message', message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;

  if (
    db.get('search').filter({ guildid: message.guild.id }).value().length !== 0
    && !isNaN(parseInt(message.content))
    && message.member.voiceChannel
  ) {
    const selected = db.get('search').find({ id: parseInt(message.content), guildid: message.guild.id });
    if (selected) {
      if (message.member.voiceChannel) {
        message.member.voiceChannel.join()
          .then(conn => {
            db
              .get('queue')
              .push(selected.value())
              .write();

            _handlerSearch(db, conn, message, selected.value().songid);
            db.get('search').remove({ guildid: message.guild.id }).write();
          })
          .catch(info);
      }
    }
  }

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
            .catch(info);
        }
        break;

      case 'skip':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join()
            .then(conn => {
              skip(db, message, conn);
            })
            .catch(info);
        }
        break;

      case 'queue':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join()
            .then(conn => {
              queue(db, message);
            })
            .catch(info);
        }
        break;

      case 'search':
        search(db, message, args.join(' '));
        break;

      case 'repeat':
        repeat(db, message);
        break;

      case 'remove':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join()
            .then(conn => {
              remove(db, message, conn, args.join(' '));
            })
            .catch(info);
        }
        break;

      case 'leave':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join()
            .then(conn => {
              message.member.voiceChannel.leave();
              db.get('queue').remove({ guildid: message.guild.id }).write();
              db.get('search').remove({ guildid: message.guild.id }).write();
              db.get('prequeue').remove({ guildid: message.guild.id }).write();
            })
            .catch(info);
        }
        break;

      case 'help':
        help(message);
        break;
    }
  }
});