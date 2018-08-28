const { Message, RichEmbed } = require('discord.js');
const { error } = require('winston');
const math = require('mathjs');

module.exports = {
  name: 'math',
  description: 'Melakukan operasi matematika.',
  execute: (message = new Message, args) => {
    try {
      message.channel.send(
        new RichEmbed()
          .setTitle(`:ok: Hasil kalkulasi: ${math.eval(args.join(''))}`)
          .setFooter(
            `Diminta oleh ${message.author.username}`,
            message.author.displayAvatarURL
          )
      );
    }
    catch (err) {
      error('Couldn\'t do math.', err);
      message.channel.send(
        new RichEmbed()
          .setTitle(':warning: Hasil kalkulasi tidak ditemukan.')
          .setFooter(
            `Diminta oleh ${message.author.username}`,
            message.author.displayAvatarURL
          )
      );
    }
  }
};