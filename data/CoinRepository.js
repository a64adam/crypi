const request = require('request');
const CoinCache = require('./CoinCache');
const Coin = require('../models/Coin');

const endpoint = 'https://api.coinmarketcap.com/v1/ticker/';

class CoinRepository {

    /**
     * Fetches the latest metadata for the given coin.
     *
     * @param coinName
     * @returns {Promise<Coin>}
     */
    getCoin(coinName) {
        // TODO: Resolve symbols to name so you don't need the exact name

        return new Promise(function (resolve, reject) {
            // Check cache first
            let coin = CoinCache.cache.get(coinName);

            // If miss, hit network
            if (!coin) {
                console.log(`Cache miss for ${coinName}`);

                const url = endpoint + coinName;
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

                        CoinCache.cache.put(coin);
                        resolve(new Coin(json[0]));
                    }
                });
            } else {
                console.log(`Cache hit for ${coinName}`);
                resolve(coin);
            }
        });
    }
}

module.exports = CoinRepository;