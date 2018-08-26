const { Message, RichEmbed } = require('discord.js');

module.exports = {
  name: 'repeat',
  description: 'Mengaktifkan/mematikan perulangan daftar queue.',
  execute(message = new Message) {
    const guildid = message.guild.id;
    if (!message.client.repeat.has(guildid)) message.client.repeat.set(guildid, false);

    const repeat = message.client.repeat.get(guildid);

    (repeat === false) ? message.client.repeat.set(guildid, true) : message.client.repeat.set(guildid, false);

    const stat = (repeat === false)
      ? { emoji: ':repeat:', text: 'aktif' }
      : { emoji: ':repeat_one:', text: 'mati' };

    message.channel.send(
      new RichEmbed()
        .setTitle(`${stat.emoji} Perulangan daftar queue di${stat.text}kan`)
        .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
    );
  },
};