const { RichEmbed } = require('discord.js');
const { color, symbol } = require('../config');

const skip = require('./skip');

module.exports = function (db, message, conn, args) {
  const id = parseInt(args);
  if (!isNaN(id)) {
    if (id - 1 > 0) {
      const queue = db.get('queue').filter({ guildid: message.guild.id });
  
      if (queue.value().length !== 0 && queue.value()[id - 1]) {
        const song = queue.value()[id - 1];
        db.get('queue').splice(id - 1, 1).write();
  
        const embeded = new RichEmbed()
          .setColor(color)
          .setTitle(`${song.title} - ${song.artist} telah dihapus dari daftar pemutar.`);
  
        return message.channel.send(embeded);
      }
    } else {
      skip(db, message, conn);
    }
  }
}