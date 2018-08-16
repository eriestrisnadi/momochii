const { RichEmbed } = require('discord.js');
const { color } = require('./config');

const _stream = function (db, conn, message) {
  if (db.get('queue').value().length !== 0) {
    const item = db.get('queue').filter({guildid: message.guild.id}).value()[0];
    const embeded = new RichEmbed()
      .setColor(color)
      .setTitle(`:musical_note: Memutar lagu "${item.title} - ${item.artist}"`)
      .setDescription(`Durasi: ${item.duration}`)
      .setThumbnail(item.thumbnail);

    message.channel.send(embeded);

    const dispatcher = conn.playArbitraryInput(item.arbitary);

    dispatcher.on('end', end => {
      db
        .get('queue')
        .remove({ songid: item.songid, guildid: item.guildid })
        .write();

      _stream(db, conn, message);
    });

    return dispatcher;
  } else {
    const embeded = new RichEmbed()
      .setColor(color)
      .setTitle('Berhasil memutar semua lagu')
      .setDescription('Meninggalkan channel ...');

    message.channel.send(embeded);
    return message.member.voiceChannel.leave();
  }
}


module.exports = { _stream: _stream };