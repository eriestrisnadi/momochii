const { Message, RichEmbed } = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'Menampilkan daftar lagu yang akan diputar.',
  execute(message = new Message) {
    if (!message.client.queue) return;

    const fields = message.client.queue.get(message.guild.id).map((o, i) => {
      const id = i + 1;
      return `${id}. ${o.title} - ${o.artist}`;
    });

    message.channel.send(
      new RichEmbed()
        .setTitle(':notes: Daftar lagu yang akan diputar:')
        .setDescription(fields.join('\n'))
        .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
    );
  },
};