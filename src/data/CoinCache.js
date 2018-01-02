const NodeCache = require('node-cache');
const logger = require('../util/Logger');

const tag = '[CoinCache]';


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
        if (!coin) {
            return;
        }

        let diff = this._getTTL(coin.lastUpdated);
        logger.info(`${tag} Added coin: [id: ${coin.id}, ttl: ${diff}s]`);
        this.cache.set(coin.id.toLowerCase(), coin, Math.max(1, diff));
    }

    /**
     * @param coinId (StringResolvable}
     * @returns {Coin|false}
     */
    get(coinId) {
        return this.cache.get(coinId.toLowerCase());
    }

    /**
     * Puts a page of coins for the given page index into the cache.
     *
     * @param {Array.} coins The coins in this page.
     * @param {!number} pageIndex The index of the page.
     */
    putPage(coins, pageIndex) {
        let earliestUpdated = coins[0].lastUpdated;
        for (let coin of coins) {
            this.put(coin);

            if (coin.lastUpdated < earliestUpdated) {
                earliestUpdated = coin.lastUpdated;
            }
        }

        let diff = this._getTTL(earliestUpdated);
        logger.info(`${tag} Added page: [index: ${pageIndex}, ttl: ${diff}s]`, coins);

        this.cache.set(this._getPageKey(pageIndex), coins);
    }

    /**
     * Fetches the page of coins for the given page index.
     *
     * @param {!number} pageIndex
     * @returns {Array.}
     */
    getPage(pageIndex) {
        return this.cache.get(this._getPageKey(pageIndex));
    }

    _getPageKey(pageIndex) {
        return `page-${pageIndex}`;
    }

    _getTTL(time) {
        // ttl 5 minutes from last updated date
        let nextUpdate = new Date(time.getTime() + 5 * 60000);
        let now = new Date();
        return (nextUpdate - now) / 1000;
    }
}

module.exports = CoinCache;