const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
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
                let embed = this._buildBaseRepsonse(coin);
                this._appendPriceData(embed, coin);

                if (this.options.includes('change')) {
                    this._appendChangeData(embed, coin);
                }

                if (this.options.includes('volume')) {
                    this._appendVolumeData(embed, coin);
                }

                logger.info(`${logger.createTag(tag, this.msg.id)} Completed command.`);

                this.msg.channel.send(embed);
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
        return new Discord.RichEmbed()
            .setColor(Constants.EmbedOptions.color)
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


