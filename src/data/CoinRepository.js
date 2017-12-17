const request = require('request');
const CoinCache = require('./CoinCache');
const Coin = require('../model/Coin');

const endpoint = 'https://api.coinmarketcap.com/v1/ticker/';

class CoinRepository {

    constructor() {
        this.cache = new CoinCache();
        this.symbolToIdMap = {};
        this.nameToIdMap = {};
    }

    buildCoinMaps() {
        let url = endpoint + '?limit=0';

        request.get(url, (error, response, body) => {
            if (error) {
                // TODO: Handle case where this fails...
                return;
            }

            let jsonResponse = JSON.parse(body);

            for (let key in jsonResponse) {
                let coinId = jsonResponse[key].id;
                let coinName = this._normalize(jsonResponse[key].name);
                let coinSymbol = this._normalize(jsonResponse[key].symbol);

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
        console.log(`Returned id: ${id}`);

        return new Promise(function (resolve, reject) {
            if (!id) {
                reject();
            }

            // Check cache first
            let coin = cache.get(id);

            // If miss, hit network
            if (!coin) {
                console.log(`Cache miss for ${id}`);

                const url = endpoint + id;
                console.log(`Fetching data from: ${url}`);

                request.get(url, (error, response, body) => {
                    let json = JSON.parse(body);

                    if (error) {
                        // Error with request
                        reject(error);
                    } else if (json.error) {
                        // Invalid coinName
                        reject(json.error);
                    } else {
                        // Successful
                        coin = new Coin(json[0]);

                        cache.put(coin);
                        resolve(new Coin(json[0]));
                    }
                });
            } else {
                console.log(`Cache hit for ${id}`);
                resolve(coin);
            }
        });
    }

    getConversion(fromCoin, toCoin, amount) {
        // fromCoin needs to be in id format
        let fromCoinId = this._getId(fromCoin);

        // toCoin needs to be in symbol format
        let toCoinSymbol = this._getSymbol(toCoin);

        let source = this;
        return new Promise(function(resolve, reject) {
            if (!fromCoinId || !toCoinSymbol) {
                reject();
            }

            console.log(`Converting ${amount} from ${fromCoinId} to ${toCoinSymbol}`);

            let url = endpoint + fromCoinId + `?convert=${toCoinSymbol}`;
            console.log(`Fetching data from: ${url}`);

            request.get(url, (error, response, body) => {
                let json = JSON.parse(body);

                if (error) {
                    reject(error);
                } else if (json.error) {
                    reject(json.error);
                } else {
                    let coin = new Coin(json[0]);
                    let conversionKey = `price_${toCoinSymbol}`;

                    source.cache.put(coin);

                    resolve({
                        fromCoin: coin,
                        toCoinSymbol: toCoinSymbol,
                        fromAmount: parseFloat(amount),
                        toAmount: (json[0][conversionKey] * amount)
                    });
                }
            });
        });
    }

    _getId(input) {
        let key = this._normalize(input);

        if (key in this.symbolToIdMap) {
            key = this.symbolToIdMap[key];
        } else if (key in this.nameToIdMap) {
            key = this.nameToIdMap[key];
        } else {
            // If the key isn't in either map, then it doesn't exist (with our source at least)
            key = null;
        }

        return key;
    }

    _getSymbol(input) {
        let key = this._normalize(input);

        // If the key exists in the name map, let's first get the id
        if (key in this.nameToIdMap) {
            key = this.nameToIdMap[key];
        }

        if (!(key in this.symbolToIdMap)) {
            key = Object.keys(this.symbolToIdMap).find(k => this.symbolToIdMap[k] === key);
        }

        return key;
    }

    _normalize(input) {
        return input.toLowerCase().replace(/[^A-Za-z0-9]/gi, '');
    }
}

module.exports.coinRepo = new CoinRepository();