const BaseCommand = require('./command/BaseCommand');
const CoinDetailCommand = require('./command/CoinDetailCommand');
const CoinConvertCommand = require('./command/CoinConvertCommand');
const HelpCommand = require('./command/HelpCommand');
const repo = require('../data/CoinRepository');

const prefixes = ['!c', '!crypi'];

class MessageHandler {

    /**
     * Determines the correct command to handle the msg, or null of no
     * command is needed.
     *
     * @param msg {Message}
     * @returns {BaseCommand|void}
     */
    static handleMessage(msg) {
        if (msg.author.bot) {
            // Ignore bot messages. Sorry, no bot-to-bot communication
            console.log('Ignoring bot message');
            return;
        }

        // Split the message
        let content = msg.content;
        let components = content.split(' ');

        console.log(`Parsing command ${content}`);

        let trigger = components[0];

        // Bot was mentioned
        if (msg.isMentioned(msg.client.user)) {
            // Only handle if the first component was the mention
            let userId = msg.client.user.id;

            if (!(trigger.length > userId.length && trigger.substring(2, trigger.length - 1) === userId)) {
                console.log('Mentioned but not first part of command, ignoring.');
                return;
            }
        } else if (!prefixes.includes(trigger)) {
            console.log('Ignoring irrelevant message.');
            return;
        }

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