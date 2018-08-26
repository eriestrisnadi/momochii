const { Message, RichEmbed } = require('discord.js');
const { utc } = require('moment');
const { name, version, author } = require('../package.json');

module.exports = {
  name: 'info',
  description: 'Menampilkan informasi bot ini.',
  execute(message = new Message) {
    message.channel.send(
      new RichEmbed()
        .setTitle(`${name.toUpperCase()} - v${version}`)
        .addField('Author:', author)
        .addField('Uptime:', `${utc(1000 * Math.round(message.client.uptime / 1000)).format('HH:mm:ss')}`)
        .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
    );
  },
};