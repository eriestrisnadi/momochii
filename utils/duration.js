const { utc } = require('moment');

module.exports = (number = new Number) => {
  return utc(number * 1000).format('mm:ss');
};