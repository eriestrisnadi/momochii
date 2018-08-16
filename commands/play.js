const axios = require('axios');
const { _handlerSearch } = require('../utils');
const { baseJooxUrl } = require('../config');

module.exports = function (db, message, conn, keyword) {
  axios
    .get(`${baseJooxUrl}web_search`, {
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

      _handlerSearch(db, conn, message, _first.songid);

    })
    .catch(console.log)
};