const NodeCache = require('node-cache');


class CoinCache {

    constructor() {
        this.cache = new NodeCache({
            stdTTL: 300,
            checkperiod: 60
        });
    }

    /**
     * @param coin {Coin}
     */
    put(coin) {
        // ttl 5 minutes from last updated date
        let nextUpdate = new Date(coin.lastUpdated.getTime() + 5 * 60000);
        let now = new Date();
        let diff = (nextUpdate - now) / 1000;

        console.log(`Added key [${coin.name}] with ttl of ${diff}s`);
        this.cache.set(coin.name.toLowerCase(), coin, Math.max(1, diff));
    }

    /**
     * @param coinName (StringResolvable}
     * @returns {Coin|false}
     */
    get(coinName) {
        return this.cache.get(coinName.toLowerCase());
    }
}

module.exports = CoinCache;