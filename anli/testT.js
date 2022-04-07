const {
    formatDatas
} = require('./formatDatas');
const fs = require('fs');

const TestT = jsonFile => {
    const data = require(jsonFile);

    // 第二天开始进行交易(涨停跌停过(9.5%以上)不交易，做T幅度大于 2% 且维持时间至少达到 2分钟（两个时刻点求均值） 才进行交易)
    let items = formatDatas(data);

    let lastPrice = 0;
    let earn = -1;
    let buyInPrice = -1;
    items.forEach((it,ind) => {
        if (ind) {
            let topPercent = it.high / lastPrice - 1;
            let lowPercent = 1 - it.low / lastPrice;
            if (topPercent >= 0.095 || lowPercent >= 0.095) {
            } else {
                if (buyInPrice === -1) {
                    earn = 0;
                    buyInPrice = it.high;
                } else {
                    let inPrice = -1;
                    let outPrice = -1;
                    let low = 1e100;
                    let high = -1e100;
                    it.items.map(i => {
                        let p = i.current;
                        low = low > p ? p : low;
                        high = high > p ? high : p;
                        return p;
                    }).forEach((p,ind) => {
                        if (inPrice === -1 && p === low) {
                            inPrice = p;
                            it.items.slice(ind < 2 ? 0 : ind - 2,ind + 2).forEach(pp => inPrice = pp > inPrice ? pp : inPrice);
                        }
                        if (outPrice === -1 && p === high) {
                            outPrice = p;
                            it.items.slice(ind < 2 ? 0 : ind - 2,ind + 2).forEach(pp => outPrice = pp < outPrice ? pp : outPrice);
                        }
                    });
                    earn += outPrice * 0.995 - inPrice * 0.995;
                }
            }
        }
        lastPrice = it.last_close;
    });

    let last = items[items.length - 1].last_close;
    let last_earn = (last - buyInPrice) * 100;
    if (last_earn > 0) {
        console.log(jsonFile);
        console.log(`price from ${buyInPrice} to ${last}`);
        console.log(`stork deta = ${last_earn}`);
        console.log(`earn is ${earn}`);
        console.log(`earn ? = ${earn + last_earn}`);
    }
}

let filePath = `C:\\Users\\admin\\Documents\\stork_data\\storkData\\`;
fs.readdirSync(filePath).filter(_ => _.endsWith('.json')).forEach(j => {
    TestT(filePath + j);
})