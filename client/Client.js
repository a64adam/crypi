const discord = require('discord.js');
const handler = require('./MessageHandler');
const auth = require('../auth.json');
const repo = require('../data/CoinRepository');

const client = new discord.Client();

client.on('ready', () => {
    console.log(`Connected as ${client.user.tag}!`);

    console.log('Fetching symbols');
    repo.coinRepo.buildCoinMaps();

    client.user.setPresence({
        status: 'online',
        game: {
            name: '!c commands'
        }
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
