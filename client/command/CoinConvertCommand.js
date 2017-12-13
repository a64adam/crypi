const discord = require('discord.js');
const BaseCommand = require('./BaseCommand');


class CoinConvertCommand extends BaseCommand {

    constructor(dataSource, msg, fromCoin, toCoin, amount = 1) {
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

                let fromAmount = conversion.fromAmount;
                let fromSymbol = conversion.fromCoin.symbol.toUpperCase();
                let toAmount = conversion.toAmount;
                let toSymbol = conversion.toCoinSymbol.toUpperCase();

                let embed = this._buildBaseRepsonse(conversion.fromCoin)
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
    _buildBaseRepsonse(coin) {
        return new discord.RichEmbed()
            .setColor('#FF9900')
            .setFooter(`Last updated: ${coin.lastUpdated.toUTCString()}`);
    }
}

module.exports = CoinConvertCommand;