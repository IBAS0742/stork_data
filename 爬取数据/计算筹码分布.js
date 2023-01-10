const {
    KRecordApi,
    CMFBApi
} = require('../utils/APIS');
const {
    dchange
} = require('../utils/others');
const {
    calcCmfb,
    sqlObj2Arr
} = require('../utils/cmfb');
const {
    runPromiseByArrReturnPromise,
    runPromiseWhenTrue,
    numberNexter,
    popArrWhen
} = require('../utils/others');
let code = require('./getCodes').getCodes();
// let code = require('../codes.json').filter(_ => {
//     let shsz = _.symbol.startsWith('SZ') || _.symbol.startsWith('SH');
//     if (shsz) {
//         shsz = _.symbol[2] === '0' || _.symbol[2] === '6';
//     }
//     return shsz;
// });
// console.log(`symbols len = ${code.length}`);
// code = popArrWhen(code,c => c.symbol === 'SH600630');
const fs = require('fs');
let calcLen = 150;



const ws = fs.createWriteStream(`./storkSql/cmfb/m.sql`, {
    fd: null,
    flags: 'w+',
    mode: 438,
    encoding: 'utf-8',
    start: 0,
    autoClose: true,
    highWaterMark: 2
})


const dfcfApi = new KRecordApi('8088');
const cmfbApi = new CMFBApi('8078');

const requestLen = 120 + calcLen + 1;
function calcAndSaveDb(symbol) {
    return dfcfApi.querydfcfKRecordOrderByTimeLimit(symbol,requestLen)
        .then(ret => ret.map(_=> {
            return {
                ..._,
                time: +_.time
            }
        }).reverse())
        .then(ret => {
            ret = ret.map(sqlObj2Arr);
            // if (ret.length == requestLen) {
            //     return new Promise(s => s());
            // }
            return new Promise(s => {
                // 直插数据库
                // let nNexter = numberNexter(ret.length - 1,-1);
                // runPromiseWhenTrue(ind => {
                //     let o = calcCmfb(ret,ind);
                //     return cmfbApi.insertkCMFB(`${symbol}_${ret[ind][0]}`,symbol,ret[ind][0],o.benefitPart,o.avgCost,
                //         o.percentChips['70'].concentration,o.percentChips['70'].priceRange[0],o.percentChips['70'].priceRange[1],
                //         o.percentChips['90'].concentration,o.percentChips['90'].priceRange[0],o.percentChips['90'].priceRange[1],)
                // },nNexter,(_,ind) => {
                //     return ind > 0;
                // }).then(() => s());
                // 生成 sql 文件后插
                let sqls = [];
                for (let i = ret.length - calcLen - 1;i > 0 && i < ret.length;i++) {
                    let o = calcCmfb(ret,i);
                    sqls.push(cmfbApi.insertkCMFB2Sql(`${symbol}_${ret[i][0]}`,symbol,
                        ret[i][0],o.benefitPart,o.avgCost,
                        o.percentChips['70'].concentration,o.percentChips['70'].priceRange[0],o.percentChips['70'].priceRange[1],
                        o.percentChips['90'].concentration,o.percentChips['90'].priceRange[0],o.percentChips['90'].priceRange[1],
                    ));
                }
                sqls.forEach(s => {
                    ws.write(s + "\r\n");
                })
                // fs.writeFileSync(`./../storkSql/cmfb/${symbol}.sql`,sqls.join('\r\n'),'utf-8');
                s();
            });
        });
}
runPromiseByArrReturnPromise(obj => {
    return calcAndSaveDb(obj.symbol);
},code).then(() => {
    ws.end();
})