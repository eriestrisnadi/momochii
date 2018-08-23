import { RichEmbed } from 'discord.js';
import { color } from '../config';

export default (db, message) => {
  let playerRepeat = db.get('repeats').find({ guildid: message.guild.id }).value();

  if (typeof playerRepeat === 'undefined') {
    db.get('repeats').push({ guildid: message.guild.id, repeat: false }).write();
  }

  playerRepeat = db.get('repeats').find({ guildid: message.guild.id }).value();

  if (typeof playerRepeat !== 'undefined' && playerRepeat.repeat) {
    db.get('repeats').find({ guildid: message.guild.id }).assign({ repeat: false }).write();
  } else {
    db.get('repeats').find({ guildid: message.guild.id }).assign({ repeat: true }).write();
  }

  playerRepeat = db.get('repeats').find({ guildid: message.guild.id }).value();

  const embeded = new RichEmbed()
    .setColor(color)
    .setTitle(`Pengaturan putar ulang lagu di${(playerRepeat.repeat) ? 'aktifkan' : 'matikan'}`);

  return message.channel.send(embeded);
}