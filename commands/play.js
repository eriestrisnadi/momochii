const logger = require('winston');
const axios = require('axios');
const { _stream } = require('../utils');
const { RichEmbed } = require('discord.js');
const { color } = require('../config');
const moment = require('moment');

module.exports = function (db, message, conn, keyword) {
  axios
    .get('http://api-jooxtt.sanook.com/web-fcgi-bin/web_search', {
      params: {
        country: "id",
        lang: "en",
        search_input: keyword,
        sin: 0,
        ein: 30
      }
    })
    .then(res => {
      const _first = res.data.itemlist[0];

      db
        .get('queue')
        .push({
          songid: _first.songid,
          title: Buffer.from(_first.info1, 'base64').toString('ascii'),
          artist: Buffer.from(_first.info2, 'base64').toString('ascii'),
          guildid: message.guild.id
        })
        .write();

      axios
        .get('http://api-jooxtt.sanook.com/web-fcgi-bin/web_get_songinfo', {
          params: {
            country: "id",
            lang: "en",
            songid: _first.songid,
          }
        })
        .then(res => {
          db
            .get('queue')
            .find({ songid: _first.songid, guildid: message.guild.id })
            .assign({ arbitary: res.data.r320Url, thumbnail: res.data.imgSrc, duration: moment.utc(res.data.minterval * 1000).format('mm:ss') })
            .write();

          const current = db.get('queue').find({ songid: _first.songid }).value();
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

    })
    .catch(console.log)
};