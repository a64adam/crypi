const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;


const defaultFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

module.exports = createLogger({
    format: combine(
        timestamp(),
        defaultFormat
    ),
    transports: [
        new transports.Console({
            level: 'silly',
            colorize: true
        }),
    ]
});

module.exports.createTag = function(tag, id) {
    return `[${tag}:${id}]`;
};