const Discord = require('discord.js');
class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    /**
     * Fetches an emoji from the client with the given name.
     *
     * @param {Discord.Client} client Client to read emojis from
     * @param {string} name The name of the icon
     * @returns {Discord.Emoji|*}
     */
    static iconForSymbol(client, name) {
        return client.emojis.find("name", name.toLowerCase());
    }

    /**
     * Converts a value to its string representation in millions.
     *
     * i.e. 60000000 => 60M
     *
     * @param value {string}
     * @returns {string}
     */
    static toMillionString(value) {
        let number = Math.floor(Math.abs(Number(value)) / 1.0e+6);
        return `${number.toLocaleString()}**MM**`;
    }
}

module.exports = Util;
