/**
 * Get avatars from a message
 * 
 * @param {Object} message discord message object
 * @param {Object} client discord client object
 * 
 * @returns {Object} Object representing avatars for users
 */
const getAvatars = (message, client) => {
  let users = message.mentions.users.map((u) => {
    return u;
  });
  let avatars = {};
  if (users.length) {
    avatars.self = message.author.avatarURL;
    avatars.target = users[0].avatarURL;
  } else {
    avatars.self = client.user.avatarURL;
    avatars.target = message.author.avatarURL;
  }
  return avatars;
}

/**
 * Get usernames from a message
 * 
 * @param {Object} message discord message object
 * 
 * @returns {Object} Object representing usernames for users
 */
const getUsernames = (message) => {
  let users = message.mentions.users.map((u) => {
    return u;
  });
  const usernames = {};
  usernames.self = message.author.username;
  usernames.target = users.length ? users[0].username : null;
  return usernames;
}

/**
 * Deletes messages from a given channel
 * 
 * @param {Discord.client} client discord client
 * @param {Number} channelId channelId
 * @param {Number} limit number of messages to delete (max 100)
 */
const deleteMessages = async (client, channelId, limit) => {
  try {
    let channel = client.channels.get(channelId);
    const recentMessages = await channel.fetchMessages({ limit: limit });
    channel.bulkDelete(recentMessages).catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  } catch (err) {
    console.log(`Error in <deleteMessages>: channelId - ${channelId}\nMessage: ${err}`);
  }
}

module.exports = {
  getAvatars,
  getUsernames,
  deleteMessages
}