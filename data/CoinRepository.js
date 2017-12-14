const request = require('request');
const CoinCache = require('./CoinCache');
const Coin = require('../models/Coin');

const endpoint = 'https://api.coinmarketcap.com/v1/ticker/';

class CoinRepository {

    constructor() {
        this.cache = new CoinCache();
        this.symbolMap = {};
        this.nameMap = {};
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
                let coinName = this._normalizeKey(jsonResponse[key].name);
                let coinSymbol = this._normalizeKey(jsonResponse[key].symbol);

                this.symbolMap[coinSymbol] = coinName;
                this.nameMap[coinName] = coinSymbol;
            }

            console.log(this.symbolMap);
        });
    }

    /**
     * Fetches the latest metadata for the given coin.
     *
     * @param coinName
     * @returns {Promise<Coin>}
     */
    getCoin(coinName) {
        let symbolMap = this.symbolMap;
        let cache = this.cache;

        let key = this._normalizeKey(coinName);

        return new Promise(function (resolve, reject) {
            // Check if the user passed in the symbol and map it to the coin name
            if (key in symbolMap) {
                key = symbolMap[key];
                console.log(`Found a symbol match, key is now ${key}`);
            }

            // Check cache first
            let coin = cache.get(key);

            // If miss, hit network
            if (!coin) {
                console.log(`Cache miss for ${key}`);

                const url = endpoint + key;
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
                console.log(`Cache hit for ${key}`);
                resolve(coin);
            }
        });
    }

    getConversion(fromCoin, toCoin, amount) {
        // fromCoin needs to be in name format
        let fromCoinKey = fromCoin;
        if (fromCoin in this.symbolMap) {
            fromCoinKey = this.symbolMap[fromCoin];
        }

        // toCoin needs to be in symbol format
        let toCoinSymbol = toCoin;
        if (toCoin in this.nameMap) {
            toCoinSymbol = this.nameMap[toCoin];
        }

        fromCoinKey = this._normalizeKey(fromCoinKey);
        toCoinSymbol = this._normalizeKey(toCoinSymbol);

        console.log(`Converting ${amount} from ${fromCoinKey} to ${toCoinSymbol}`);

        let url = endpoint + fromCoinKey + `?convert=${toCoinSymbol}`;

        let source = this;
        return new Promise(function(resolve, reject) {
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

    _normalizeKey(key) {
        return key.toLowerCase();
    }
}

module.exports.coinRepo = new CoinRepository();