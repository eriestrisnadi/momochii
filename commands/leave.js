const { Message, RichEmbed } = require('discord.js');
const { info, erro } = require('winston');

module.exports = {
  name: 'leave',
  description: 'Memerintahkan bot untuk meninggalkan voice channel.',
  execute(message = new Message) {
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
          info(`Leave command requested by ${message.author.username}#${message.author.id}`);
        })
        .catch(err => error(`Couldn't send message to user.`, err));
    }
  },
};