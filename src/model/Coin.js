class Coin {

    constructor(obj) {
        if (obj instanceof Coin) {
            return obj;
        }

        this.id = obj.id;
        this.name = obj.name;
        this.symbol = obj.symbol;
        this.priceUSD = obj.price_usd;
        this.priceBTC = obj.price_btc;
        this.percentChangeHour = obj.percent_change_1h;
        this.percentChangeDay = obj.percent_change_24h;
        this.percentChangeWeek = obj.percent_change_7d;
        this.marketCapUSD = obj.market_cap_usd;
        this._lastUpdated = obj.last_updated;
    }

    /**
     * @returns {Date}
     */
    get lastUpdated() {
        const date = new Date(0);
        date.setUTCSeconds(this._lastUpdated);
        return date;
    }
}

module.exports = Coin;