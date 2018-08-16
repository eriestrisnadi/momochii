const { RichEmbed } = require('discord.js');
const axios = require('axios');
const moment = require('moment');
const { color, baseJooxUrl } = require('./config');

const _stream = function (db, conn, message) {
  if (db.get('queue').value().length !== 0) {
    const item = db.get('queue').filter({ guildid: message.guild.id }).value()[0];
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

const _handlerSearch = function (db, conn, message, songid) {
  axios
    .get(`${baseJooxUrl}web_get_songinfo`, {
      params: {
        country: "id",
        lang: "en",
        songid: songid,
      }
    })
    .then(res => {
      db
        .get('queue')
        .find({ songid: songid, guildid: message.guild.id })
        .assign({ arbitary: res.data.r320Url, thumbnail: res.data.imgSrc, duration: moment.utc(res.data.minterval * 1000).format('mm:ss') })
        .write();

      const current = db.get('queue').find({ songid: songid, guildid: message.guild.id }).value();
      const embeded = new RichEmbed()
        .setColor(color)
        .setTitle(`Menambahkan "${current.title} - ${current.artist}" ke daftar lagu.`)
        .setDescription(`Durasi ${current.duration}`)
        .setThumbnail(current.thumbnail);

      message.channel.send(embeded);

      if (typeof conn.dispatcher === 'undefined') {
        _stream(db, conn, message);
      }
    })
    .catch(console.log)
}


module.exports = { _stream: _stream, _handlerSearch: _handlerSearch };