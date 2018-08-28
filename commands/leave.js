const { Message, RichEmbed } = require('discord.js');
const { error } = require('winston');
const isSameChannel = require('../utils/isSameChannel');

module.exports = {
  name: 'leave',
  description: 'Memerintahkan bot untuk meninggalkan voice channel.',
  execute(message = new Message) {
    if (!isSameChannel(message)) return;
    if (
      message.member.voiceChannel
      && message.member.voiceChannel.connection
      && message.member.voiceChannel.connection.dispatcher
    ) {
      message.client.queue.set(message.guild.id, []);
      message.client.prequeue.set(message.guild.id, []);

      message.channel.send(
        new RichEmbed()
          .setTitle(':end: Meninggalkan voice channel.')
          .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
      )
        .then(() => {
          message.member.voiceChannel.leave();
        })
        .catch(err => error('Couldn\'t send message to user.', err));
    }
  },
};