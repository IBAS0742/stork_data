const {
    get
} = require('./utils/Ajax');
const {
    option
} = require('./utils/getOption');
const {
    runPromiseByArrReturnPromise,
    popArrWhen
} = require('./utils/others');
const {
    Api
} = require('./utils/insertIntoDb');
// const fs = require('fs');
const api = new Api(8091);

/**
 * 获取一个股票的某个日期的龙虎榜
 * @param storkCode     002761
 * @param timeStamp     1566316800 删除毫秒的时间戳 // 2022-03-23
 * @returns promise
 */
const getOneStorkDateData = (function () {
    let d = new Date();
    let zz = '00';
    let t2 = x => {
        x = x + '';
        return zz.substring(x.length) + x;
    }
    let ts2ymd = ts => {
        d.setTime(+(ts + '000'));
        return `${d.getFullYear()}-${t2(d.getMonth() + 1)}-${t2(d.getDate())}`
    }
    return (storkCode,timeStamp) => {
        return get(`https://eq.10jqka.com.cn/lhbclient/data/method/stockDateData/stockCode/${storkCode}/date/${ts2ymd(timeStamp)}/`,option);
    }
})();

/**
 * 获取一个股票龙虎榜的日期
 * @param storkCode     002761
 * @returns promise
 */
const getOneStorkDate = storkCode => {
    return get(`https://eq.10jqka.com.cn/lhbclient/data/method/stockDateList/stockCode/${storkCode}/`,option);
};

/**
 * 获取最近的上榜记录
 * @returns promise
 */
const getOneDayData = () => {
    return get(`https://eq.10jqka.com.cn/lhbclient/data/method/indexData/`,option);
}

/**
 * 保存到数据库中
 * @param obj   getOneStorkDateData 返回的内容
 * @param code  代号
 * @param day   日期
 * */
const saveToDb = (obj,code,day) => {
    let raw = obj.data.dateList.map((dl,ind) => {
        return [
            ...dl.buyData.list.map(o => {
                return {
                    ...o,
                    dir: 'buy',
                    ind: ind
                }
            }),
            ...dl.saleData.list.map(o => {
                return {
                    ...o,
                    dir: 'sale',
                    ind: ind
                }
            }),
        ]
    }).flatMap(_ => _);
    return runPromiseByArrReturnPromise((item,ind) => {
        item.departmentIcon = item.departmentIcon || 'other';
        if (item.id === "JGZY") {
            item.departmentIcon = "机构专用";
        }
        // id : symbol + time + rand + dir + ind
        return api.insertRecordYZRow(`${code}-${day}-${ind}-${item.dir}-${item.ind}`,code,day,item.name,item.buy,item.sale,item.departmentIcon,item.succ,item.dir,item.ind);
    },raw);
};

/**
 * 确定是否可以去请求数据
 * @param symbol    代号
 * @param time      时间
 */
const checkToGetOneStorkDateData = (function () {
    const emptyPromise = () => new Promise(s => s());
    return (symbol,time) => {
        return api.checkYZRowBySymbolAndTime(symbol,time)
            .then(len => {
                if (len) {
                    console.log(`symbol = ${symbol}\ttime = ${time}\tlen = ${len}`);
                    return emptyPromise();
                } else {
                    return getOneStorkDateData(symbol,time)
                        .then(JSON.parse).then(o => {
                            return saveToDb(o,symbol,time);
                        });
                }
            })
    };
})();

function getAll() {
    return getOneDayData().then(JSON.parse).then(o => {
        return o.data.all.list.map(_ => _.stockCode);
    }).then(codes => {
        console.log(`codes.length = ${codes.length}`);
        return runPromiseByArrReturnPromise(code => {
            return getOneStorkDate(code).then(JSON.parse).then(o => {
                return o.data.dateList;
            }).then(days => {
                return runPromiseByArrReturnPromise(day => {
                    // return getOneStorkDateData(code,day)
                    //     .then(JSON.parse).then(o => {
                    //         return saveToDb(o,code,day);
                    // })
                    return checkToGetOneStorkDateData(code,day);
                },days,null,10);
            });
        },codes,/*popArrWhen(codes,code => code === '200613')*/null,1000);
    });
}

getAll();

// getOneStorkDateData('002761','1651075200').then(JSON.parse).then(o => {
//     fs.writeFileSync('./tmp.json',JSON.stringify(o),'utf-8');
//     return true;
// })

