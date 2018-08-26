const { get } = require('axios');
const { musicEndpoint } = require('../../config.json');

module.exports = keyword => {
  return get(`${musicEndpoint}web_search`, {
    params: {
      country: 'id',
      lang: 'en',
      search_input: keyword,
      sin: 0,
      ein: 7,
    },
  });
};