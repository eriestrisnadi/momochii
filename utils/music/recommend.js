const { get } = require('axios');
const { musicEndpoint } = require('../../config.json');

module.exports = () => {
  return get(`${musicEndpoint}web_recommend_more`, {
    params: {
      country: 'id',
      lang: 'en',
      sin: 0,
      ein: 100,
      req_type: 5,
    },
  });
};