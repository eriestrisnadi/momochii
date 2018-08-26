const { Message } = require('discord.js');

module.exports = {
  name: 'server',
  description: 'Menampilkan informasi server ini.',
  execute(message = new Message) {
    message.channel.send(`Nama Server: ${message.guild.name}\nJumlah Member: ${message.guild.memberCount}`);
  },
};