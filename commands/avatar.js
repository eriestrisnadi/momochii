const { Message } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Mendapatkan URL avatar user yang dipilih, atau sendiri.',
  execute(message = new Message) {
    if (!message.mentions.users.size) {
      return message.channel.send(`Avatar anda: ${message.author.displayAvatarURL}`);
    }

    const avatarList = message.mentions.users.map(user => {
      return `Avatar ${user.username}: ${user.displayAvatarURL}`;
    });

    message.channel.send(avatarList);
  },
};