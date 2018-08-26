const { get } = require('axios');
const { musicEndpoint } = require('../../config.json');

module.exports = (moodid) => {
  return get(`${musicEndpoint}web_get_diss`, {
    params: {
      country: 'id',
      lang: 'en',
      qryDissID: moodid
    },
  });
};