const { get } = require('axios');
const { musicEndpoint } = require('../../config.json');

module.exports = songid => {
  return get(`${musicEndpoint}web_get_songinfo`, {
    params: {
      country: 'id',
      lang: 'en',
      songid: songid,
    },
  });
};