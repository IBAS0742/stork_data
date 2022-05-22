const {
    Api
} = require('../../utils/insertIntoDb');
const {
    CMFBApi
} = require('../../utils/APIS');
const fs = require('fs');

const codes = require('../../codesMap.json');
const {dchange} = require("../../utils/others");

const cmfbApi = new CMFBApi(8091);
const kApi = new Api(8088);

// 获取最近一个时间段内的龙虎榜股票
const getLatestSymbol = function (time) {
    return cmfbApi.getAllSymbolFromTime(time).then(arr => {
        return arr.filter(o => {
            let sy = o.symbol;
            return (sy[0] === '0' || sy[0] === '6') && +o.ind === 0;
        });
    });
};
getLatestSymbol(dchange.ymd2ts('2022-4-01'))
    .then(arr => {
        // console.log(arr.map(_=>JSON.stringify(_)).join('\r\n'))
        let map = {};
        let abs = {};
        arr.forEach(o => {
            if (!(o.symbol in map)) {
                map[o.symbol] = {};
            }
            if (!(o.time in map[o.symbol])) {
                map[o.symbol][o.time] = [];
            }
            map[o.symbol][o.time].push(o);
        });
        for (let s in map) {
            abs[s] = [];
            for (let t in map[s]) {
                let buyInBuy        = 0;
                let buyInSale       = 0;
                let saleOutBuy      = 0;
                let saleOutSale     = 0;
                let jgBuyInBuy      = 0;
                let jgBuyInSale     = 0;
                let jgSaleOutBuy    = 0;
                let jgSaleOutSale   = 0;
                map[s][t].forEach(st => {
                    if (st.name === '机构专用') {
                        if (st.dir === 'sale') {
                            jgSaleOutBuy += +st.buy;
                            jgSaleOutSale += +st.sale;
                        } else {
                            jgBuyInBuy += +st.buy;
                            jgBuyInSale += +st.sale;
                        }
                    } else {
                        if (st.dir === 'sale') {
                            saleOutBuy += +st.buy;
                            saleOutSale += +st.sale;
                        } else {
                            buyInBuy += +st.buy;
                            buyInSale += +st.sale;
                        }
                    }
                });
                abs[s].push({
                    time: +(map[s][t][0].time + '000'),
                    buyInSale,
                    buyInBuy,
                    saleOutSale,
                    saleOutBuy,
                    jgBuyInBuy,
                    jgBuyInSale,
                    jgSaleOutBuy,
                    jgSaleOutSale,
                });
            }
            abs[s] = abs[s].sort((a,b) => a.time > b.time);
            abs[s] = abs[s].map(_ => {
                return {
                    ..._,
                    time: dchange.ts2ymd(_.time)
                };
            });
            // console.log(`symbol = ${s}`)
            // console.log(abs[s].map(_=>JSON.stringify(_)))
        }
        fs.writeFileSync('./../../views/大资金分析/result.json',JSON.stringify(abs,'','\t'),'utf-8');
    });