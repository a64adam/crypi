const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
const Util = require('../../util/Util');
const logger = require('../../util/Logger');


const tag = 'ListCommand';
const blankIconName = 'blank';
const defaultLimit = 5;
const maxLimit = 20;

class ListCommand extends BaseCommand {

    constructor(dataSource, msg, limit) {
        super(msg);
        this.dataSource = dataSource;
        this.limit = Math.min((!isNaN(parseInt(limit))) ? limit : defaultLimit, maxLimit);
    }

    run() {
        logger.info(`${logger.createTag(tag, this.msg.id)} Executing command.`);

        this.dataSource.getOrderedCoins(this.limit).then((coins) => {
            let nameTitle = `Coin:`;
            let nameContent = ``;

            let priceTitle = `Price`;
            let priceContent = ``;

            let capTitle = `Market Cap`;
            let capContent = ``;

            let lastUpdated = coins[0].lastUpdated;

            let blankIcon = Util.iconForSymbol(this.msg.client, blankIconName);

            let idx = 1;
            for (let coin of coins) {
                let icon = Util.iconForSymbol(this.msg.client, coin.symbol);
                nameContent += `**[${idx++}]**: ${icon ? icon : ''} ${coin.name}\n\n`;
                priceContent += `$${coin.priceUSD} ${blankIcon}\n\n`;
                capContent += `$${Util.toMillionString(coin.marketCapUSD)} ${blankIcon}\n\n`;

                if (coin.lastUpdated < lastUpdated) {
                    lastUpdated = coin.lastUpdated;
                }
            }

            let embed = this._buildBaseResponse()
                .addField(nameTitle, nameContent, true)
                .addField(priceTitle, priceContent, true)
                .addField(capTitle, capContent, true)
                .setFooter(`Last updated: ${lastUpdated.toUTCString()}`);

            this.msg.channel.send(embed);

            logger.info(`${logger.createTag(tag, this.msg.id)} Completed Command`);
        }).catch((error) => {
            logger.error(`${logger.createTag(tag, this.msg.id)} Failed to complete command: ${error}`,);
            this.msg.channel.send(`Something went wrong fetching the list of coins :(`);
        });
    }

    _buildBaseResponse() {
        return new Discord.RichEmbed()
            .setColor(Constants.EmbedOptions.color)
            .setTitle('Coin Ranking')
            .setDescription('Displaying coin rankings sorted by **Market Cap**:');
    }
}

module.exports = ListCommand;