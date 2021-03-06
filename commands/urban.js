const ds = require('../services/definitionService');

module.exports = {
  name: 'urban',
  desc: 'Random UD definition. Moderately NSFW.',
  args: true,
  usage: '<query>',
  commandType: 'general',
  async execute(message, args, client) {
    try {
      const word = args.join(' ');
      const defObject = await ds.getUrbanDefinition(word);
      let definition;
      if (!defObject || defObject.error) {
        definition = `Either UrbanDictionary didn't have the term \`${word}\` or you're just looking up some strange things, my friend.`;
      } else {
        definition = defObject;
      }
      message.channel.send(`${definition}`);
    } catch (err) {
      console.log(`ERROR: Command <urban> failed.\n\tMessage: [${message}]\n\tError: [${err}]`);
    }
  }
}