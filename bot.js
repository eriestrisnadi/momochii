'use strict';

var _discord = require('discord.js');

var _winston = require('winston');

var _lowdb = require('lowdb');

var _lowdb2 = _interopRequireDefault(_lowdb);

var _Memory = require('lowdb/adapters/Memory');

var _Memory2 = _interopRequireDefault(_Memory);

var _config = require('./config');

var _utils = require('./utils');

var _play = require('./commands/play');

var _play2 = _interopRequireDefault(_play);

var _skip = require('./commands/skip');

var _skip2 = _interopRequireDefault(_skip);

var _queue = require('./commands/queue');

var _queue2 = _interopRequireDefault(_queue);

var _search = require('./commands/search');

var _search2 = _interopRequireDefault(_search);

var _repeat = require('./commands/repeat');

var _repeat2 = _interopRequireDefault(_repeat);

var _remove = require('./commands/remove');

var _remove2 = _interopRequireDefault(_remove);

var _help = require('./commands/help');

var _help2 = _interopRequireDefault(_help);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = new _discord.Client();

var db = (0, _lowdb2.default)(new _Memory2.default());
db.defaults({ queue: [], search: [], repeats: [] }).write();


client.login(_config.token);

client.on('ready', function () {
  (0, _winston.info)('Connected');
  (0, _winston.info)('Logged in as: ');
  (0, _winston.info)(client.user.username + ' - ( ' + client.user.id + ' )');
});

client.on('message', function (message) {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;

  if (db.get('search').filter({ guildid: message.guild.id }).value().length !== 0 && !isNaN(parseInt(message.content)) && message.member.voiceChannel) {
    var selected = db.get('search').find({ id: parseInt(message.content), guildid: message.guild.id });
    if (selected) {
      if (message.member.voiceChannel) {
        message.member.voiceChannel.join().then(function (conn) {
          db.get('queue').push(selected.value()).write();

          (0, _utils._handlerSearch)(db, conn, message, selected.value().songid);
          db.get('search').remove({ guildid: message.guild.id }).write();
        }).catch(_winston.info);
      }
    }
  }

  if (message.content.split(' ').length !== 0 && message.content.split(' ')[0] == _config.symbol) {
    var args = message.content.split(' ');
    var cmd = args[1];

    args = args.splice(2);
    switch (cmd) {
      case 'play':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join().then(function (conn) {
            (0, _play2.default)(db, message, conn, args.join(' '));
          }).catch(_winston.info);
        }
        break;

      case 'skip':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join().then(function (conn) {
            (0, _skip2.default)(db, message, conn);
          }).catch(_winston.info);
        }
        break;

      case 'queue':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join().then(function (conn) {
            (0, _queue2.default)(db, message);
          }).catch(_winston.info);
        }
        break;

      case 'search':
        (0, _search2.default)(db, message, args.join(' '));
        break;

      case 'repeat':
        (0, _repeat2.default)(db, message);
        break;

      case 'remove':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join().then(function (conn) {
            (0, _remove2.default)(db, message, conn, args.join(' '));
          }).catch(_winston.info);
        }
        break;

      case 'leave':
        if (message.member.voiceChannel) {
          message.member.voiceChannel.join().then(function (conn) {
            message.member.voiceChannel.leave();
            db.get('queue').remove({ guildid: message.guild.id }).write();
            db.get('search').remove({ guildid: message.guild.id }).write();
          }).catch(_winston.info);
        }
        break;

      case 'help':
        (0, _help2.default)(message);
        break;
    }
  }
});
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _discord = require('discord.js');

var _config = require('../config');

