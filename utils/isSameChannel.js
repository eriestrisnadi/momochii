const { Message, RichEmbed } = require('discord.js');

module.exports = (message = new Message) => {
  if (!message.member.voiceChannel) return false;
  if (message.client.voiceConnections.has(message.guild.id)) {
    const voiceChannel = message.client.voiceConnections.get(message.guild.id);
    if (voiceChannel.channel.id !== message.member.voiceChannelID) {
      message.channel.send(
        new RichEmbed()
          .setTitle(':warning: Kamu harus berada di voice channel yang sama.')
      );
      return false;
    }
  }
  return true;
};