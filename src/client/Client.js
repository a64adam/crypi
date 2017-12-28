const Discord = require('discord.js');
const logger = require('../util/Logger');

const handler = require('./MessageHandler');
const auth = require('../../config/auth');
const repo = require('../data/CoinRepository');

const tag = '[Client]';

const client = new Discord.Client();

const onReaction = function(reaction, user) {
    if (reaction.message.author.id !== client.user.id) {
        return;
    }

    let channel = reaction.message.channel;
    channel.fetchMessages({limit: 5, before: reaction.message.id}).then((messages) => {
        let commandMessages = messages.filterArray((message) => {
            return handler.isValidMessage(message);
        });

        let command = handler.handleMessage(commandMessages[0]);
        if (command) command.run({ reaction: reaction });
    });
};

client.on('ready', () => {
    logger.info(`${tag} Connected as ${client.user.tag}!`);

    repo.coinRepo.buildCoinMaps();

    client.user.setPresence({
        status: 'online',
        game: {
            name: '!c commands'
        }
    }).then(() => {
        logger.info(`${tag} Successfully set presence.`);
    }).catch(() => {
        logger.warn(`${tag} Failed to set presence`);
    });
});

client.on('message', msg => {
    let command = handler.handleMessage(msg);
    if (!command) {
        return;
    }

    command.run();
});

client.on('messageReactionAdd', (reaction, user) => onReaction(reaction, user));
client.on('messageReactionRemove', (reaction, user) => onReaction(reaction, user));

client.login(auth.token);
