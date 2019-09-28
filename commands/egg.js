const discordUtils = require('../utils/discordUtils');
const Jimp = require('jimp');
const fs = require('fs');

module.exports = {
  name: 'egg',
  desc: 'Duck pooping out an egg',
  commandType: 'special',
  category: 'imgen',
  async execute(message, args, client) {
    let m = await message.channel.send('Processing imgen...');
    try {
      const avatars = discordUtils.getAvatars(message, client);
      let egg = await Jimp.read(avatars.target);
      let base = await Jimp.read('https://raw.githubusercontent.com/fu-snail/Arcane-Vortex/master/resources/images/memes/egg.bmp');
      let outputName = 'egg.png';

      egg.resize(50, 50);
      await base
        .resize(350, 350)
        .composite(egg, 143, 188)
        .write(outputName);

      await message.channel.send('', { file: outputName });
      await m.delete();
      return fs.unlinkSync(outputName);
    } catch (err) {
      console.log(`ERROR: Command <egg> failed.\n\tMessage: [${message}]\n\tError: [${err}]`);
      await m.edit('Sorry, there was an error.');
    }
  }
}