const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['setavatar'],
    process: async (message, args) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            Logger.info('Trying to set avatar to ' + args.join(' '));

            global.bot.user.setAvatar(args.join(' ')).then(() => {
                message.reply('mon avatar a été changé !')
            }).catch((error) => {
                message.reply('il y a eu une erreur durant le changement de mon avatar. Demandez à Lily de regarder !\nAu pire, voici l\'erreur : \n' + error.message());
                Logger.exception(error);
            });
        }
    }
};
