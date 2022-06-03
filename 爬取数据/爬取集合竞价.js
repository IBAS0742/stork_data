const fs = require('fs');
const path = require('path');
const {
    get
} = require('../utils/Ajax');
const codes = require('../codes.json').map(_=>_.symbol).filter(_=>_[2]==='0' || _[2]==='6');
const {
    runPromiseByArrReturnPromise,
    dchange,
} = require('../utils/others');
const savePath = `./../storkSql/jhjj/`

let date = `2022-06-02`;

// let oItem = {
//     "symbol": "SZSE.001228",
//     "createdAt": "2022-06-02T09:15:00+08:00",
//     "tradeType": 0,
//     "quotes": [
//         {
//             "bidPrice": 47.51,
//             "bidVolume": 800,
//             "askPrice": 47.51,
//             "askVolume": 800
//         },
//         {
//             "bidPrice": 0,
//             "bidVolume": 0,
//             "askPrice": 0,
//             "askVolume": 9200
//         },
//     ]
// }

let buildUrl = (symbol,fromtime,totime) => {
    return `http://localhost:8765?name=getk&symbol=${symbol}&fromtime=${fromtime}&totime=${totime}`;
};
runPromiseByArrReturnPromise(symbol => {
    return get(buildUrl(symbol.substring(2),`${date} 09:15:00`,`${date} 09:26:00`)).then(o => {
        let sqls = [];
        o = JSON.parse(o);
        o.forEach(oItem => {
            let time = dchange.ymdhms2ts(oItem.createdAt.split('+')[0].replace('T',' '));
            let direction = 2;
            let bidask = 0;
            if (oItem.quotes[1].bidVolume) {
                direction = 3;
                bidask = parseInt(oItem.quotes[1].bidVolume / 100);
            } else if (oItem.quotes[1].askVolume) {
                direction = 1;
                bidask = parseInt(oItem.quotes[1].askVolume / 100);
            }
            sqls.push(`insert into jhjj(id,symbol,time,direction,price,volume,bidask) values("${time}_${symbol}","${symbol}",${time},${direction},${parseInt(oItem.quotes[0].bidPrice * 100)},${oItem.quotes[0].bidVolume},${bidask});`);
        });
        fs.writeFileSync(path.join(savePath,symbol + '.sql'),sqls.join('\r\n'),'utf-8');
    });
},codes);





