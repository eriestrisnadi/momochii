const { Message, RichEmbed } = require('discord.js');
const { info, error } = require('winston');
const search = require('../utils/music/search');
const stream = require('../utils/music/stream');
const isSameChannel = require('../utils/isSameChannel');

module.exports = {
  name: 'play',
  description: 'Memainkan lagu berdasarkan keyword yang diberikan.',
  execute(message = new Message, args) {
    if (message.client.queue) {

      if (!isSameChannel(message)) return;

      if (!message.client.queue.has(message.guild.id)) message.client.queue.set(message.guild.id, []);

      const keyword = args.join();

      info('Requesting to search a song ...');
      search(keyword)
        .then(res => {
          info(`${res.status} ${res.statusText}`);
          const item = res.data.itemlist[0];

          if (!item) return message.channel.send('Lagu tidak ditemukan, coba kata kunci lain.');

          info('Add song to queue ...');
          const song = {
            songid: item.songid,
            title: Buffer.from(item.info1, 'base64').toString('ascii'),
            artist: Buffer.from(item.info2, 'base64').toString('ascii'),
            user: message.author
          };

          message.client.queue.get(message.guild.id).push(song);

          message.channel.send(
            new RichEmbed()
              .setTitle(`:musical_note: Menambahkan lagu "${song.title} - ${song.artist}" ke queue`)
              .setFooter(`Ditambahkan oleh ${song.user.username}`, song.user.displayAvatarURL)
          );

          message.member.voiceChannel.join()
            .then(() => {
              info('Awaiting to stream ...');
              stream(message);
            })
            .catch(err => error('Couldn\'t join to voice channel.', err));
        })
        .catch(err => error('Couldn\'t retrieve data from endpoint', err));
    }
  },
};