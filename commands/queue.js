const { RichEmbed } = require('discord.js');
const { color } = require('../config');

module.exports = function (db, message) {
  if (db.get('queue').filter({ guildid: message.guild.id }).value().length === 0) {
    const embeded = new RichEmbed()
      .setColor(color)
      .setDescription(`Tidak ada lagu yang diputar saat ini.`);

    return message.channel.send(embeded);
  } else {
    const queue = db.get('queue').filter({ guildid: message.guild.id }).value().map((o, i) => {
      const id = i + 1;
      return { name: `${id}. ${o.title} - ${o.artist}`, value: `Durasi: ${o.duration}` };
    });

    return message.channel.send(
      new RichEmbed({
        fields: queue
      }).setColor(color).setTitle('Daftar lagu yang akan diputar:')
    );
  }
}