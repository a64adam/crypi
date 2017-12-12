const discord = require('discord.js');
const handler = require('./MessageHandler');
const auth = require('../auth.json');
const cds = require('../data/CoinDataSource');

const client = new discord.Client();

client.on('ready', () => {
    console.log(`Connected as ${client.user.tag}!`);

    console.log('Fetching symbols');
    cds.source.fetchSymbols();

    client.user.setPresence({
        status: 'online',
        game: {
            name: '!c commands'
        }
    });
});

client.on('message', msg => {
    let command = handler.parseCommand(msg);
    if (!command) {
        return;
    }

    command.run();
});

client.login(auth.token);
