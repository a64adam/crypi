const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
const logger = require('../../util/Logger');
const auth = require('../../../config/auth');

const tag = 'HelpCommand';
const inviteURL = `https://discordapp.com/api/oauth2/authorize?client_id=${auth.clientId}&permissions=2112&scope=bot`;


class HelpCommand extends BaseCommand {

    constructor(msg) {
        super(msg);
    }

    run(options = {}) {
        logger.info(`${logger.createTag(tag, this.msg.id)} Executing command.`);

        let inviteTitle = 'Invite';
        let inviteText = `Click **[here](${inviteURL})** to invite Crypi to **your** server!`;

        let commandsTitle = 'Commands';
        let commandsText = 'For a **full set of commands**, check out the **[homepage](https://github.com/a64adam/crypi)** or **!crypi commands**.';

        let helpTitle = 'Help';
        let helpText = 'If you need to **contact the developer**, **report a bug** or **suggest a feature**, feel free to submit an issue **[here](https://github.com/a64adam/crypi/issues)**.';

        let embed = new Discord.RichEmbed()
            .setTitle('Crypi')
            .setDescription('Here to help!')
            .setColor(Constants.EmbedOptions.color)
            .addField(inviteTitle, inviteText)
            .addField(commandsTitle, commandsText)
            .addField(helpTitle, helpText);

        logger.info(`${logger.createTag(tag, this.msg.id)} Completed command.`);
        this.msg.channel.send(embed);
    }
}

module.exports = HelpCommand;