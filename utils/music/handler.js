const { Message, RichEmbed } = require('discord.js');
const { info, error } = require('winston');
const stream = require('./stream');
const isSameChannel = require('../isSameChannel');

module.exports = (message = new Message) => {
  const id = parseInt(message.content);
  if (isNaN(id) || !message.client.search || !message.client.queue || !message.member.voiceChannel) return false;
  if (!message.client.search.has(message.guild.id)) message.client.search.set(message.guild.id, []);
  if (!message.client.queue.has(message.guild.id)) message.client.queue.set(message.guild.id, []);
  if (!isSameChannel(message)) return;

  info('Check song if it on search list ...');
  const song = message.client.search.get(message.guild.id)[id-1];

  if (!song) return false;
  info('Add song to queue ...');
  message.client.queue.get(message.guild.id).push(song);

  message.channel.send(
    new RichEmbed()
      .setTitle(`:musical_note: Menambahkan lagu "${song.title} - ${song.artist}" ke queue`)
      .setFooter(`Ditambahkan oleh ${song.user.username}`, song.user.displayAvatarURL)
  );

  return message.member.voiceChannel.join()
    .then(() => {
      info('Awaiting to stream ...');
      stream(message);
    })
    .catch(err => error('Couldn\'t join to voice channel.', err));
};