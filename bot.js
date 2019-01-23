let Discord = require('discord.js');

let translate = require('google-translate-api');
let logger = require('winston');

let auth = require('./auth.json');
let warrior = require('./resources/warrior-quotes.json');
let RaidHelper = require('./helpers/RaidHelper');
let languages = require('./translate/TranslateHelper');
let define = require('./define/define');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});

// Keeps track of the RaidEvent
var RaidEvent = undefined;

// testing some stuff here that will be refactored later
var roster = [];

// Initialize Discord Bot
const bot = new Discord.Client();

// Logs in with the given token
bot.login(auth.token);

bot.on('ready', () => {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.user.tag);
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`);
  bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
});

bot.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
});

bot.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
});

bot.on('message', async (message) => {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  const prefix = '!';

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop called 'botception'
  if (message.author.bot) {
    return;
  }

  if (!message.content.startsWith(prefix)) return;
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let command = args.shift().toLowerCase();

  if (command === 'help') {
    await message.channel.send('Git Gud');
  }

  if (command === 'ping') {
    const channelMessage = await message.channel.send('Ping?');
    channelMessage.edit(`Pong! Latency is ${channelMessage.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
  }

  if (command === 'whoami') {
    await message.channel.send(`User: ${message.author}`);
  }

  if (command === 'roles') {
    // assuming role.id is an actual ID of a valid role:
    let channel = message.channel;
    if (message.member.roles) {
      let results = {};
      message.member.roles.forEach((v, k) => {
        results[k] = v;
      });
      results = JSON.stringify(results, null, 2);
      await channel.send('```JSON' + `\n${results}\n` + '```');
    } else {
      await channel.send(`${message.author}, you have no roles`);
    }
  }

  if (command === 'react') {
    let m = await message.channel.send(`Pretend this is a roster for a run:\n ${roster.toString()}`);
    m.react('🇹');
    m.react('🇭');
    m.react('🇲');
    m.react('🇸');
    m.react('❌');
  }

  if (command === 'warrior') {
    let quotes = warrior.quotes;
    let length = quotes.length;
    let randomQuote = quotes[Math.floor(Math.random() * length)];
    bot.sendMessage({
      to: channelID,
      message: randomQuote
    })
  }

  if (command === 'raid') {
    // First argument
    let raidCommand = args[0];
    args.shift();
    if (raidCommand === 'create') {
      let [title, time] = args;
      let msg = 'Cannot create raid event. Required arguments: <title> <time>. Example: !raid create vMoL 730est';

      // Don't create if one exists
      if (RaidEvent !== undefined) {
        msg = `There is already an event: Raid ${RaidEvent.title} @ ${RaidEvent.time}.`
        // Only create if give a title and time
      } else if (title !== undefined || time !== undefined) {
        let newRoster = RaidHelper.createRoster();
        RaidEvent = RaidHelper.createRaid(title, time, newRoster);
        msg = RaidHelper.printRaid(RaidEvent, newRoster);
      }
      bot.sendMessage({
        to: channelID,
        message: msg
      })
    } else if (raidCommand === 'join') {
      let msg = 'No raid available';
      if (RaidEvent !== undefined) {
        let role = args[0];
        if (role === undefined) {
          msg = 'Need a role';
        } else {
          RaidEvent.roster.add(user, role);
          msg = RaidHelper.printRaid(RaidEvent, RaidEvent.roster);
        }
      }
      bot.sendMessage({
        to: channelID,
        message: msg
      })
    } else if (raidCommand === 'drop') {
      let msg = 'No raid available';
      if (RaidEvent !== undefined) {
        RaidEvent.roster.remove(user);
        msg = RaidHelper.printRaid(RaidEvent, RaidEvent.roster);
      }
      bot.sendMessage({
        to: channelID,
        message: msg
      })
    } else if (raidCommand === 'roster') {
      let msg = 'No raid available';
      if (RaidEvent !== undefined) {
        msg = RaidHelper.printRaid(RaidEvent, RaidEvent.roster);
      }
      bot.sendMessage({
        to: channelID,
        message: msg
      })
    } else if (raidCommand === 'delete') {
      let msg = 'No raid available';
      if (RaidEvent !== undefined) {
        msg = `Raid ${RaidEvent.title} @ ${RaidEvent.time} deleted`
        RaidEvent = undefined;
      }
      bot.sendMessage({
        to: channelID,
        message: msg
      })
    } else if (raidCommand === 'help') {
      bot.sendMessage({
        to: channelID,
        message: 'Available commands:\n- <create> [name] [time]\n- <join> [role]\n- <drop>\n- <roster>\n- <delete>'
      })
    }
  }

  if (command === 'translate') {
    // syntax: command targetLang text
    let targetLang = args[0]
    if (targetLang.toLowerCase() == 'chinese') {
      targetLang = 'chinese-simplified';
    }
    args.shift();
    let textToTranslate = args.join(' ');

    translate(textToTranslate, { to: languages.getCode(targetLang) }).then(res => {
      bot.sendMessage({
        to: channelID,
        message: res.text
      })
    }).catch(err => {
      console.error(err);
    });
  }

  if (command === 'define') {
    let word = args[0];
    let defObject = await define.getDefinition(word);
    let message;
    if (defObject.error) {
      message = `Error ${defObject.error}: ${defObject.errorMessage}`;
    } else {
      message = defObject.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0];
    }
    bot.sendMessage({
      to: channelID,
      message: JSON.stringify(message, null, 2)
    })
  }
});

bot.on('messageReactionAdd', async (reaction, user) => {
  let player = user.username;
  if (!user.bot) {

    if (!roster.includes(player) && reaction.emoji.name !== '❌') {
      roster.push(player);
    }

    if (reaction.emoji.name === '❌') {
      roster = roster.filter((name) => name !== player);
    }

    // TODO: Use this in conjunction with the RaidHelper
    await reaction.message.edit(`Pretend this is a roster for a run:\n ${roster.toString()}`); 
    // await bot.emit('messageReactionRemove', reaction, user);
  }
});

bot.on('messageReactionRemove', async (reaction, user) => {
  let player = user.username;
  if (!user.bot) {
    if (roster.includes(player)) {
      roster = roster.filter((name) => name !== player);
    }
    // TODO: Use this in conjunction with the RaidHelper
    await reaction.message.edit(`Pretend this is a roster for a run:\n ${roster.toString()}`); 
    // await bot.emit('messageReactionRemove', reaction, user);
  }
});