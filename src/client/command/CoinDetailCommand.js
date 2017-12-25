const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
const IconUtil = require('../../util/IconUtil');
const logger = require('../../util/Logger');

const tag = 'CoinDetailCommand';

class CoinDetailCommand extends BaseCommand {

    constructor(dataSource, msg, coinName, options) {
        super(msg);

        this.coinName = coinName;
        this.options = options;
        this.dataSource = dataSource;
    }

    run() {
        logger.info(`${logger.createTag(tag, this.msg.id)} Executing command.`);

        this.dataSource.getCoin(this.coinName)
            .then((coin) => {
                let percentChange = coin.percentChangeDay;
                if (percentChange[0] !== '-') {
                    percentChange = '+' + percentChange;
                }

                let embed = this._buildBaseRepsonse(coin)
                    .addField(`${coin.priceUSD} USD`, `Price`, true)
                    .addField(`${percentChange}%`, 'Change (24h)', true);

                this.msg.channel.send(embed);

                logger.info(`${logger.createTag(tag, this.msg.id)} Completed command.`);
            })
            .catch((error) => {
                logger.error(`${logger.createTag(tag, this.msg.id)} Failed to complete command: `, error);
                this.msg.channel.send("Boo! I couldn't find that coin.");
            });
    }

    /**
     * @private
     * @param coin {Coin}
     * @returns {"discord.js".RichEmbed}
     */
    _buildBaseRepsonse(coin) {
        let title = `${coin.name} (${coin.symbol})`;

        let coinIcon = IconUtil.iconForSymbol(this.msg.client, coin.symbol);
        if (coinIcon) {
            title = `${coinIcon} ${title}`;
        }

        let color = coin.percentChangeDay[0] === '-' ?
            Constants.EmbedOptions.negativeColor :
            Constants.EmbedOptions.positiveColor;

        return new Discord.RichEmbed()
            .setColor(color)
            .setTitle(title)
            .setFooter(`Last updated: ${coin.lastUpdated.toUTCString()}`);
    }
}

module.exports = CoinDetailCommand;


