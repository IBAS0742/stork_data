const {
    KRecordApi,
    CMFBApi
} = require('./utils/APIS');
const {
    dchange
} = require('./utils/others');
const {
    calcCmfb,
    sqlObj2Arr
} = require('./utils/cmfb');
const {
    runPromiseByArrReturnPromise,
    runPromiseWhenTrue,
    numberNexter,
    popArrWhen
} = require('./utils/others');
let code = require('./codes.json');
// code = popArrWhen(code,c => c.symbol === 'SH600630');
const fs = require('fs');
let calcLen = 10;


const dfcfApi = new KRecordApi('8088');
const cmfbApi = new CMFBApi('8078');

// const symbol = "SZ001234";


function calcAndSaveDb(symbol) {
    return dfcfApi.querydfcfKRecordOrderByTimeLimit(symbol,120 + calcLen + 1)
        .then(ret => ret.map(_=> {
            return {
                ..._,
                time: +_.time
            }
        }).reverse())
        .then(ret => {
            ret = ret.map(sqlObj2Arr);
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
                for (let i = ret.length - calcLen - 1;i < ret.length;i++) {
                    let o = calcCmfb(ret,i);
                    sqls.push(cmfbApi.insertkCMFB2Sql(`${symbol}_${ret[i][0]}`,symbol,
                        ret[i][0],o.benefitPart,o.avgCost,
                        o.percentChips['70'].concentration,o.percentChips['70'].priceRange[0],o.percentChips['70'].priceRange[1],
                        o.percentChips['90'].concentration,o.percentChips['90'].priceRange[0],o.percentChips['90'].priceRange[1],
                    ));
                }
                fs.writeFileSync(`./storkSql/cmfb/${symbol}.sql`,sqls.join('\r\n'),'utf-8');
                s();
            });
        });
}
runPromiseByArrReturnPromise(obj => {
    return calcAndSaveDb(obj.symbol);
},code)