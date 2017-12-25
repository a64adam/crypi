module.exports.iconForSymbol = function(client, symbol) {
    return client.emojis.find("name", symbol.toLowerCase());
};
