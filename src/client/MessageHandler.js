const BaseCommand = require('./command/BaseCommand');
const CoinDetailCommand = require('./command/CoinDetailCommand');
const CoinConvertCommand = require('./command/CoinConvertCommand');
const CommandsCommand = require('./command/CommandsComand');
const HelpCommand = require('./command/HelpCommand');
const EmptyCommand = require('./command/EmptyCommand');
const logger = require('../util/Logger');
const repo = require('../data/CoinRepository');

const tag = 'MessageHandler';
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
        if (msg.author.id !== msg.client.user.id && msg.author.bot) {
            // Ignore bot messages. Sorry, no bot-to-bot communication
            return;
        }

        if (!this.isValidMessage(msg)) {
            return;
        }

        let content = msg.content.toLowerCase();
        let trigger, command, args;
        [trigger, command, ...args] = content.split(' ');

        logger.info(`${logger.createTag(tag, msg.id)} Parsing message, [trigger: ${trigger}, command: ${command}, args: ${args}]`);

        if (!command || 'info' === command) {
            return new EmptyCommand(msg);
        } else if ('convert' === command) {
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
                return null;
            }

            return new CoinConvertCommand(repo.coinRepo, msg, fromSymbol, toSymbol, amount);
        } else if ('commands' === command || 'command' === command) {
            // Commands command
            return new CommandsCommand(msg);
        } else if ('help' === command) {
            return new HelpCommand(msg);
        } else {
            // Coin details command, 'command' is the coin symbol
            return new CoinDetailCommand(repo.coinRepo, msg, command);
        }
    }

    static isValidMessage(msg) {
        let trigger, ignore;
        [trigger, ...ignore] = msg.content.split(' ');

        // Bot was mentioned
        if (msg.isMentioned(msg.client.user)) {
            // Only handle if the first component was the mention
            let userId = msg.client.user.id;

            if (!(trigger.length > userId.length && trigger.substring(2, trigger.length - 1) === userId)) {
                logger.verbose(`${logger.createTag(tag, msg.id)} Ignoring bot @mention. Not used as trigger.`);
                return false;
            }
        } else if (!prefixes.includes(trigger)) {
            logger.verbose(`${logger.createTag(tag, msg.id)} Message does not contain valid trigger, ignoring.`);
            return false;
        }

        return true;
    }
}

module.exports = MessageHandler;