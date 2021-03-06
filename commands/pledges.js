const esoService = require('../services/esoService');
const eu = require('../utils/embedUtils');

module.exports = {
  name: 'pledges',
  desc: 'Gets the daily pledges.',
  commandType: 'general',
  async execute(message, args, client) {
    let m = '';
    try {
      m = await message.channel.send('Grabbing pledges from Dwemer Automaton...');
      let dailies = await esoService.getPledges();
      let embed = eu.createPledges(dailies);
      await message.channel.send(embed);
    } catch (err) {
      console.log(`ERROR: Command <pledges> failed.\n\tMessage: [${message}]\n\tError: [${err}]`);
    }
    return m.delete();
  }
}