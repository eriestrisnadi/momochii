import { RichEmbed } from 'discord.js';
import { get } from 'axios';
import { utc } from 'moment';
import { color, baseJooxUrl } from './config';

const _stream = (db, conn, message) => {
  if (db.get('queue').filter({ guildid: message.guild.id }).value().length !== 0) {
    const item = db.get('queue').filter({ guildid: message.guild.id }).value()[0];
    const embeded = new RichEmbed()
      .setColor(color)
      .setTitle(`:musical_note: Memutar lagu "${item.title} - ${item.artist}"`)
      .setDescription(`Durasi: ${item.duration}`)
      .setThumbnail(item.thumbnail);

    message.channel.send(embeded)
      .then(msg => {
        db.set('msgid', msg.id).write();
      });

    const dispatcher = conn.playArbitraryInput(item.arbitary);

    dispatcher.on('end', end => {
      const playerRepeat = db.get('repeats').find({ guildid: message.guild.id }).value();

      if (typeof playerRepeat !== 'undefined' && playerRepeat.repeat === true) {
        db.get('prequeue').push(item).write();
      }

      message.channel.fetchMessage(db.get('msgid').value()).then(msg => {
        msg.delete(1000);
      }).catch(console.log);

      db
        .get('queue')
        .remove({ songid: item.songid, guildid: item.guildid })
        .write();

      _stream(db, conn, message);
    });

    return dispatcher;
  } else {
    const playerRepeat = db.get('repeats').find({ guildid: message.guild.id }).value();
    const items = db.get('prequeue').value();

    if (typeof playerRepeat !== 'undefined' && playerRepeat.repeat === true && items.length !== 0) {
      items.map(o => {
        db.get('queue').push(o).write();
        _handlerSearch(db, conn, message, o.songid, true);
        db.get('prequeue').remove(o).write();

        return o;
      });
    } else {
      const embeded = new RichEmbed()
        .setColor(color)
        .setTitle('Berhasil memutar semua lagu')
        .setDescription('Meninggalkan channel ...');

      message.channel.send(embeded);
      return message.member.voiceChannel.leave();
    }
  }
}

const _handlerSearch = (db, conn, message, songid, repeat, withPlay = true) => {
  get(`${baseJooxUrl}web_get_songinfo`, {
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
        .assign({ arbitary: res.data.r320Url, thumbnail: res.data.imgSrc, duration: utc(res.data.minterval * 1000).format('mm:ss') })
        .write();

      if (!repeat) {
        const current = db.get('queue').find({ songid: songid, guildid: message.guild.id }).value();
        const embeded = new RichEmbed()
          .setColor(color)
          .setTitle(`Menambahkan "${current.title} - ${current.artist}" ke daftar lagu.`)
          .setDescription(`Durasi ${current.duration}`)
          .setThumbnail(current.thumbnail);

        message.channel.send(embeded);
      }

      if (withPlay && typeof conn.dispatcher === 'undefined') {
        _stream(db, conn, message);
      }
    })
    .catch(console.log)
}


export { _stream, _handlerSearch };