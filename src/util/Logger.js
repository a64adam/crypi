const winston = require('winston');

let config = winston.config;

module.exports = new (winston.Logger)({
    exitOnError: false,
    transports: [
        new (winston.transports.Console)({
            level: 'silly',
            timestamp: function() {
                return Date.now();
            },
            formatter: function(options) {
                return options.timestamp() + ' ' +
                    config.colorize(options.level, options.level.toUpperCase()) + ' ' +
                    (options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
        })
    ]
});

module.exports.createTag = function(tag, id) {
    return `[${tag}:${id}]`;
};