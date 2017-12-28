const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
const Util = require('../../util/Util');
const logger = require('../../util/Logger');

const tag = 'CoinDetailCommand';

const btcEmoji = 'btc';
const usdEmoji = '💵';

const PriceFormat = Object.freeze({
    USD: Symbol("USD"),
    BTC: Symbol("BTC")
});

class CoinDetailCommand extends BaseCommand {

    constructor(dataSource, msg, coinName) {
        super(msg);

        this.coinName = coinName;
        this.dataSource = dataSource;
    }

    async run(options = {}) {
        logger.info(`${logger.createTag(tag, this.msg.id)} ${options.reaction ? 'Editing' : 'Executing'} command.`);

        let coin = await this.dataSource.getCoin(this.coinName);

        let priceFormat;
        if (options.reaction && options.reaction.emoji.name === btcEmoji) {
            priceFormat = PriceFormat.BTC;
        } else {
            priceFormat = PriceFormat.USD;
        }

        let embed = this._buildBaseResponse(coin);
        this._appendPriceData(embed, coin, priceFormat);
        this._appendChangeData(embed, coin);

        if (options.reaction) {
            await options.reaction.message.edit(embed);
        } else {
            let message = await this.msg.channel.send(embed);
            await message.react(Util.iconForSymbol(this.msg.client, btcEmoji));
            await message.react(usdEmoji);
        }

        logger.info(`${logger.createTag(tag, this.msg.id)} Completed command.`);
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
     * @param {PriceFormat} priceFormat
     * @private
     */
    _appendPriceData(embed, coin, priceFormat) {
        switch (priceFormat) {
            case PriceFormat.USD:
                embed.addField(`${coin.priceUSD} USD`, `Price`, true);
                break;
            case PriceFormat.BTC:
                embed.addField(`${coin.priceBTC} BTC`, `Price`, true);
                break;
        }
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

        embed.addField(`${percentChange}%`, 'Change (24h)', true);
    }
}

module.exports = CoinDetailCommand;


