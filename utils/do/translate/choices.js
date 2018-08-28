module.exports = () => {
  const languages = require('google-translate-api/languages');
  const results = [];
  let _;
  for (_ in languages) {
    results.push(_);
  }
  return results.sort().join('|');
};