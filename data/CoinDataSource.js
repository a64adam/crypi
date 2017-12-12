const request = require('request');
const CoinCache = require('./CoinCache');
const Coin = require('../models/Coin');

const endpoint = 'https://api.coinmarketcap.com/v1/ticker/';

class CoinDataSource {

    constructor() {
        this.cache = new CoinCache();
        this.symbolMap = {};
    }

    fetchSymbols() {
        request.get(endpoint, (error, response, body) => {
            if (error) {
                // TODO: Handle case where this fails...
                return;
            }

            let jsonResponse = JSON.parse(body);

            for (let key in jsonResponse) {
                let coinName = this._normalizeKey(jsonResponse[key].name);
                let coinSymbol = this._normalizeKey(jsonResponse[key].symbol);

                this.symbolMap[coinSymbol] = coinName;
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

    _normalizeKey(key) {
        return key.toLowerCase();
    }
}

module.exports.source = new CoinDataSource();