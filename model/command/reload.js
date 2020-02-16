const Logger = require('@elian-wonhalf/pretty-logger');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['reboot'],
    process: async (message) => {
        await message.reply('Ok, je reboote !');
        Logger.notice('Reboot asked');
    }
};
