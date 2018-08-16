const { RichEmbed } = require('discord.js');
const { color } = require('../config');

module.exports = function (db, message, conn) {
  if (conn.dispatcher) {
    if(db.get('queue').filter({guildid: message.guild.id}).value().length !== 0) {
      const current = db.get('queue').filter({guildid: message.guild.id}).value()[0];
      const embeded = new RichEmbed()
        .setTitle(`${current.title} - ${current.artist}`)
        .setDescription('Dilewati')
        .setColor(color);

      message.channel.send(embeded);
      conn.dispatcher.end();
    }
  }
}