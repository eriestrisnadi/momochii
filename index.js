const fs = require('fs');
const { Client, Collection } = require('discord.js');
const { info, error } = require('winston');
const { prefix, token } = require('./config.json');

const client = new Client();
client.commands = new Collection();
client.queue = new Collection();
client.prequeue = new Collection();
client.repeat = new Collection();
client.search = new Collection();
client.moods = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('guildCreate', guild => {
  client.queue.set(guild.id, []);
  client.prequeue.set(guild.id, []);
  client.repeat.set(guild.id, []);
  client.search.set(guild.id, []);
  client.moods.set(guild.id, []);
  
  info(`New guild added : ${guild.name}, owned by ${guild.owner.user.username}`);
});

client.on('ready', () => {
  info('Connected');
  info('Logged in as: ');
  info(`${client.user.username} - ( ${client.user.id} )`);
});

client.on('message', message => {
  if (!message.guild) return;
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(message, args);
  }
  catch (err) {
    error('Couldn\'t execute the command', err);
    message.reply('Terjadi kesalahan saat menjalankan perintah tersebut!');
  }
});

client.login(token);