const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');

class EmptyCommand extends BaseCommand {

    constructor(msg) {
        super(msg);
    }

    run() {
        let embed = new Discord.RichEmbed()
            .setTitle('Crypi')
            .setDescription(`Hi! I'm a friendly **Cryptocurrency** bot that provides **prices** and **conversions**.`)
            .setColor(Constants.EmbedOptions.color)
            .addField('Info:', '**Developer**: `koeden#8125`\n**Homepage**: **[github.com/a64adam/crypi](https://github.com/a64adam/crypi)**', true);

        this._appendBotStats(embed);

        this.msg.channel.send(embed);
    }

    _appendBotStats(embed) {
        let numServers = this.msg.client.guilds.size;
        embed.addField('Stats:', `**Servers**: ${numServers}`, true);
    }
}

module.exports = EmptyCommand;
