const { Message } = require('discord.js');
const { info, error } = require('winston');

module.exports = (message = new Message, msgid) => {
  message.channel.fetchMessage(msgid)
    .then(msg => {
      info(`Deleting messegeID:${msgid}`);
      msg.delete(1000);
    })
    .catch(err => error('Couldn\'t fetch a message', err));
}; 