const discord = require('discord.js');
const BaseCommand = require('./BaseCommand');

class HelpCommand extends BaseCommand {

    constructor(msg) {
        super(msg);
    }

    run() {
        let embed = new discord.RichEmbed()
            .setTitle('Crypi Commands')
            .setDescription('All commands available are:')
            .addField('!crypi <symbol> [options]', 'Information about the provided symbol\n\n**Options**\n*change*: Price change information\n*volume*: Volume information');
            // .addField('!crypi <symbol> to <symbol> <amount>', 'Converts the first symbol to the second symbol for the specified amount. Defaults to 1.');

        this.msg.channel.send(embed);
    }
}

module.exports = HelpCommand;