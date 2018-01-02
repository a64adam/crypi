const request = require('request');
const logger = require('../util/Logger');
const CoinCache = require('./CoinCache');
const Coin = require('../model/Coin');
const Constants = require('../util/Constants');

const tag = '[CoinRepository]';
const endpoint = 'https://api.coinmarketcap.com/v1/ticker/';

const ConversionType = Object.freeze({
    FIAT_TO_CRYPTO: Symbol("fiatToCrypto"),
    CRYPTO_TO_FIAT: Symbol("cryptoToFiat")
});

class CoinRepository {

    constructor() {
        this.cache = new CoinCache();
        this.symbolToIdMap = {};
        this.nameToIdMap = {};
    }

    buildCoinMaps() {
        logger.verbose(`${tag} Building coin map...`);

        this._getCoins().then((coins) => {
            logger.info(`${tag} Successfully fetched coin mapping.`);

            for (let coin in coins) {
                let coinId = coins[coin].id;
                let coinName = this._normalize(coins[coin].name);
                let coinSymbol = this._normalize(coins[coin].symbol);

                logger.silly(`${tag} Registered coin: [id: ${coinId}, name: ${coinName}, symbol: ${coinSymbol}]`);

                this.symbolToIdMap[coinSymbol] = coinId;
                this.nameToIdMap[coinName] = coinId;
            }
        }).catch((error) => {
            logger.error(`${tag} Failed to fetch coin mapping: ${error}`);
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

                        logger.info(`${tag} Successfully fetched metadata: `, coin);

                        cache.put(coin);
                        resolve(new Coin(json[0]));
                    }
                });
            } else {
                console.log(`Cache hit for ${id}`);
                logger.info(`${tag} Cache Hit: `, coin);
                resolve(coin);
            }
        });
    }

    getConversion(fromCoin, toCoin, amount) {
        let type = !(this._normalize(fromCoin) in this.symbolToIdMap) ?
            ConversionType.FIAT_TO_CRYPTO :
            ConversionType.CRYPTO_TO_FIAT;

        let fromCoinId; // fromCoin needs to be in id format
        let toCoinSymbol; // toCoin needs to be in symbol format

        switch(type) {
            case ConversionType.CRYPTO_TO_FIAT:
                fromCoinId = this._getId(fromCoin);
                toCoinSymbol = this._getSymbol(toCoin);
                break;
            case ConversionType.FIAT_TO_CRYPTO:
                // endpoint requires cryptocurrency as the fromCoin type, so invert them here and we'll do the math
                // to reverse the conversion once we get the result
                fromCoinId = this._getId(toCoin);
                toCoinSymbol = this._normalize(fromCoin);
                break;
        }

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

                    let fromCoinSymbol, toAmount;
                    if (type === ConversionType.CRYPTO_TO_FIAT) {
                        fromCoinSymbol = coin.symbol;
                        toAmount = (json[0][conversionKey] * amount);
                    } else {
                        fromCoinSymbol = toCoinSymbol;
                        toCoinSymbol = coin.symbol;
                        toAmount = (amount / json[0][conversionKey]);
                    }

                    if (!toAmount) {
                        reject('Error with toAmount, NaN!');
                    }

                    let data = {
                        fromCoinSymbol: fromCoinSymbol,
                        toCoinSymbol: toCoinSymbol,
                        fromAmount: parseFloat(amount),
                        toAmount: toAmount,
                        lastUpdated: coin.lastUpdated
                    };

                    logger.info(`${tag} Successfully fetched conversion data: `, data);
                    resolve(data);
                }
            });
        });
    }

    getOrderedCoins(limit = 5) {
        logger.info(`${tag} Fetching ordered coin list with limit of ${limit}`);

        return new Promise((resolve, reject) => {

            let pageSize = Constants.CacheOptions.pageSize;
            let orderedCoins = [];

            // Determine if cache has rankings already
            let pageIndex = 0;
            while (orderedCoins.length < limit) {
                logger.verbose(`${tag} Searching cache for page ${pageIndex}`);
                let tmpCoins = this.cache.getPage(pageIndex);

                if (tmpCoins && tmpCoins.length >= Math.min(pageSize, limit)) {
                    logger.verbose(`${tag} Found page ${pageIndex}. Appending to list`, orderedCoins);
                    orderedCoins.push(...tmpCoins);
                } else {
                    logger.verbose(`${tag} Couldn't find page in cache, fetching from network`);
                    orderedCoins = [];
                    break;
                }

                pageIndex++;
            }

            if (orderedCoins.length > 0) {
                logger.info(`${tag} Fetched ordered coin list from cache`, orderedCoins);
                resolve(orderedCoins.slice(0, limit));
            } else {
                this._getCoins(limit).then((coins) => {
                    let pageIndex = 0;

                    for (let [idx, value] of coins.entries()) {
                        let coin = new Coin(value);
                        orderedCoins.push(coin);

                        if ((idx + 1) % pageSize === 0) {
                            let startIndex = pageIndex * pageSize;
                            let endIndex = (pageIndex + 1) * pageSize;
                            let orderedCoinsPage = orderedCoins.slice(startIndex, endIndex);

                            this.cache.putPage(orderedCoinsPage, pageIndex);
                            pageIndex++;
                        }
                    }

                    logger.info(`${tag} Successfully fetched ordered coin list`, orderedCoins);
                    resolve(orderedCoins);
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    }

    _getCoins(limit = 0) {
        return new Promise(function(resolve, reject) {
            let url = endpoint +`?limit=${limit}`;

            request.get(url, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    let jsonResponse = JSON.parse(body);
                    resolve(jsonResponse);
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

            let searchKey = Object.keys(this.symbolToIdMap).find(k => this.symbolToIdMap[k] === key);
            if (searchKey) {
                logger.silly(`${tag} Found key in reverse symbol map lookup: [key: ${key}]`);
                key = searchKey;
            } else {
                logger.silly(`${tag} Did not find key in reverse symbol map lookup.`);
            }
        }

        logger.silly(`${tag} symbol is: [${input}: ${key}]`);
        return key;
    }

    _normalize(input) {
        return input.toLowerCase().replace(/[^A-Za-z0-9$]/gi, '');
    }
}

module.exports.coinRepo = new CoinRepository();