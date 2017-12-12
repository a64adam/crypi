const BaseCommand = require('./command/BaseCommand');
const CoinDetailCommand = require('./command/CoinDetailCommand');
const HelpCommand = require('./command/HelpCommand');
const cds = require('../data/CoinDataSource');

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
            // TODO: Comparison operation
            return;
        } else {
            console.log('Valid detail command');

            let options = components.slice(2);
            return new CoinDetailCommand(msg, coinName, options, cds.source);
        }
    }
}

module.exports = MessageHandler;