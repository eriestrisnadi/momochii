const { Message, RichEmbed } = require('discord.js');
const translate = require('google-translate-api');
const { info, error } = require('winston');
const languages = require('google-translate-api/languages');
const choices = require('../../../utils/do/translate/choices');

module.exports = {
  name: 'translate',
  description: 'Operasi untuk menerjemahkan bahasa',
  execute: (message = new Message, args) => {
    let ref;
    const pattern = new RegExp(`(?:from (${choices()}))?(?: (?:in)?to (${choices()}))?(.*)`, 'i');
    const matches = args.join(' ').match(pattern);
    const term = `"${(ref = matches[3]) != null ? ref.trim() : void 0}"`;
    const origin = matches[1] !== void 0 ? matches[1] : 'auto';
    const target = matches[2] !== void 0 ? matches[2] : 'en';

    info('Requesting to translate the words ...');
    translate(term, { from: origin, to: target })
      .then(res => {
        info(`Translate found: ${res.text}`);
        message.channel.send(
          new RichEmbed()
            .setTitle(':ok: Hasil terjemahan: ')
            .addField(res.text.replace(/"/ig, ''), `dari: ${languages[res.from.language.iso].toLowerCase()} | ke: ${languages[target].toLowerCase()}`)
            .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
        );
      })
      .catch(err => {
        error('Translate not found! Something went wrongs.', err);
      });
  }
};