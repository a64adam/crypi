const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
const logger = require('../../util/Logger');

const tag = 'EmptyCommand';

const dayToSeconds = 86400;
const hourToSeconds = 3600;
const minuteToSeconds = 60;


class EmptyCommand extends BaseCommand {

    constructor(msg) {
        super(msg);
    }

    run(options = {}) {
        if (options.reaction) {
            return;
        }

        logger.info(`${logger.createTag(tag, this.msg.id)} Executing command.`);

        let embed = new Discord.RichEmbed()
            .setTitle('Crypi')
            .setDescription(`Hi! I'm a friendly **Cryptocurrency** bot that provides **prices** and **conversions**.`)
            .setColor(Constants.EmbedOptions.color)
            .addField('Info:', '**Developer**: `koeden#8125`\n**Homepage**: **[github.com/a64adam/crypi](https://github.com/a64adam/crypi)**', true);

        this._appendBotStats(embed);

        logger.info(`${logger.createTag(tag, this.msg.id)} Completed command.`);
        this.msg.channel.send(embed);
    }

    _appendBotStats(embed) {
        let numServers = this.msg.client.guilds.size;
        let uptime = this.msg.client.uptime;

        embed.addField('Stats:', `**Servers**: \`${numServers}\`\n**Uptime**: \`${this._getFormattedUptime(uptime)}\``, true);
    }

    _getFormattedUptime(uptime) {
        let delta = uptime / 1000; // Get seconds
        let formattedUptime = '';

        let days = Math.floor(delta / dayToSeconds);
        delta -= days * dayToSeconds;
        if (days > 0) {
            formattedUptime += `${days}d `;
        }

        let hours = Math.floor(delta / hourToSeconds) % 24;
        delta -= hours * minuteToSeconds;
        if (hours > 0) {
            formattedUptime += `${hours}h `;
        }

        let minutes = Math.floor(delta / minuteToSeconds) % 60;
        delta -= minutes * minuteToSeconds;
        if (minutes > 0) {
            formattedUptime += `${minutes}m `;
        }

        let seconds = Math.floor(delta % 60);
        formattedUptime += `${seconds}s`;

        logger.info(`${logger.createTag(tag, this.msg.id)} Uptime: ${formattedUptime}`);
        return formattedUptime;
    }
}

module.exports = EmptyCommand;
