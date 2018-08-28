const { Message, RichEmbed } = require('discord.js');
const { info, error } = require('winston');
const { prefix } = require('../config.json');
const search = require('../utils/music/search');
const handler = require('../utils/music/handler');
const rmMsg = require('../utils/removeMessage');
const isSameChannel = require('../utils/isSameChannel');

module.exports = {
  name: 'search',
  description: 'Mencari lagu berdasarkan keyword yang diberikan.',
  execute(message = new Message, args) {
    if (message.client.search) {
      if (!message.member.voiceChannel) return;
      if (!message.client.search.has(message.guild.id)) message.client.search.set(message.guild.id, []);
      if (!isSameChannel(message)) return;

      const keyword = args.join();

      info('Requesting to search a song ...');
      search(keyword)
        .then(res => {
          info(`${res.status} ${res.statusText}`);
          const items = res.data.itemlist;

          if (items.length === 0) return message.channel.send('Lagu tidak ditemukan, coba kata kunci lain.');

          info('Add song to search results ...');
          message.client.search.set(message.guild.id, []);
          const songs = items.map((item, i) => {
            const song = {
              songid: item.songid,
              title: Buffer.from(item.info1, 'base64').toString('ascii'),
              artist: Buffer.from(item.info2, 'base64').toString('ascii'),
              user: message.author
            };
            message.client.search.get(message.guild.id).push(song);

            return `${i + 1}. ${song.title} - ${song.artist}\n`;
          });

          message.channel.send(
            new RichEmbed()
              .setTitle(`:mag_right: Hasil pencarian "${keyword}":`)
              .setDescription(songs.join(''))
              .setFooter(`Diminta oleh ${message.author.username}`, message.author.displayAvatarURL)
          )
            .then(m => {
              const collector = message.channel.createCollector(m => m);
              collector.on('collect', msg => {
                if (msg.content === `${prefix}cancel`) {
                  msg.channel.send(
                    new RichEmbed()
                      .setTitle(':ok: Perintah dibatalkan.')
                      .setFooter(`Diminta oleh ${msg.author.username}`, msg.author.displayAvatarURL)
                  );
                  rmMsg(message, m.id);
                  
                  return collector.stop();
                }

                if (isNaN(parseInt(msg.content)) || msg.author.bot) return;
                if (!handler(msg)) return msg.channel.send(
                  new RichEmbed()
                    .setTitle(':warning: Gagal menambahkan lagu, index tidak ditemukan.')
                    .setFooter(`Diminta oleh ${msg.author.username}`, msg.author.displayAvatarURL)
                );

                rmMsg(message, m.id);
                collector.stop();
              });
            })
            .catch(err => error('Couldn\'t send message to user.', err));
        })
        .catch(err => error('Couldn\'t retrieve data from endpoint', err));
    }
  },
};