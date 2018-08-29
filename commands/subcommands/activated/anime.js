const { Message, RichEmbed } = require('discord.js');
const { error } = require('winston');
const moment = require('moment');
const Parser = require('rss-parser');
const parser = new Parser();
moment.locale('id');

module.exports = {
  name: 'anime',
  description: 'Mengaktifkan operasi anime update.',
  execute: (message = new Message) => {
    if (!message.client.anime.has(message.guild.id)) message.client.anime
      .set(message.guild.id, {
        channel: null
      });

    try {
      if (message.client.anime.get(message.guild.id).channel === null) {
        message.client.anime
          .set(message.guild.id, {
            channel: message.mentions.channels.array()[0]
          });
      }
      message.channel.send(
        new RichEmbed()
          .setTitle(`:ok: Anime update diaktifkan di channel ${message.mentions.channels.array()[0].name}`)
          .setFooter(
            `Diminta oleh ${message.author.username}`,
            message.author.displayAvatarURL
          )
      );
      setInterval(() => {
        if (message.client.anime.get(message.guild.id).channel !== null) {
          parser.parseURL('https://www.riie.net/feed', (err, feed) => {
            const currentState = message.client.anime.get(message.guild.id);

            if (
              feed.items.length > 0
              && currentState.anime === undefined
              || feed.items.length > 0
              && currentState.anime.title !== feed.items[0].title
            ) {
              message.client.anime.set(message.guild.id, {
                channel: currentState.channel, anime: feed.items[0]
              });
              const date = moment((feed.items[0].isoDate.slice(0, -1).split('T')[0])).format('dddd, DD MMMM YYYY');
              currentState.channel.send(
                new RichEmbed()
                  .setTitle(`Anime Update: ${feed.items[0].title}`)
                  .setURL(feed.items[0].link)
                  .setFooter(`Dirilis: ${date}`)
              );
            }

          });
        }
      }, 3600000);
    }
    catch (err) {
      error('Couldn\'t activated anime.', err);
      message.channel.send(
        new RichEmbed()
          .setTitle(':warning: Gagal mengaktifkan anime update pada channel.')
          .setFooter(
            `Diminta oleh ${message.author.username}`,
            message.author.displayAvatarURL
          )
      );
    }
  }
};