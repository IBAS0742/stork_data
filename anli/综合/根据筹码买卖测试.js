const fs = require('fs');
const {
    Trade
} = require('./../../utils/trade')
const {
    FileAndServerApi
} = require('./../../utils/LoadData');
const {
    KRecordApi,
    CMFBApi
} = require('./../../utils/APIS');
const {
    dchange
} = require('./../../utils/others');

const cmfbApi = new CMFBApi('8078');
const kRecordApi = new KRecordApi('8088');

const symbol = 'SZ002382';
const tmpPath = './../../tmp/'

const trade = new Trade();
const storkFS = new FileAndServerApi(tmpPath);
storkFS.ServerPromise = () => kRecordApi.querydfcfKRecordRangeTime(symbol,null,null);
storkFS.FilePath = {
    fileName: `stork_${symbol}.json`,
    filePath: "./../../views/SimpleLine/kline.json",
    dearFileFn: _ => JSON.parse(_)/*.map(_ => {
        _.time = dchange.ts2ymd(_.time);
        return _;
    })*/
}
storkFS.autoPromise();
const cmfbFS = new FileAndServerApi(tmpPath);
cmfbFS.ServerPromise = () => cmfbApi.queryCMFBRangeTime(symbol,null,null);
cmfbFS.FilePath = {
    filePath: "./../../tmp/cmfb.json",
    dearFileFn: _ => JSON.parse(_),
    fileName: `cmfb_${symbol}.json`,
}
cmfbFS.autoPromise();

const echartPath = {
    kline: './../../views/SimpleLine/kline.json',
    line: './../../views/SimpleLine/line.json',
    ranges: './../../views/SimpleLine/range.json',
    saveKline(json) {
        fs.writeFileSync(echartPath.kline,JSON.stringify(json),'utf-8');
    },
    saveCmfb(ret) {
        const colors = ['#5470C6', '#91CC75', '#EE6666'];
        let opt = {
            xAxis: ret.map(_=>_.time),
            yAxis: [
                {
                    type: 'value',
                    name: '成本',
                    position: 'right',
                    alignTicks: true,
                    offset: 80,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: colors[1]
                        }
                    }
                },
                {
                    type: 'value',
                    name: '获利',
                    position: 'right',
                    alignTicks: true,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: colors[2]
                        }
                    },
                }
            ],
            series: [
                {
                    yAxisIndex:0,
                    name: '获利',
                    type: 'line',
                    data: ret.map(_=>+_.benefitPart)
                },
                {
                    name: '成本',
                    type: 'line',
                    yAxisIndex: 1,
                    data: ret.map(_=>+_.avgCost)
                }
            ]
        }
        fs.writeFileSync(echartPath.line,JSON.stringify(opt),'utf-8');
    },
    saveRange(o) {
        fs.writeFileSync(echartPath.ranges,JSON.stringify(o),'utf-8');
    }
}

storkFS.promise().then(klines => {
    cmfbFS.promise().then(ret => {
        return ret.map(obj => {
            return {
                ...obj,
                benefitPart: +obj.benefitPart / 1e8,
                avgCost: +obj.avgCost / 1e2,
                time: dchange.ts2ymd(obj.time)
            };
        });
    }).then(cmfb => {
        // console.log(klines);
        // console.log(cmfb);
        echartPath.saveKline(klines);
        echartPath.saveCmfb(cmfb);
        for (let i = 100;i < cmfb.length;i++) {
            // 筹码几乎全部亏损且当天没有涨停
            if (cmfb[i].benefitPart <= 0.02 && klines[i].rate < 0.1) {
                trade.addIn((+klines[i].low + +klines[i].high) / 2,i,cmfb[i].time);
                while (i < cmfb.length) {
                    let price = (+klines[i].low + +klines[i].high) / 2;
                    let r = trade.getEarn(price);
                    if (r > 1.5) {
                        trade.addOut(price,i,cmfb[i].time);
                        break;
                    }
                    if (r < 0.95) {
                        trade.addOut(price,i,cmfb[i].time);
                        break;
                    }
                    if (cmfb[i].benefitPart >= 0.80) {
                        trade.addOut(price,i,cmfb[i].time);
                        break;
                    }
                    i++;
                }
            }
        }
        echartPath.saveRange(trade.list);
        // console.log(JSON.stringify(trade.list,'','\t'));
        console.log(`trade.hold = ${trade.hold}`);
        console.log(`trade.earn = ${trade.earn}`);
        console.log(`trade.times = ${trade.list.length}`);
        console.log(`trade.times = ${trade.list.map(_=>_.earn)}`);
    });
});
