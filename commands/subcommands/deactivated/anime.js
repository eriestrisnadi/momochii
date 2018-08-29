const { Message, RichEmbed } = require('discord.js');
const { error } = require('winston');

module.exports = {
  name: 'anime',
  description: 'Mematikan operasi anime update.',
  execute: (message = new Message) => {
    if (!message.client.anime.has(message.guild.id)) message.client.anime
      .set(message.guild.id, {
        channel: null
      });

    if (message.client.anime.get(message.guild.id).channel === null) return;
    try {
      const currentState = message.client.anime.get(message.guild.id);
      message.channel.send(
        new RichEmbed()
          .setTitle(`:ok: Anime update dimatikan pada channel ${currentState.channel.name}`)
          .setFooter(
            `Diminta oleh ${message.author.username}`,
            message.author.displayAvatarURL
          )
      );
      message.client.anime
        .set(message.guild.id, {
          channel: null
        });
    }
    catch (err) {
      error('Couldn\'t deactivated anime.', err);
      message.channel.send(
        new RichEmbed()
          .setTitle(':warning: Gagal mematikan anime update pada channel.')
          .setFooter(
            `Diminta oleh ${message.author.username}`,
            message.author.displayAvatarURL
          )
      );
    }
  }
};