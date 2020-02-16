const Kijiji = require('../../model/kijiji');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (reaction, user) => {
    const acceptedReactions = ['green_tick', 'red_x'];

    if (!user.bot && acceptedReactions.includes(reaction.emoji.name)) {
        reaction.emoji.name === 'green_tick' ? Kijiji.approve(reaction) : Kijiji.reject(reaction);
    }
};
