const { Message, RichEmbed } = require('discord.js');
const { info } = require('winston');
const isSameChannel = require('../utils/isSameChannel');

module.exports = {
  name: 'pause',
  description: 'Menghentikan pemutaran lagu untuk sementara.',
  execute(message = new Message) {
    if (!isSameChannel(message)) return;
    if (
      message.member.voiceChannel.connection
      && message.member.voiceChannel.connection.dispatcher
    ) {
      const song = message.client.queue.get(message.guild.id)[0];
      message.channel.send(
        new RichEmbed()
          .setTitle(`:stop_button: Berhenti memutar lagu "${song.title} - ${song.artist}"`)
          .setFooter(
            `Diminta oleh ${message.author.username}`,
            message.author.displayAvatarURL
          )
      )
        .then(() => {
          message.member.voiceChannel.connection.dispatcher.pause();
          info(`Resume command requested by ${message.author.username}#${message.author.id}`);
        });
    }
  },
};