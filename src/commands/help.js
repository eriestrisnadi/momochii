import { RichEmbed } from 'discord.js';
import { color, symbol } from '../config';

export default (message) => {
  const embeded = new RichEmbed()
    .setColor(color)
    .setTitle('Perintah yang didukung oleh bot ini:')
    .addField(`${symbol} help`, 'Menampilkan halaman ini.')
    .addField(`${symbol} play <nama lagu/penyanyi>`, `Memutar lagu berdasarkan kata kunci yang diberikan.`)
    .addField(`${symbol} search <nama lagu/penyanyi>`, `Mencari lagu dan memberikan kamu pilihan lagu mana yang akan ditambahkan ke dalam daftar pemutar.`)
    .addField(`${symbol} skip`, 'Melewati lagu yang sekarang sedang diputar.')
    .addField(`${symbol} queue`, 'Menampilkan daftar lagu yang akan diputar.')
    .addField(`${symbol} leave`, 'Memerintahkan bot untuk keluar dari voice channel.');

  return message.channel.send(embeded);
}