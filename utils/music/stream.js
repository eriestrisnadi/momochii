const { Message, RichEmbed } = require('discord.js');
const { info, error } = require('winston');
const getInfo = require('./info');
const duration = require('../duration');
const rmMsg = require('../removeMessage');

const stream = (message = new Message) => {
  const conn = message.client.voiceConnections.get(message.guild.id);
  const queue = message.client.queue.get(message.guild.id);
  
  if (!conn) return;
  if (conn.dispatcher) return;
  if (queue.length === 0) {
    message.channel.send(
      new RichEmbed()
        .setTitle(':ballot_box_with_check: Berhasil memutar semua lagu.')
        .setDescription('Meninggalkan voice channel ...')
    )
    
    return message.member.voiceChannel.leave();
  }

  const song = queue[0];

  info('Add song to prequeue ...');
  if (!message.client.prequeue.has(message.guild.id)) message.client.prequeue.set(message.guild.id, []);
  message.client.prequeue.get(message.guild.id).push(song);

  info('Requesting song info ...');
  getInfo(song.songid)
    .then(res => {
      info(`${res.status} ${res.statusText}`);
      const source = res.data;
      let msgid;

      message.channel.send(
        new RichEmbed()
          .setTitle(`:arrow_forward: Memutar lagu "${song.title} - ${song.artist}"`)
          .setFooter(
            `Ditambahkan oleh ${song.user.username} | Durasi ${duration(source.minterval)}`,
            song.user.displayAvatarURL
          )
      )
        .then(msg => {
          msgid = msg.id;
        });

      info('Streams the song ...');
      const dispatcher = conn.playArbitraryInput(source.mp3Url);

      dispatcher.on('end', () => {
        info('Streaming has been ended ...');

        rmMsg(message, msgid);

        info('Deleting last played from queue ...');
        queue.shift();
        message.client.queue.set(message.guild.id, queue);

        info('Checking if queue is empty ...');
        if (queue.length === 0) {
          if (!message.client.repeat.has(message.guild.id)) message.client.repeat.set(message.guild.id, false);
          if (message.client.repeat.get(message.guild.id) === true) message.client.queue.set(
            message.guild.id,
            message.client.prequeue.get(message.guild.id)
          );
          
          message.client.prequeue.set(message.guild.id, []);
        }

        info('Awaiting to stream ...');
        stream(message);
      });
    })
    .catch(err => error('Couldn\'t retrieve data from endpoint.', err));
};

module.exports = stream;