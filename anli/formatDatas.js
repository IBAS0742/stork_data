const formatDatas = json => {
    // json = { 日期: {data: {
    //      last_close: 7.48,
    //      high: 7.56,
    //      low: 7.3,
    //      items: [{
    //          "current":7.48,
    //          "volume":0,
    //          "avg_price":7.48,
    //          "chg":0,
    //          "percent":0,
    //          "timestamp":1617759000000,
    //          "amount":0,
    //          "high":7.48,
    //          "low":7.48,
    //          "macd":null,
    //          "kdj":null,
    //          "ratio":null,
    //          "capital":null,
    //          "volume_compare":null
    //      }]
    // }} }
    let items = [];
    for (let i in json) {
        if (json[i].data.items.length) {
            let theItems = json[i].data.items;
            let high = theItems[0].high;
            let low = theItems[0].low;
            theItems.forEach(it => {
                if (it.high)
                    high = high > it.high ? high : it.high;
                if (it.low)
                    low = low < it.low ? low : it.low;
            });
            items.push({
                items: theItems,
                date: +i,
                high,
                low,
                last_close: theItems[theItems.length - 1].current,
            });

        }
    }
    return items.sort((a,b) => a.date - b.date);
};

module.exports = {
    formatDatas
}