// const gosdd = {
//     "data": {
//         "dateList": [
//             {
//                 "reason": [
//                     "日跌幅偏离值达7%的证券"
//                 ],
//                 "buyData": {
//                     "total": "11377845.00",
//                     "list": [
//                         {
//                             "id": "f8fce05ccf38f3c3",
//                             "name": "平安证券股份有限公司湖南分公司",
//                             "buy": "2936620",
//                             "succ": "--",
//                             "sale": "0",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "158f312415eaec6b",
//                             "name": "华泰证券股份有限公司深圳后海中心路证券营业部",
//                             "buy": "2513430",
//                             "succ": "--",
//                             "sale": "0",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "6976b1a2168a7746",
//                             "name": "国信证券股份有限公司广州珠江东路证券营业部",
//                             "buy": "2202600",
//                             "succ": "--",
//                             "sale": "0",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "80ef81b94680b1a5",
//                             "name": "广发证券股份有限公司广州番禺环城东路证券营业部",
//                             "buy": "1950080",
//                             "succ": "--",
//                             "sale": "0",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "b936d7fa721412af",
//                             "name": "中航证券有限公司深圳华富路证券营业部",
//                             "buy": "1075350",
//                             "succ": "--",
//                             "sale": "0",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         }
//                     ],
//                     "date": "2022-04-29"
//                 },
//                 "saleData": {
//                     "total": "36252135.00",
//                     "list": [
//                         {
//                             "id": "730bac3d886298b9",
//                             "name": "浙商证券股份有限公司深圳分公司",
//                             "buy": "0",
//                             "succ": "--",
//                             "sale": "19274900",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "87a9a459adfffb16",
//                             "name": "万和证券股份有限公司广州环市东路证券营业部",
//                             "buy": "0",
//                             "succ": "--",
//                             "sale": "5696260",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "9d284dd75d360849",
//                             "name": "安信证券股份有限公司深圳深南大道证券营业部",
//                             "buy": "301205",
//                             "succ": "--",
//                             "sale": "4110400",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "8cd1ba19ffaca0c9",
//                             "name": "财通证券股份有限公司青岛分公司",
//                             "buy": "0",
//                             "succ": "--",
//                             "sale": "3674380",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "f6bd38dd5fd24193",
//                             "name": "国信证券股份有限公司深圳泰然九路证券营业部",
//                             "buy": "398575",
//                             "succ": "--",
//                             "sale": "3496220",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         }
//                     ],
//                     "date": "2022-04-29"
//                 },
//                 "isThree": 0
//             },
//             {
//                 "reason": [
//                     "连续三个交易日内,跌幅偏离值累计达20%的证券"
//                 ],
//                 "buyData": {
//                     "total": "18175795.00",
//                     "list": [
//                         {
//                             "id": "227f724da6c95e8e",
//                             "name": "中国银河证券股份有限公司深圳龙翔大道证券营业部",
//                             "buy": "4752000",
//                             "succ": "--",
//                             "sale": "0",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         },
//                         {
//                             "id": "6adc17f4436e38c",
//                             "name": "安信证券股份有限公司宁波车轿街证券营业部",
//                             "buy": "3978020",
//                             "succ": "--",
//                             "sale": "0",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         },
//                         {
//                             "id": "10357d22d14c73fa",
//                             "name": "中信建投证券股份有限公司萍乡建设东路证券营业部",
//                             "buy": "3942380",
//                             "succ": "--",
//                             "sale": "0",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         },
//                         {
//                             "id": "f8fce05ccf38f3c3",
//                             "name": "平安证券股份有限公司湖南分公司",
//                             "buy": "2972850",
//                             "succ": "--",
//                             "sale": "0",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         },
//                         {
//                             "id": "158f312415eaec6b",
//                             "name": "华泰证券股份有限公司深圳后海中心路证券营业部",
//                             "buy": "2513430",
//                             "succ": "--",
//                             "sale": "0",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         }
//                     ],
//                     "date": "2022-04-29"
//                 },
//                 "saleData": {
//                     "total": "51473542.00",
//                     "list": [
//                         {
//                             "id": "730bac3d886298b9",
//                             "name": "浙商证券股份有限公司深圳分公司",
//                             "buy": "0",
//                             "succ": "--",
//                             "sale": "26757500",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         },
//                         {
//                             "id": "5f473a5ef72b0348",
//                             "name": "中天证券股份有限公司深圳海岸城证券营业部",
//                             "buy": "0",
//                             "succ": "--",
//                             "sale": "7029400",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         },
//                         {
//                             "id": "85f241d5215a56bd",
//                             "name": "东莞证券股份有限公司东莞分公司",
//                             "buy": "17120",
//                             "succ": "--",
//                             "sale": "6382530",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         },
//                         {
//                             "id": "87a9a459adfffb16",
//                             "name": "万和证券股份有限公司广州环市东路证券营业部",
//                             "buy": "0",
//                             "succ": "--",
//                             "sale": "5696260",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         },
//                         {
//                             "id": "b8c666fe79e36eae",
//                             "name": "华林证券股份有限公司深圳泰然路证券营业部",
//                             "buy": "0",
//                             "succ": "--",
//                             "sale": "5607830",
//                             "departmentIcon": [],
//                             "capitalIcon": []
//                         }
//                     ],
//                     "date": "2022-04-29"
//                 },
//                 "isThree": 1
//             }
//         ],
//         "index": {
//             "price": "5.35",
//             "turnRate": "1.249",
//             "rise": "-9.933",
//             "famc": "4834950000"
//         },
//         "inflow": "-24874290.00",
//         "isThree": 0
//     },
//     "status_code": "0",
//     "status_msg": "ok"
// }

