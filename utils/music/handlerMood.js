const { Message, RichEmbed } = require('discord.js');
const { info, error } = require('winston');
const stream = require('./stream');
const getInfo = require('./recommendInfo');

module.exports = (message = new Message) => {
  const id = parseInt(message.content);
  if (isNaN(id) || !message.client.moods || !message.client.queue || !message.member.voiceChannel) return false;
  if (!message.client.moods.has(message.guild.id)) message.client.moods.set(message.guild.id, []);
  if (!message.client.queue.has(message.guild.id)) message.client.queue.set(message.guild.id, []);

  info('Check playlist if it on moods ...');
  const mood = message.client.moods.get(message.guild.id)[id - 1];

  if (!mood) return false;
  info('Request songs playlist ...');
  return getInfo(mood.moodid)
    .then(res => {
      info('Adding playlist songs to queue ...');
      res.data.songlist.map(item => {
        const song = {
          songid: item.songid,
          title: Buffer.from(item.name, 'base64').toString('ascii'),
          artist: Buffer.from(item.artist, 'base64').toString('ascii'),
          user: mood.user
        };

        message.client.queue.get(message.guild.id).push(song);

        return item;
      });

      message.channel.send(
        new RichEmbed()
          .setTitle(`:musical_note: Menambahkan playlist "${mood.title}" ke queue`)
          .setFooter(`Ditambahkan oleh ${mood.user.username}`, mood.user.displayAvatarURL)
      );

      return message.member.voiceChannel.join()
        .then(() => {
          info('Awaiting to stream ...');
          stream(message);
        })
        .catch(err => error('Couldn\'t join to voice channel.', err));
    })
    .catch(err => error('Couldn\'t retrieve data from endpoint', err));
};