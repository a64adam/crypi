const request = require('request');
const logger = require('../util/Logger');
const CoinCache = require('./CoinCache');
const Coin = require('../model/Coin');

const tag = '[CoinRepository]';
const endpoint = 'https://api.coinmarketcap.com/v1/ticker/';

class CoinRepository {

    constructor() {
        this.cache = new CoinCache();
        this.symbolToIdMap = {};
        this.nameToIdMap = {};
    }

    buildCoinMaps() {
        logger.verbose(`${tag} Building coin map...`);

        let url = endpoint + '?limit=0';

        logger.info(`${tag} Fetching coin mapping: [url: ${url}]`);
        request.get(url, (error, response, body) => {
            if (error) {
                // TODO: Handle case where this fails...
                logger.error(`${tag} Failed to fetch coin mapping.`);
                return;
            }

            let jsonResponse = JSON.parse(body);

            logger.info(`${tag} Successfully fetched coin mapping.`);

            for (let key in jsonResponse) {
                let coinId = jsonResponse[key].id;
                let coinName = this._normalize(jsonResponse[key].name);
                let coinSymbol = this._normalize(jsonResponse[key].symbol);

                logger.silly(`${tag} Registered coin: [id: ${coinId}, name: ${coinName}, symbol: ${coinSymbol}]`);

                this.symbolToIdMap[coinSymbol] = coinId;
                this.nameToIdMap[coinName] = coinId;
            }
        });
    }

    /**
     * Fetches the latest metadata for the given coin.
     *
     * @param coinName
     * @returns {Promise<Coin>}
     */
    getCoin(coinName) {
        let cache = this.cache;
        let id = this._getId(coinName);

        logger.info(`${tag} Fetching metadata: [coin: ${coinName}, id: ${id}]`);

        return new Promise(function (resolve, reject) {
            if (!id) {
                logger.info(`${tag} Invalid id: [coin: ${coinName}]`);
                reject();
            }

            // Check cache first
            let coin = cache.get(id);

            // If miss, hit network
            if (!coin) {
                logger.info(`${tag} Cache Miss: [id: ${id}]`);

                const url = endpoint + id;
                logger.info(`${tag} Fetching metadata: [url: ${url}]`);

                request.get(url, (error, response, body) => {
                    let json = JSON.parse(body);

                    if (error) {
                        // Error with request
                        logger.error(`${tag} ${error}`);
                        reject(error);
                    } else if (json.error) {
                        // Invalid coinName
                        logger.error(`${tag} ${error}`);
                        reject(json.error);
                    } else {
                        // Successful
                        coin = new Coin(json[0]);

                        logger.info(`${tag} Successfully fetched metadata! [${JSON.stringify(coin)}]`);

                        cache.put(coin);
                        resolve(new Coin(json[0]));
                    }
                });
            } else {
                console.log(`Cache hit for ${id}`);
                logger.info(`${tag} Cache Hit: [${JSON.stringify(coin)}]`);
                resolve(coin);
            }
        });
    }

    getConversion(fromCoin, toCoin, amount) {
        // fromCoin needs to be in id format
        let fromCoinId = this._getId(fromCoin);

        // toCoin needs to be in symbol format
        let toCoinSymbol = this._getSymbol(toCoin);

        logger.info(`${tag} Converting ${amount} fromCoin: [input: ${fromCoin}, id: ${fromCoinId}] to toCoin: [input: ${toCoin}, symbol: ${toCoinSymbol}]`);

        let source = this;
        return new Promise(function(resolve, reject) {
            if (!fromCoinId || !toCoinSymbol) {
                logger.info(`${tag} Invalid fromCoinId toCoinSymbol combination: [fromCoinId: ${fromCoinId}, toCoinSymbol: ${toCoinSymbol}`);
                reject();
            }

            let url = endpoint + fromCoinId + `?convert=${toCoinSymbol}`;
            logger.info(`${tag} Fetching conversion data: [url: ${url}]`);

            request.get(url, (error, response, body) => {
                let json = JSON.parse(body);

                if (error) {
                    logger.error(`${tag} ${error}`);
                    reject(error);
                } else if (json.error) {
                    logger.error(`${tag} ${json.error}`);
                    reject(json.error);
                } else {
                    let coin = new Coin(json[0]);
                    let conversionKey = `price_${toCoinSymbol}`;

                    source.cache.put(coin);

                    let data = {
                        fromCoin: coin,
                        toCoinSymbol: toCoinSymbol,
                        fromAmount: parseFloat(amount),
                        toAmount: (json[0][conversionKey] * amount)
                    };

                    logger.info(`${tag} Successfully fetched conversion data! [${JSON.stringify(data)}]`);
                    resolve(data);
                }
            });
        });
    }

    _getId(input) {
        let key = this._normalize(input);
        logger.verbose(`${tag} getId: [input: ${input}, normalized: ${key}]`);

        if (key in this.symbolToIdMap) {
            key = this.symbolToIdMap[key];
            logger.silly(`${tag} Found key in symbol map: [key: ${key}]`);
        } else if (key in this.nameToIdMap) {
            key = this.nameToIdMap[key];
            logger.silly(`${tag} Found key in name map: [key: ${key}]`);
        } else {
            // If the key isn't in either map, then it doesn't exist (with our source at least)
            key = null;
            logger.silly(`${tag} No id found!`);
        }

        logger.silly(`${tag} id is: [${input}: ${key}]`);
        return key;
    }

    _getSymbol(input) {
        let key = this._normalize(input);
        logger.verbose(`${tag} getSymbol: [input: ${input}, normalized: ${key}]`);

        // If the key exists in the name map, let's first get the id
        if (key in this.nameToIdMap) {
            key = this.nameToIdMap[key];
            logger.silly(`${tag} Found key in name map: [key: ${key}]`);
        }

        if (!(key in this.symbolToIdMap)) {
            logger.silly(`${tag} Searching symbol map values for match.`);
            key = Object.keys(this.symbolToIdMap).find(k => this.symbolToIdMap[k] === key);
            logger.silly(`${tag} Found key in reverse symbol map lookup: [key: ${key}]`);
        }

        logger.silly(`${tag} symbol is: [${input}: ${key}]`);
        return key;
    }

    _normalize(input) {
        return input.toLowerCase().replace(/[^A-Za-z0-9]/gi, '');
    }
}

module.exports.coinRepo = new CoinRepository();