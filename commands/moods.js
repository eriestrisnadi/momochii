const { Message, RichEmbed } = require('discord.js');
const { info, error } = require('winston');
const { prefix } = require('../config.json');
const recommend = require('../utils/music/recommend');
const handler = require('../utils/music/handlerMood');
const rmMsg = require('../utils/removeMessage');

module.exports = {
  name: 'moods',
  description: 'Menampilkan beberapa kategori playlist yang bisa diputar.',
  execute(message = new Message) {
    if (message.client.moods) {
      if (!message.member.voiceChannel) return;
      if (!message.client.moods.has(message.guild.id)) message.client.moods.set(message.guild.id, []);

      info('Requesting to get moods playlist ...');
      recommend()
        .then(res => {
          info(`${res.status} ${res.statusText}`);
          const items = res.data.itemlist
            .map(a => [Math.random(), a])
            .sort((a, b) => a[0] - b[0])
            .map(a => a[1])
            .splice(85, res.data.itemlist.length - 1);

          if (items.length === 0) return message.channel.send('Tidak ada playlist saat ini.');

          info('Add playlist to moods ...');
          message.client.moods.set(message.guild.id, []);
          const moods = items.map((item, i) => {
            const mood = {
              moodid: item.id,
              title: Buffer.from(item.title, 'base64').toString('ascii'),
              tracks: item.track_count,
              user: message.author
            };
            message.client.moods.get(message.guild.id).push(mood);

            return { name: `${i + 1}. ${mood.title}`, value: `Jumlah lagu: ${mood.tracks}` };
          });

          message.channel.send(
            new RichEmbed({
              fields: moods
            })
              .setTitle(':notes: Kategori playlist yang tersedia:')
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
                    .setTitle(':warning: Gagal menambahkan playlist, index tidak ditemukan.')
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