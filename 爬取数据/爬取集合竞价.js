const fs = require('fs');
const path = require('path');
const {
    get
} = require('../utils/Ajax');
const codes = require('./allcode.json').filter(_=> {
    let sym = _.code;
    return (sym[2]==='0' || sym[2]==='6') && !(_.name.startsWith('*ST') || _.name.startsWith('ST'));
}).map(_=>_.code);
// const codes = require('../codes.json').filter(_=> {
//     let sym = _.symbol;
//     return (sym[2]==='0' || sym[2]==='6') && !(_.name.startsWith('*ST') || _.name.startsWith('ST'));
// }).map(_=>_.symbol);
// const codes = (function () {
//     const codes = require('../codes.json').filter(_=> {
//         let sym = _.symbol;
//         return (sym[2]==='0' || sym[2]==='6') && !(_.name.startsWith('*ST') || _.name.startsWith('ST'));
//     }).map(_=>_.symbol);
//     const otherCodes = require('./allcode.json').filter(_=> {
//         let sym = _.code;
//         return (sym[2]==='0' || sym[2]==='6') && !(_.name.startsWith('*ST') || _.name.startsWith('ST'));
//     }).map(_=>_.code);
//     let newCodes = [];
//     for (let i = 0;i < otherCodes.length;i++) {
//         if (codes.indexOf(otherCodes[i]) === -1) {
//             newCodes.push(otherCodes[i]);
//         }
//     }
//     return newCodes;
// })();
const {
    runPromiseByArrReturnPromise,
    dchange,
} = require('../utils/others');
const savePath = `./../storkSql/jhjj/`

let date = [
    `2022-06-06`,
];

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
// codes.pop();
// let codes = [
//     'SZ001234'
// ]
runPromiseByArrReturnPromise(symbol => {
    let sqls = [];
    return runPromiseByArrReturnPromise(oneDate => {
        return get(buildUrl(symbol.substring(2),`${oneDate} 09:15:00`,`${oneDate} 09:26:00`)).then(o => {
            console.log(`${symbol}\t${oneDate}`);
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
        });
    },JSON.parse(JSON.stringify(date))).then(_ => {
        fs.writeFileSync(path.join(savePath,symbol + '.sql'),sqls.join('\r\n'),'utf-8');
    });
},codes);





