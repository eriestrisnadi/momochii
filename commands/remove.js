const { Message, RichEmbed } = require('discord.js');
const { info } = require('winston');
const isSameChannel = require('../utils/isSameChannel');

module.exports = {
  name: 'remove',
  description: 'Mengaktifkan/mematikan perulangan daftar queue.',
  execute(message = new Message, args) {
    if (!isSameChannel(message)) return;
    const id = parseInt(args.join(''));
    if (isNaN(id) || !message.member.voiceChannel) return;
    if (!message.client.queue.has(message.guild.id)) message.client.queue.set(message.guild.id, []);

    info('Check if song available on queue ...');
    const queue = message.client.queue.get(message.guild.id);
    const song = queue[id - 1];

    if (!song) return message.channel.send(
      new RichEmbed()
        .setTitle(':warning: Gagal menghapus lagu, index tidak ditemukan.')
        .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
    );

    info('Removing song from queue ...');
    queue.splice(id - 1, 1);
    message.client.queue.set(message.guild.id, queue);

    message.channel.send(
      new RichEmbed()
        .setTitle(`:wastebasket: Menghapus lagu "${song.title} - ${song.artist}" dari queue`)
        .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
    );
  },
};