const { Message, RichEmbed } = require('discord.js');
const isSameChannel = require('../utils/isSameChannel');
const shuffle = require('../utils/shuffle');

module.exports = {
  name: 'shuffle',
  description: 'Mengatur ulang index daftar queue.',
  execute(message = new Message) {
    if (!isSameChannel(message)) return;
    if (!message.client.queue.has(message.guild.id)) message.client.queue.set(message.guild.id, []);

    const queue = message.client.queue.get(message.guild.id);

    message.client.queue.set(message.guild.id, shuffle(queue));

    message.channel.send(
      new RichEmbed()
        .setTitle(':twisted_rightwards_arrows: Daftar queue diatur ulang')
        .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
    );
  },
};