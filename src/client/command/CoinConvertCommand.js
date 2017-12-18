const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');


class CoinConvertCommand extends BaseCommand {

    constructor(dataSource, msg, fromCoin, toCoin, amount) {
        super(msg);

        this.dataSource = dataSource;
        this.fromCoin = fromCoin;
        this.toCoin = toCoin;
        this.amount = amount;
    }

    run() {
        this.dataSource.getConversion(this.fromCoin, this.toCoin, this.amount)
            .then((conversion) => {
                console.log(conversion);

                let fromAmount = conversion.fromAmount.toLocaleString();
                let fromSymbol = conversion.fromCoin.symbol.toUpperCase();
                let toAmount = conversion.toAmount.toFixed(4).toLocaleString();
                let toSymbol = conversion.toCoinSymbol.toUpperCase();

                let embed = this._buildBaseResponse(conversion.fromCoin)
                    .addField('Conversion', `${fromAmount} **${fromSymbol}** = ${toAmount} **${toSymbol}**`);

                this.msg.channel.send(embed);
            })
            .catch((error) => {
                console.error(error);

                this.msg.channel.send("Sorry! I'm not sure how to do that conversion.");
            });
    }

    /**
     * @private
     * @param coin {Coin}
     * @returns {"discord.js".RichEmbed}
     */
    _buildBaseResponse(coin) {
        return new Discord.RichEmbed()
            .setColor(Constants.EmbedOptions.color)
            .setFooter(`Last updated: ${coin.lastUpdated.toUTCString()}`);
    }
}

module.exports = CoinConvertCommand;