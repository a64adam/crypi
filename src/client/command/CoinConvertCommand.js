const Discord = require('discord.js');
const BaseCommand = require('./BaseCommand');
const Constants = require('../../util/Constants');
const Util = require('../../util/Util');
const logger = require('../../util/Logger');

const tag = 'CoinConvertCommand';


class CoinConvertCommand extends BaseCommand {

    constructor(dataSource, msg, fromCoin, toCoin, amount) {
        super(msg);

        this.dataSource = dataSource;
        this.fromCoin = fromCoin;
        this.toCoin = toCoin;
        this.amount = amount;
    }

    run(options = {}) {
        if (options.reaction) {
            return;
        }

        logger.info(`${logger.createTag(tag, this.msg.id)} Executing command.`);

        this.dataSource.getConversion(this.fromCoin, this.toCoin, this.amount)
            .then((conversion) => {
                let fromAmount = conversion.fromAmount.toString();
                let fromSymbol = conversion.fromCoinSymbol.toUpperCase();
                let toAmount = conversion.toAmount.toFixed(8).toString();
                let toSymbol = conversion.toCoinSymbol.toUpperCase();

                let fromSymbolIcon = Util.iconForSymbol(this.msg.client, conversion.fromCoinSymbol);
                let toSymbolIcon = Util.iconForSymbol(this.msg.client, conversion.toCoinSymbol);

                let title = fromSymbolIcon && toSymbolIcon ? `${fromSymbolIcon} -> ${toSymbolIcon}` : 'Conversion'
                let embed = this._buildBaseResponse(conversion.lastUpdated)
                    .addField(title, `\`${fromAmount}\` **${fromSymbol}** = \`${toAmount}\` **${toSymbol}**`);

                logger.info(`${logger.createTag(tag, this.msg.id)} Completed command.`)

                this.msg.channel.send(embed);
            })
            .catch((error) => {
                logger.error(`${logger.createTag(tag, this.msg.id)} Failed to complete command: ${error}`,);
                this.msg.channel.send("Sorry! I'm not sure how to do that conversion.");
            });
    }

    /**
     * @private
     * @param lastUpdated {StringResolvable}
     * @returns {"discord.js".RichEmbed}
     */
    _buildBaseResponse(lastUpdated) {
        return new Discord.RichEmbed()
            .setColor(Constants.EmbedOptions.color)
            .setFooter(`Last updated: ${lastUpdated.toUTCString()}`);
    }
}

module.exports = CoinConvertCommand;