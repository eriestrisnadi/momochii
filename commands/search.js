const logger = require('winston');
const axios = require('axios');
// const { _stream } = require('../utils');
const { RichEmbed } = require('discord.js');
const { color, baseJooxUrl } = require('../config');
const moment = require('moment');

module.exports = function (db, message, keyword) {

  axios
    .get(`${baseJooxUrl}web_search`, {
      params: {
        country: "id",
        lang: "en",
        search_input: keyword,
        sin: 0,
        ein: 5
      }
    })
    .then(res => {
      db.get('search').remove({ guildid: message.guild.id }).write();
      const queue = res.data.itemlist.map((o, i) => {
        const id = i + 1;
        const data = {
          id: id,
          songid: o.songid,
          title: Buffer.from(o.info1, 'base64').toString('ascii'),
          artist: Buffer.from(o.info2, 'base64').toString('ascii'),
          duration: moment.utc(o.playtime * 1000).format('mm:ss'),
          guildid: message.guild.id
        };
        db.get('search').push(data).write();

        return { name: `${id}. ${data.title} - ${data.artist}`, value: `Durasi: ${data.duration}` };
      });

      return message.channel.send(
        new RichEmbed({
          fields: queue
        }).setColor(color).setTitle('Hasil pencarian:')
      );
    })
    .catch(console.log)
};