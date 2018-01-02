const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
const Util = require('../../util/Util');
const logger = require('../../util/Logger');

const tag = 'CoinDetailCommand';

class CoinDetailCommand extends BaseCommand {

    constructor(dataSource, msg, coinName) {
        super(msg);

        this.coinName = coinName;
        this.dataSource = dataSource;
    }

    run(options = {}) {
        logger.info(`${logger.createTag(tag, this.msg.id)} Executing command.`);

        this.dataSource.getCoin(this.coinName).then((coin) => {
            let embed = this._buildBaseResponse(coin);
            this._appendPriceData(embed, coin);
            this._appendChangeData(embed, coin);

            this.msg.channel.send(embed);
            logger.info(`${logger.createTag(tag, this.msg.id)} Completed command.`);
        }).catch((error) => {
            logger.error(`${logger.createTag(tag, this.msg.id)} Failed to complete command: ${error}`,);
            this.msg.channel.send("Boo! I couldn't find that coin.");
        });
    }

    /**
     * Builds a base RichEmbed object with default fields set for the message.
     *
     * @param {Coin} coin
     * @returns {RichEmbed}
     * @private
     */
    _buildBaseResponse(coin) {
        let title = `${coin.name} (${coin.symbol})`;

        let coinIcon = Util.iconForSymbol(this.msg.client, coin.symbol);
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

    /**
     * Appends the price data for the given coin to the RichEmbed in the provided price format.
     *
     * @param {RichEmbed} embed
     * @param {Coin} coin
     * @private
     */
    _appendPriceData(embed, coin) {
        embed.addField(`Price`, `**${coin.priceUSD}** USD\n${coin.priceBTC} BTC`, true);
    }

    /**
     * Appends the change data for the given coin to the RichEmbed.
     *
     * @param {RichEmbed} embed
     * @param {Coin} coin
     * @private
     */
    _appendChangeData(embed, coin) {
        let percentChange = coin.percentChangeDay;
        if (percentChange[0] !== '-') {
            percentChange = '+' + percentChange;
        }

        embed.addField(`Change (24h)`, `**${percentChange}**%`, true);
    }
}

module.exports = CoinDetailCommand;


