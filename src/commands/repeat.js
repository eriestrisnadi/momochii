import { RichEmbed } from 'discord.js';
import { color, symbol } from '../config';

export default (db, message) => {
  let playerRepeat = db.get('repeats').find({ guildid: message.guild.id });

  if (typeof playerRepeat.value() === 'undefined') {
    db.get('repeats').push({ guildid: message.guild.id, repeat: true }).write();
  }

  if (typeof playerRepeat.value() !== 'undefined' && !playerRepeat.value().repeat) {
    playerRepeat.assign({ repeat: true }).write();
  } else {
    playerRepeat.assign({ repeat: false }).write();
  }

  playerRepeat = db.get('repeats').find({ guildid: message.guild.id }).value();

  const embeded = new RichEmbed()
    .setColor(color)
    .setTitle(`Pengaturan putar ulang lagu di${(playerRepeat.repeat) ? 'aktifkan' : 'matikan'}`);

  return message.channel.send(embeded);
}