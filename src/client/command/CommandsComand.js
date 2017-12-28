const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
const logger = require('../../util/Logger');

const tag = 'CommandsCommand';


class CommandsCommand extends BaseCommand {

    constructor(msg) {
        super(msg);
    }

    run(options = {}) {
        logger.info(`${logger.createTag(tag, this.msg.id)} Executing command.`);

        let embed = new Discord.RichEmbed()
            .setTitle('Crypi Commands')
            .setColor(Constants.EmbedOptions.color)
            .setDescription('All available are listed below. **[]** indicates optional fields.')
            .addField('!crypi <symbol>', 'Price information about the provided symbol')
            .addField('!crypi convert [amount] <symbol> to <symbol>', 'Converts the first symbol to the second symbol. Amount defaults to 1.0.')

        logger.info(`${logger.createTag(tag, this.msg.id)} Completed command.`);
        this.msg.channel.send(embed);
    }
}

module.exports = CommandsCommand;