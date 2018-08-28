const { Message, RichEmbed } = require('discord.js');
const { prefix } = require('../config.json');
const { error } = require('winston');

module.exports = {
  name: 'help',
  description: 'Mengirimkan pesan bantuan tentang perintah yang didukung oleh bot ini.',
  execute(message = new Message) {
    message.member.createDM().then(dm => {
      if (dm.client.commands) {
        const fields = dm.client.commands.map(command => {
          const description = [command.description];
          const name = [command.name];
          if (command.subcommands && command.subcommandTitle) {
            description.push(`\n${command.subcommandTitle}: `);
            name.push(`<${command.subcommandTitle}>`);
            command.subcommands.forEach(child => {
              description.push(`\`${child}\``);
            });
          }
          return { name: prefix + name.join(' '), value: description.join(' ') };
        });

        dm.send(
          new RichEmbed({
            fields,
          })
            .setTitle(`:scroll: Perintah yang didukung oleh ${dm.client.user.username}`)
            .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
        ).then(() => {
          message.channel.send(
            new RichEmbed()
              .setTitle(':incoming_envelope: Pesan bantuan telah dikirim melalui DM.')
              .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
          );
        }).catch(err => error('Couldn\'t send DMs to user.', err));
      }
    }).catch(err => error('Couldn\'t create DMs with user.', err));
  },
};