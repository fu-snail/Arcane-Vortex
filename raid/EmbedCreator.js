let Discord = require('discord.js');
let _ = require('lodash');

let RaidInfo = require('./RaidInfo.json');
let logos = require('../resources/logos.json');
let DateHelper = require('../helpers/DateHelper');

function getRaidInfo(raidName) {
  raidName = raidName.toLowerCase();
  if (!RaidInfo[raidName]) {
    return new Error(`Raid \`${raidName}\` does not exist, you scrub.`);
  }
  return RaidInfo[raidName];
}

function createRoster(raid) {
  let comp = raid.comp;
  let roles = Object.keys(comp);
  let roster = {};
  roles.forEach((role) => {
    roster[role] = {
      'count': comp[role],
      'players': []
    }
  });
  return roster;
}

function createEmbed(day, time, title, roster) {
  let raid = getRaidInfo(title);
  let date = DateHelper.getNextDay(day);
  if (date instanceof Error) {
    return date;
  }
  let cpDisplay = '';
  raid.cp.forEach((setup) => {
    cpDisplay += `${setup.type}:\n ${JSON.stringify(setup.points)}\n`;
  });

  let embed = new Discord.RichEmbed()
    .setColor('#ff6600')
    .setTitle(`${DateHelper.getNextDay(day)} @ ${time} ${raid['short_name']}`)
    .setThumbnail(logos['2']);

  let roles = Object.keys(roster);
  roles.forEach((role) => {
    let results = '';
    let roleCount = roster[role].count;
    if (roleCount > 0) {
      for (let i = 0; i < roleCount; i++) {
        let player = '--';
        if (roster[role].players[i]) {
          player = roster[role].players[i];
        }
        results += `${player}\n`;
        // embed.addField(`${role.toUpperCase()}`, player, true);
      }
      embed.addField(role.toUpperCase(), results, true);
    }
  });
  embed.addField('CP', cpDisplay, true);
  return embed;
}

function createRoleEmbed(data, type) {
  let embed = new Discord.RichEmbed()
    .setColor('#ff6600')
    .setTitle(`Roles: ${type}`)
    .setThumbnail(logos['2']);

  if (type.toLowerCase() === 'all') {
    Object.keys(data).forEach((role) => {
      if (role !== '@everyone') {
        embed.addField(role, data[role].length > 0 ? data[role] : '--', true);
      }
    });
  } else if (type.toLowerCase() === 'count') {
    Object.keys(data).forEach((role) => {
      embed.addField(role, data[role], true);
    });
  } else {
    let results = '';
    Object.values(data).forEach((role) => {
      if (role !== '@everyone') {
        results += `${role}\n`;
      }
    });
    embed.addField('Roles', results, true);
  }

  return embed;
}

module.exports = {
  getRaidInfo,
  createRoster,
  createEmbed: createEmbed,
  createRoleEmbed: createRoleEmbed
}