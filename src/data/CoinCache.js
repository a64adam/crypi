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
        // ttl 5 minutes from last updated date
        let nextUpdate = new Date(coin.lastUpdated.getTime() + 5 * 60000);
        let now = new Date();
        let diff = (nextUpdate - now) / 1000;

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
}

module.exports = CoinCache;