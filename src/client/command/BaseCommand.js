class BaseCommand {

    constructor(msg) {
        this.msg = msg;
    }

    /**
     * @typedef {object} CommandOptions
     * @property {MessageReaction} [reaction] The reaction that was added to the output of the command
     */

    /**
     * Runs the command with the provided options. The options can be empty.
     *
     * @param {CommandOptions} options
     */
    run(options = {}) {

    }
}

module.exports = BaseCommand;