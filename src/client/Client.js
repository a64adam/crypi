const Discord = require('discord.js');
const logger = require('../util/Logger');

const handler = require('./MessageHandler');
const auth = require('../../auth.json');
const repo = require('../data/CoinRepository');

const tag = '[Client]';

const client = new Discord.Client();

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

client.login(auth.token);
