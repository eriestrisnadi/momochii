const { Message, RichEmbed } = require('discord.js');
const isSameChannel = require('../utils/isSameChannel');

module.exports = {
  name: 'resume',
  description: 'Melanjutkan pemutaran lagu yang diberhentikan.',
  execute(message = new Message) {
    if (!isSameChannel(message)) return;
    if (
      message.member.voiceChannel.connection
      && message.member.voiceChannel.connection.dispatcher
    ) {
      const song = message.client.queue.get(message.guild.id)[0];
      message.channel.send(
        new RichEmbed()
          .setTitle(`:arrow_forward: Melanjutkan memutar lagu "${song.title} - ${song.artist}"`)
          .setFooter(
            `Diminta oleh ${message.author.username}`,
            message.author.displayAvatarURL
          )
      )
        .then(() => {
          message.member.voiceChannel.connection.dispatcher.resume();
        });
    }
  },
};