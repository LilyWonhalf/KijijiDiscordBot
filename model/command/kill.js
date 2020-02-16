const Logger = require('@elian-wonhalf/pretty-logger');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    process: async (message) => {
        const emoji = bot.emojis.find(emoji => emoji.name === 'hihi');

        await message.react(emoji);
        Logger.notice('killbotpls');
    }
};