// const gosdd = {
//     "data": {
//         "dateList": [
//             {
//                 "reason": [
//                     "日涨幅偏离值达7%的证券"
//                 ],
//                 "buyData": {
//                     "total": "225930723.00",
//                     "list": [
//                         {
//                             "id": "15d99f92a89c14fe",
//                             "name": "华鑫证券有限责任公司宁波分公司",
//                             "buy": "71639400",
//                             "succ": "53.33",
//                             "sale": "0",
//                             "capitalIcon": [
//                                 "宁波解放南"
//                             ],
//                             "departmentIcon": [
//                                 "知名游资"
//                             ]
//                         },
//                         {
//                             "id": "ca2b62ef4f6b64c6",
//                             "name": "华泰证券股份有限公司台州中心大道证券营业部",
//                             "buy": "46911000",
//                             "succ": "44.44",
//                             "sale": "43093600",
//                             "capitalIcon": [],
//                             "departmentIcon": [
//                                 "知名游资"
//                             ]
//                         },
//                         {
//                             "id": "JGZY",
//                             "name": "机构专用",
//                             "buy": "39095600",
//                             "succ": "37.24",
//                             "sale": "48775200",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "9bd0ec8b3556fdee",
//                             "name": "华鑫证券有限责任公司湖州劳动路浙北金融中心证券营业部",
//                             "buy": "35472700",
//                             "succ": "56.25",
//                             "sale": "0",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "JGZY",
//                             "name": "机构专用",
//                             "buy": "31215400",
//                             "succ": "37.24",
//                             "sale": "17613700",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         }
//                     ],
//                     "date": "2022-04-28"
//                 },
//                 "saleData": {
//                     "total": "297314704.00",
//                     "list": [
//                         {
//                             "id": "58b6f4ffd3875f7c",
//                             "name": "国金证券股份有限公司厦门湖滨南路证券营业部",
//                             "buy": "710315",
//                             "succ": "40.35",
//                             "sale": "72675400",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "a32baf06db6969c6",
//                             "name": "华鑫证券有限责任公司深圳益田路证券营业部",
//                             "buy": "574220",
//                             "succ": 39.39,
//                             "sale": "66116500",
//                             "capitalIcon": [
//                                 "深圳帮"
//                             ],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "4c701d54d8b8d133",
//                             "name": "华泰证券股份有限公司无锡金融一街证券营业部",
//                             "buy": "312016",
//                             "succ": "26.67",
//                             "sale": "49040300",
//                             "capitalIcon": [
//                                 "苏南帮"
//                             ],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "JGZY",
//                             "name": "机构专用",
//                             "buy": "39095600",
//                             "succ": "37.24",
//                             "sale": "48775200",
//                             "capitalIcon": [],
//                             "departmentIcon": []
//                         },
//                         {
//                             "id": "ca2b62ef4f6b64c6",
//                             "name": "华泰证券股份有限公司台州中心大道证券营业部",
//                             "buy": "46911000",
//                             "succ": "44.44",
//                             "sale": "43093600",
//                             "capitalIcon": [],
//                             "departmentIcon": [
//                                 "知名游资"
//                             ]
//                         }
//                     ],
//                     "date": "2022-04-28"
//                 },
//                 "isThree": 0
//             }
//         ],
//         "index": {
//             "price": "27.95",
//             "turnRate": "20.406",
//             "rise": "9.996",
//             "famc": "13768100000"
//         },
//         "inflow": "-71383981.00",
//         "isThree": 0
//     },
//     "status_code": "0",
//     "status_msg": "ok"
// }