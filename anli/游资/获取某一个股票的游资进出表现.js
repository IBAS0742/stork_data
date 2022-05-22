const {
    Api
} = require('./../../utils/insertIntoDb');
const {
    CMFBApi
} = require('./../../utils/APIS');
const fs = require('fs');

const codes = require('./../../codesMap.json');
const {dchange} = require("../../utils/others");

const cmfbApi = new CMFBApi(8091);
const kApi = new Api(8088);

const tenDay = 3600 * 24 * 10 * 1000;

// 显示有资金异动的股票
const showStorks = function () {
    cmfbApi.getAllSymbol().then(sym => sym.map(_ => _.symbol).filter(_ => _[0] === '0' || _[0] === '6')).then(sym => {
        sym.forEach(s => {
            if (s[0] === '0') {
                s = `SZ` + s;
            } else {
                s = `SH` + s;
            }
            console.log(`${s} -- ${codes[s]}`);
        })
    })
}
// showStorks();

// 获取最近一个时间段内的龙虎榜股票
const getLatestSymbol = function (time) {
    cmfbApi.getAllSymbolFromTime(time)
        .then(obj => {
            let symbols = obj.map(_ => _.symbol);
            for (let i = 0;i < symbols.length;i += 5) {
                console.log(symbols.slice(i, i + 5).join('\t'));
            }
        })
}
// getLatestSymbol(dchange.ymd2ts('2022-5-12'));

/**
 * 查看一个股票资金异动 在 ind 为 0 部分的情况，仅仅分为 机构专用 和 游资 两个派别
 * @param symbol    股票名称
 * @param dear      处理函数，格式为
 *          function(result[],list[],symbol,fullSymbol) {
 *              result 游资信息
 *              list k 线信息
 *          }
 */
const showOneStork = function (symbol,dear) {
    let time = {};
    let result = [];
    let fullSymbol = (symbol[0] === '0' ? 'SZ':'SH') + symbol;
    cmfbApi.getAllDateBySymbol(symbol).then(ret => {
        let filter = {};
        ret.forEach(r => {
            if (!(r.time in time)) {
                time[r.time] = result.length;
                result.push({
                    time: r.time,
                    jg_in: 0,
                    jg_out: 0,
                    yz_in: 0,
                    yz_out: 0
                });
            }
            let ind = time[r.time];
            let id = `${r.name}_${r.time}_${r.buy}_${r.sale}`;
            if (filter[id]) {
                return;
            }
            filter[id] = true;
            if (r.name === "机构专用") {
                result[ind].jg_in += +r.buy;
                result[ind].jg_out += +r.sale;
            } else {
                result[ind].yz_in += +r.buy;
                result[ind].yz_out += +r.sale;
            }
        });
        result = result.sort((a,b) => a.time - b.time);
        // console.log(result);
        return result.map(r => {
            return {
                ...r,
                time: r.time + '000'
            }
        });
    })
        .then(result => {
            let d = new Date();
            console.log(+result[0].time - tenDay);
            console.log(+result[0].time);
            kApi.querydfcfKRecordRangeTime(fullSymbol,(+result[0].time - tenDay),/*result[result.length - 1].time*/d.getTime())
                .then(list => {
                    dear(result,list,symbol,fullSymbol);
                });
        });
}
const buildJSON = (result,list,symbol,fullSymbol) => {
    fs.writeFileSync('./../../views/KLine/title.json',JSON.stringify([symbol,fullSymbol,codes[fullSymbol]]),'utf-8');
    fs.writeFileSync('./../../views/KLine/kline.json',JSON.stringify(list,'','\t'),'utf-8');
    let time = {};
    result.forEach((r,ind) => {
        time[r.time] = ind;
    })
    result = list.map(l => {
        if (l.time in time) {
            return {
                ...result[time[l.time]]
            }
        } else {
            return {
                jg_in: 0,
                jg_out: 0,
                yz_in: 0,
                yz_out: 0,
            };
        }
    });
    fs.writeFileSync('./../../views/KLine/bar.json',`[
                        {
                            "name": "机构买入",
                            "type": "bar",
                            "stack": "buyin",
                            "data": [${result.map(_=>_.jg_in).join(',')}]
                        },
                        {
                            "name": "机构卖出",
                            "type": "bar",
                            "stack": "saleout",
                            "data": [${result.map(_=>_.jg_out).join(',')}]
                        },
                        {
                            "name": "游资买进",
                            "type": "bar",
                            "stack": "buyin",
                            "data": [${result.map(_=>_.yz_in).join(',')}]
                        },
                        {
                            "name": "游资卖出",
                            "type": "bar",
                            "stack": "saleout",
                            "data": [${result.map(_=>_.yz_out).join(',')}]
                        }
                    ]`,'utf-8');
};
showOneStork("002715",buildJSON);


`
SZ000056 -- 皇庭国际 
SZ000416 -- 民生控股 
SZ000585 -- *ST东电  
SZ000715 -- 中兴商业 
SZ000828 -- 东莞控股 
SZ000835 -- *ST长动  
SZ000839 -- 中信国安 
SZ001228 -- undefined
SZ001234 -- 泰慕士   
SZ001317 -- 三羊马   
SZ002192 -- 融捷股份
SZ002205 -- 国统股份
SZ002240 -- 盛新锂能
SZ002280 -- 联络互动
SZ002382 -- 蓝帆医疗
SZ002387 -- 维信诺
SZ002447 -- *ST晨鑫
SZ002561 -- 徐家汇
SZ002569 -- ST步森
SZ002693 -- 双成药业
SZ002783 -- 凯龙股份
SZ002789 -- 建艺集团
SZ002852 -- 道道全
SZ002864 -- 盘龙药业
SZ003019 -- 宸展光电
SZ003037 -- 三和管桩
SH600162 -- 香江控股
SH600449 -- 宁夏建材
SH600503 -- 华丽家族
SH600512 -- 腾达建设
SH600545 -- 卓郎智能
SH600758 -- 辽宁能源
SH600785 -- 新华百货
SH600792 -- 云煤能源
SH600818 -- 中路股份
SH600975 -- 新五丰
SH601099 -- 太平洋
SH603051 -- 鹿山新材
SH603066 -- 音飞储存
SH603157 -- *ST拉夏
SH603176 -- 汇通集团
SH603261 -- 立航科技
SH603329 -- 上海雅仕
SH603421 -- 鼎信通讯
SH603868 -- 飞科电器
SH603996 -- *ST中新
SH605138 -- 盛泰集团
SH605598 -- 上海港湾
SH688068 -- 热景生物
SH688091 -- 上海谊众-U
SH688111 -- 金山办公
SH688190 -- 云路股份
SH688529 -- 豪森股份
SH688800 -- 瑞可达
`
