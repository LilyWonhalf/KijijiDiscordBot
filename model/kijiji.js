const fs = require('fs');
const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const kijiji = require('kijiji-scraper');
const Guild = require('./guild');
let data = require('../data.json');

const options = {
    minResults: 40
};

const params = {
    locationId: 1700281, // City of Montreal
    categoryId: 37, // Long term rentals
    sortByName: "dateDesc",
    maxPrice: 700
};

const updateData = () => {
    fs.writeFileSync('data.json', JSON.stringify(data));
};

/**
 * @param {kijiji.Ad} ad
 */
const adToEmbed = (ad) => {
    const embed = new Discord.RichEmbed();
    const attributes = {
        unittype: {text: 'Unit type', inline: false},
        furnished: {text: 'Furnished', inline: true},
        laundryinunit: {text: '🚪 Laundry', inline: true},
        laundryinbuilding: {text: '🏢 Laundry', inline: true},
        dishwasher: {text: 'Dishwasher', inline: true},
        fridgefreezer: {text: 'Fridge', inline: true},
        microwave: {text: 'Microwave', inline: true},
        airconditioning: {text: 'Air cond.', inline: true},
        hydro: {text: 'Hydro', inline: true},
        heat: {text: 'Heating', inline: true},
        water: {text: 'Water', inline: true},
        internet: {text: 'Internet', inline: true},
        price: {text: 'Price', inline: true}
    };
    const booleanAttributes = [
        'furnished',
        'laundryinunit',
        'laundryinbuilding',
        'dishwasher',
        'fridgefreezer',
        'microwave',
        'airconditioning',
        'hydro',
        'heat',
        'water',
        'internet'
    ];

    if (ad.description.length > 2048) {
        ad.description = ad.description.substr(0, 2045) + '...';
    }

    embed.setTitle(ad.title);
    embed.setDescription(ad.description);
    embed.setTimestamp(ad.date);

    if (ad.image !== null) {
        embed.setImage(ad.image);
    }

    for (let j = 0; j < Object.keys(attributes).length; j++) {
        const attributeKey = Object.keys(attributes)[j];
        let attribute = ad.attributes[attributeKey];

        if (booleanAttributes.includes(attributeKey)) {
            switch (attribute){
                case 1:
                    attribute = Guild.yesEmoji + ' Yes';
                    break;

                case 0:
                    attribute = Guild.noEmoji + ' No';
                    break;

                default:
                    attribute = '❓' + attribute;
            }
        }

        embed.addField(attributes[attributeKey].text, attribute, attributes[attributeKey].inline);
    }

    embed.addField('Location', ad.attributes.location.mapAddress);

    return embed;
};

const search = () => {
    Logger.info('Launching Kijiji search...');
    Guild.apartmentsChannel.startTyping();

    /**
     * @param {[kijiji.Ad]} ads
     */
    kijiji.search(params, options).then(async (ads) => {
        Logger.info('Found ' + ads.length + ' ads before filtering');

        ads = ads.filter(ad => {
            return !data.posted.includes(ad.url)
                && !data.blacklisted.includes(ad.title)
                && ad.attributes.price < 700
                && ad.attributes.price > 0
                && !ad.title.toLowerCase().includes('recherch');
        }).reverse();

        Logger.info('Found ' + ads.length + ' new ads');

        for (let i = 0; i < ads.length; i++) {
            const embed = adToEmbed(ads[i]);
            const message = await Guild.apartmentsChannel.send(ads[i].url, {embed});

            await message.react(Guild.yesEmoji);
            await message.react(Guild.noEmoji);

            data.posted.push(ads[i].url);
        }

        updateData();
        Guild.apartmentsChannel.stopTyping();
    }).catch(console.error);
};

/**
 * @param {MessageReaction} reaction
 */
const approve = async (reaction) => {
    await Guild.pinsChannel.send(reaction.message.embeds[0]);
};

/**
 * @param {MessageReaction} reaction
 */
const reject = async (reaction) => {
    data.blacklisted.push(reaction.message.embeds[0].title);
    updateData();
    await reaction.message.delete();
};

module.exports = {search, approve, reject};