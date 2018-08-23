import { get } from 'axios';
import { RichEmbed } from 'discord.js';
import { color, baseJooxUrl } from '../config';

export default (db, message) => {

  get(`${baseJooxUrl}web_recommend_more`, {
    params: {
      country: "id",
      lang: "en",
      sin: 0,
      ein: 100,
      req_type: 5,
    }
  })
    .then(res => {
      db.get('moodlist').remove({ guildid: message.guild.id }).write();
      const shuffled = res.data.itemlist
        .map(a => [Math.random(), a])
        .sort((a, b) => a[0] - b[0])
        .map(a => a[1])
        .splice(85, res.data.itemlist.length-1);

      const queue = shuffled.map((o, i) => {
        const id = i + 1;
        const data = {
          id: id,
          moodid: o.id,
          title: Buffer.from(o.title, 'base64').toString('ascii'),
          tracks: o.track_count,
          guildid: message.guild.id
        };
        db.get('moodlist').push(data).write();

        return { name: `${id}. ${data.title}`, value: `Jumlah Lagu: ${data.tracks}` };
      });

      return message.channel.send(
        new RichEmbed({
          fields: queue
        }).setColor(color).setTitle('Daftar Kategori:')
      );
    })
    .catch(console.log)
};