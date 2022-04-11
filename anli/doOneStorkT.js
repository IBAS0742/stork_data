// 尝试做 T ，这里是假设最佳的情况，已经通过上帝模式看到一整天的情况了
const {formatDatas} = require("./formatDatas");
const fs = require('fs');

const doOneStorkT = (jsonFile,withLines) => {
    const data = JSON.parse(fs.readFileSync(jsonFile,'utf-8'));
    let colLines = {
        lines: {},
        add(date,line) {}
    };
    if (withLines) {
        colLines.add = (data,inInd,outInd,upLastClose) => {
            colLines.lines[data.date] = {
                ...data,
                inInd,
                outInd,
                upLastClose,
            };
        }
    }
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
                // console.log(it.date)
            } else {
                if (buyInPrice === -1) {
                    earn = 0;
                    buyInPrice = it.high;
                } else {
                    let inPriceInd = -1;
                    let outPriceInd = -1;
                    let inPrice = -1;
                    let outPrice = -1;
                    let low = 1e100;
                    let high = -1e100;
                    let _ind = -1;
                    it.items.map(i => {
                        let p = i.current;
                        low = low > p ? p : low;
                        high = high > p ? high : p;
                        return p;
                    }).forEach((p,ind) => {
                        if (inPrice === -1 && p === low) {
                            inPrice = p;
                            inPriceInd = ind;
                            for (_ind = ind - 2;_ind < 0;_ind++);
                            for (;_ind < ind + 2 && _ind < it.length;_ind++) {
                                let pp = it[_ind];
                                if (pp.current > inPrice) {
                                    inPrice = pp.current;
                                    inPriceInd = _ind;
                                }
                            }
                        }
                        if (outPrice === -1 && p === high) {
                            outPrice = p;
                            outPriceInd = ind;
                            for (_ind = ind - 2;_ind < 0;_ind++);
                            for (;_ind < ind + 2 && _ind < it.length;_ind++) {
                                let pp = it[_ind];
                                if (pp.current < outPrice) {
                                    outPrice = pp.current;
                                    outPriceInd = _ind;
                                }
                            }
                        }
                    });
                    earn += outPrice * 0.995 - inPrice * 0.995;
                    colLines.add(it,inPriceInd,outPriceInd,lastPrice)
                }
            }
        }
        lastPrice = it.last_close;
    });

    let lastItem = items[items.length - 1];
    if (!lastItem || !lastItem.last_close) {
        return false;
    }
    let last = lastItem.last_close;
    let last_earn = (last - buyInPrice) * 100;
    if (last_earn > 0) {
        // console.log(jsonFile);
        // console.log(`price from ${buyInPrice} to ${last}`);
        // console.log(`stork deta = ${last_earn}`);
        // console.log(`earn is ${earn}`);
        // console.log(`earn ? = ${earn + last_earn}`);
        return {
            file: jsonFile,
            buyInPrice,
            last,
            earn,
            deta: earn +last_earn,
            lines: colLines.lines
        }
    } else {
        return false;
    }
}

module.exports = {
    doOneStorkT
}