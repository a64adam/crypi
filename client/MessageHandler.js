const BaseCommand = require('./command/BaseCommand');
const CoinDetailCommand = require('./command/CoinDetailCommand');
const CoinConvertCommand = require('./command/CoinConvertCommand');
const HelpCommand = require('./command/HelpCommand');
const repo = require('../data/CoinRepository');

class MessageHandler {

    /**
     * Determines the correct command to handle the msg, or null of no
     * command is needed.
     *
     * @param msg {Message}
     * @returns {BaseCommand|void}
     */
    static parseCommand(msg) {
        let content = msg.content;
        if (!(content.startsWith('!c') || content.startsWith('!crypi'))) {
            return;
        }

        console.log(`Parsing command ${content}`);

        let components = content.split(' ');
        let coinName = components[1];

        if (components[1] === 'commands') {
            console.log('Valid help command');

            // Help
            return new HelpCommand(msg);
        } else if (components[2] === 'to') {
            let toCoin = components[3];
            let amount = components[4];

            return new CoinConvertCommand(repo.coinRepo, msg, coinName, toCoin, amount);
        } else {
            console.log('Valid detail command');

            let options = components.slice(2);
            return new CoinDetailCommand(repo.coinRepo, msg, coinName, options);
        }
    }
}

module.exports = MessageHandler;