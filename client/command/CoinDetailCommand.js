const discord = require('discord.js');
const CoinRepository = require('../../data/CoinDataSource');
const BaseCommand = require('./BaseCommand');


class CoinDetailCommand extends BaseCommand {

    constructor(msg, coinName, options, dataSource) {
        super(msg);

        this.coinName = coinName;
        this.options = options;
        this.dataSource = dataSource;
    }

    run() {
        this.dataSource.getCoin(this.coinName)
            .then((coin) => {
                console.log(coin);

                let embed = this._buildBaseRepsonse(coin);
                this._appendPriceData(embed, coin);

                if (this.options.includes('change')) {
                    this._appendChangeData(embed, coin);
                }

                if (this.options.includes('volume')) {
                    this._appendVolumeData(embed, coin);
                }

                this.msg.channel.send(embed);
            })
            .catch((error) => {
                console.error(error);

                this.msg.channel.send("Boo! I couldn't find that coin.");
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

    /**
     * @private
     * @param embed {"discord.js".RichEmbed}
     * @param coin {Coin}
     */
    _appendPriceData(embed, coin) {
        return embed.addField(coin.name, `**Price (USD)**: $${coin.priceUSD}`, false)
    }

    /**
     * @private
     * @param embed {"discord.js".RichEmbed}
     * @param coin {Coin}
     * @returns {"discord.js".RichEmbed}
     */
    _appendChangeData(embed, coin) {
        return embed
            .addField('1H', `${coin.percentChangeHour}%`, true)
            .addField('24H', `${coin.percentChangeDay}%`, true)
            .addField('7D', `${coin.percentChangeWeek}%`, true);
    }

    /**
     * @private
     * @param embed {"discord.js".RichEmbed}
     * @param coin {Coin}
     * @returns {"discord.js".RichEmbed}
     */
    _appendVolumeData(embed, coin) {

    }
}

module.exports = CoinDetailCommand;


