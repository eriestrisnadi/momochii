const fs = require('fs');
const { Message, Collection } = require('discord.js');
const { info, error } = require('winston');

module.exports = {
  name: 'activated',
  description: 'Memerintahkan bot untuk mengaktifkan sebuah operasi stream.',
  execute: (message = new Message, args) => {
    args = [].concat(args);
    const command = args.shift().toLowerCase();

    const commandFiles = fs.readdirSync('./commands/subcommands/activated').filter(file => file.endsWith('.js'));
    const commands = new Collection();

    commandFiles.map(file => {
      const command = require(`./subcommands/activated/${file}`);
      commands.set(command.name, command);
    });

    try {
      commands.get(command).execute(message, args);
      info(`${command} command requested by ${message.author.username}#${message.author.id}`);
    }
    catch (err) {
      error('Couldn\'t execute the command', err);
      message.reply('Terjadi kesalahan saat menjalankan perintah tersebut!');
    }
  },
  subcommands: ['anime'],
  subcommandTitle: 'operasi'
};