exports.default = function (message) {
  var embeded = new _discord.RichEmbed().setColor(_config.color).setTitle('Perintah yang didukung oleh bot ini:').addField(_config.symbol + ' help', 'Menampilkan halaman ini.').addField(_config.symbol + ' play <nama lagu/penyanyi>', 'Memutar lagu berdasarkan kata kunci yang diberikan.').addField(_config.symbol + ' search <nama lagu/penyanyi>', 'Mencari lagu dan memberikan kamu pilihan lagu mana yang akan ditambahkan ke dalam daftar pemutar.').addField(_config.symbol + ' skip', 'Melewati lagu yang sekarang sedang diputar.').addField(_config.symbol + ' queue', 'Menampilkan daftar lagu yang akan diputar.').addField(_config.symbol + ' leave', 'Memerintahkan bot untuk keluar dari voice channel.');

  return message.channel.send(embeded);
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _utils = require('../utils');

var _config = require('../config');

exports.default = function (db, message, conn, keyword) {
  (0, _axios.get)(_config.baseJooxUrl + 'web_search', {
    params: {
      country: "id",
      lang: "en",
      search_input: keyword,
      sin: 0,
      ein: 30
    }
  }).then(function (res) {
    var _first = res.data.itemlist[0];

    if (_first) {
      db.get('queue').push({
        songid: _first.songid,
        title: Buffer.from(_first.info1, 'base64').toString('ascii'),
        artist: Buffer.from(_first.info2, 'base64').toString('ascii'),
        guildid: message.guild.id
      }).write();

      (0, _utils._handlerSearch)(db, conn, message, _first.songid);
    }
  }).catch(console.log);
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _discord = require('discord.js');

var _config = require('../config');

exports.default = function (db, message) {
  if (db.get('queue').filter({ guildid: message.guild.id }).value().length === 0) {
    var embeded = new _discord.RichEmbed().setColor(_config.color).setDescription('Tidak ada lagu yang diputar saat ini.');

    return message.channel.send(embeded);
  } else {
    var queue = db.get('queue').filter({ guildid: message.guild.id }).value().map(function (o, i) {
      var id = i + 1;
      return { name: id + '. ' + o.title + ' - ' + o.artist, value: 'Durasi: ' + o.duration };
    });

    return message.channel.send(new _discord.RichEmbed({
      fields: queue
    }).setColor(_config.color).setTitle('Daftar lagu yang akan diputar:'));
  }
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _discord = require('discord.js');

var _config = require('../config');

var _skip = require('./skip');

var _skip2 = _interopRequireDefault(_skip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (db, message, conn, args) {
  var id = parseInt(args);
  if (!isNaN(id)) {
    if (id - 1 > 0) {
      var queue = db.get('queue').filter({ guildid: message.guild.id });

      if (queue.value().length !== 0 && queue.value()[id - 1]) {
        var song = queue.value()[id - 1];
        db.get('queue').splice(id - 1, 1).write();

        var embeded = new _discord.RichEmbed().setColor(_config.color).setTitle(song.title + ' - ' + song.artist + ' telah dihapus dari daftar pemutar.');

        return message.channel.send(embeded);
      }
    } else {
      (0, _skip2.default)(db, message, conn);
    }
  }
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _discord = require('discord.js');

var _config = require('../config');

exports.default = function (db, message) {
  var playerRepeat = db.get('repeats').find({ guildid: message.guild.id });

  if (typeof playerRepeat.value() === 'undefined') {
    db.get('repeats').push({ guildid: message.guild.id, repeat: true }).write();
  }

  if (typeof playerRepeat.value() !== 'undefined' && !playerRepeat.value().repeat) {
    playerRepeat.assign({ repeat: true }).write();
  } else {
    playerRepeat.assign({ repeat: false }).write();
  }

  playerRepeat = db.get('repeats').find({ guildid: message.guild.id }).value();

  var embeded = new _discord.RichEmbed().setColor(_config.color).setTitle('Pengaturan putar ulang lagu di' + (playerRepeat.repeat ? 'aktifkan' : 'matikan'));

  return message.channel.send(embeded);
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _axios = require('axios');

var _discord = require('discord.js');

var _config = require('../config');

var _moment = require('moment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (db, message, keyword) {

  (0, _axios.get)(_config.baseJooxUrl + 'web_search', {
    params: {
      country: "id",
      lang: "en",
      search_input: keyword,
      sin: 0,
      ein: 5
    }
  }).then(function (res) {
    db.get('search').remove({ guildid: message.guild.id }).write();
    var queue = res.data.itemlist.map(function (o, i) {
      var id = i + 1;
      var data = {
        id: id,
        songid: o.songid,
        title: Buffer.from(o.info1, 'base64').toString('ascii'),
        artist: Buffer.from(o.info2, 'base64').toString('ascii'),
        duration: (0, _moment.utc)(o.playtime * 1000).format('mm:ss'),
        guildid: message.guild.id
      };
      db.get('search').push(data).write();

      return { name: id + '. ' + data.title + ' - ' + data.artist, value: 'Durasi: ' + data.duration };
    });

    return message.channel.send(new _discord.RichEmbed({
      fields: queue
    }).setColor(_config.color).setTitle('Hasil pencarian:'));
  }).catch(console.log);
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _discord = require('discord.js');

var _config = require('../config');

exports.default = function (db, message, conn) {
  if (conn.dispatcher) {
    if (db.get('queue').filter({ guildid: message.guild.id }).value().length !== 0) {
      var current = db.get('queue').filter({ guildid: message.guild.id }).value()[0];
      var embeded = new _discord.RichEmbed().setTitle(current.title + ' - ' + current.artist).setDescription('Dilewati').setColor(_config.color);

      message.channel.send(embeded);
      conn.dispatcher.end();
    }
  }
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var token = exports.token = 'NDU3MzMxODM2NzkyODY0Nzc4.DlQZpQ.tKJuNSHoNdLzI2_TGThv3Z9aqdA';
var symbol = exports.symbol = 'momo';
var color = exports.color = [9, 222, 101];
var baseJooxUrl = exports.baseJooxUrl = 'http://api-jooxtt.sanook.com/web-fcgi-bin/';
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._handlerSearch = exports._stream = undefined;

var _discord = require('discord.js');

var _axios = require('axios');

var _moment = require('moment');

var _config = require('./config');

var _stream = function _stream(db, conn, message) {
  if (db.get('queue').value().length !== 0) {
    var item = db.get('queue').filter({ guildid: message.guild.id }).value()[0];
    var embeded = new _discord.RichEmbed().setColor(_config.color).setTitle(':musical_note: Memutar lagu "' + item.title + ' - ' + item.artist + '"').setDescription('Durasi: ' + item.duration).setThumbnail(item.thumbnail);

    message.channel.send(embeded);

    var dispatcher = conn.playArbitraryInput(item.arbitary);

    var playerRepeat = db.get('repeats').find({ guildid: message.guild.id }).value();
    if (typeof playerRepeat !== 'undefined' && playerRepeat.repeat === true) {
      db.get('queue').push(item).write();
    }

    dispatcher.on('end', function (end) {
      db.get('queue').remove({ songid: item.songid, guildid: item.guildid }).write();

      _stream(db, conn, message);
    });

    return dispatcher;
  } else {
    var _embeded = new _discord.RichEmbed().setColor(_config.color).setTitle('Berhasil memutar semua lagu').setDescription('Meninggalkan channel ...');

    message.channel.send(_embeded);
    return message.member.voiceChannel.leave();
  }
};

var _handlerSearch = function _handlerSearch(db, conn, message, songid) {
  (0, _axios.get)(_config.baseJooxUrl + 'web_get_songinfo', {
    params: {
      country: "id",
      lang: "en",
      songid: songid
    }
  }).then(function (res) {
    db.get('queue').find({ songid: songid, guildid: message.guild.id }).assign({ arbitary: res.data.r320Url, thumbnail: res.data.imgSrc, duration: (0, _moment.utc)(res.data.minterval * 1000).format('mm:ss') }).write();

    var current = db.get('queue').find({ songid: songid, guildid: message.guild.id }).value();
    var embeded = new _discord.RichEmbed().setColor(_config.color).setTitle('Menambahkan "' + current.title + ' - ' + current.artist + '" ke daftar lagu.').setDescription('Durasi ' + current.duration).setThumbnail(current.thumbnail);

    message.channel.send(embeded);

    if (typeof conn.dispatcher === 'undefined') {
      _stream(db, conn, message);
    }
  }).catch(console.log);
};

exports._stream = _stream;
exports._handlerSearch = _handlerSearch;
