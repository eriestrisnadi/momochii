import { get } from 'axios';
import { RichEmbed } from 'discord.js';
import { color, baseJooxUrl } from '../config';
import { _handlerSearch } from '../utils';

export default (db, message, conn, keyword) => {

  const mood = db.get('moodlist').find((o) => { return (o.id === parseInt(keyword) || o.title === keyword) }).value();

  if (typeof mood !== 'undefined') {
    get(`${baseJooxUrl}web_get_diss`, {
      params: {
        country: "id",
        lang: "en",
        qryDissID: mood.moodid
      }
    })
      .then(res => {
        res.data.songlist.forEach((o, i) => {
          db
            .get('queue')
            .push({
              songid: o.songid,
              title: Buffer.from(o.name, 'base64').toString('ascii'),
              artist: Buffer.from(o.artist, 'base64').toString('ascii'),
              guildid: message.guild.id
            })
            .write();


          if (0 === i) {
            _handlerSearch(db, conn, message, o.songid, true, true);
          } else {
            _handlerSearch(db, conn, message, o.songid, true, false);
          }
        });

        return message.channel.send(
          new RichEmbed()
            .setColor(color)
            .setTitle(`Mohon tunggu sedang menambahkan semua track dari kategori "${mood.title}" ke daftar pemutar lagu.`)
            .setDescription('Lagu akan otomatis diputar setelah salah satu berhasil ditambahkan.')
        );
      })
      .catch(console.log)
  } else {
    return message.channel.send(
      new RichEmbed().setColor(color).setTitle('Kategori yang dipilih tidak ada.')
    );
  }
};