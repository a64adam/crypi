const BaseCommand = require('./command/BaseCommand');
const CoinDetailCommand = require('./command/CoinDetailCommand');
const CoinConvertCommand = require('./command/CoinConvertCommand');
const CommandsComand = require('./command/CommandsComand');
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

        console.log(`Parsing command ${msg.content}`);

        let trigger, command, args;
        [trigger, command, ...args] = msg.content.split(' ');

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

        if ('convert' === command) {
            let toSymbol, fromSymbol;
            let amount = 1.0;

            if (!isNaN(parseFloat(args[0])) && args.length >= 4) {
                // Command: <amount> <symbol> to <symbol>
                amount = parseFloat(args[0]);
                fromSymbol = args[1];
                toSymbol = args[3];
            } else if (args.length >= 3) {
                // Command: <symbol> to <symbol>
                fromSymbol = args[0];
                toSymbol = args[2];
            } else {
                // Invalid convert command
                console.log('Invalid convert command');
                return null;
            }

            return new CoinConvertCommand(repo.coinRepo, msg, fromSymbol, toSymbol, amount);
        } else if ('commands' === command) {
            // Commands command
            return new CommandsComand(msg);
        } else {
            // Coin details command, 'command' is the coin symbol
            return new CoinDetailCommand(repo.coinRepo, msg, command, args);
        }
    }
}

module.exports = MessageHandler;