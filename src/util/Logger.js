const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const crypto = require('crypto');
const awsConfig = require('../../config/aws_credentials');

let startTime = new Date().toISOString();

let config = winston.config;
let cloudWatchConfig = {
    logGroupName: awsConfig.logGroupName,
    logStreamName: function() {
        // Spread log streams across dates as the server stays up
        let date = new Date().toISOString().split('T')[0];
        return 'crypi-bot-' + date + '-' +
            crypto.createHash('md5')
                .update(startTime)
                .digest('hex');
    },
    createLogGroup: false,
    createLogStream: true,
    awsAccessKeyId: awsConfig.accessKeyId,
    awsSecretKey: awsConfig.secretAccessKey,
    awsRegion: awsConfig.region,
};

let logger = new (winston.Logger)({
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

logger.add(CloudWatchTransport, cloudWatchConfig);

module.exports = logger;
module.exports.createTag = function(tag, id) {
    return `[${tag}:${id}]`;
};