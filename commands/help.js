const { RichEmbed } = require('discord.js');
const { color, symbol } = require('../config');

module.exports = function (message) {
  const embeded = new RichEmbed()
    .setColor(color)
    .setTitle('Perintah yang didukung oleh bot ini:')
    .addField(`${symbol}help`, 'Menampilkan halaman ini.')
    .addField(`${symbol}play <nama lagu/penyanyi>`, `Memutar / mencari lagu.`)
    .addField(`${symbol}skip`, 'Melewati lagu yang sekarang sedang diputar.')
    .addField(`${symbol}queue`, 'Menampilkan daftar lagu yang akan diputar.')
    .addField(`${symbol}leave`, 'Memerintahkan bot untuk keluar dari voice channel.');

  return message.channel.send(embeded);
}