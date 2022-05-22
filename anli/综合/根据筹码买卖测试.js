const fs = require('fs');
const {
    k_cm_promise
} = require('./k_cm');
const {
    Trade
} = require('./../../utils/trade')
const {
    More
} = require('./../../utils/others');

const symbol = 'SH603557';

const trade = new Trade();

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

const more = new More(60,(a,b) => a > b);

k_cm_promise(symbol).then(({cmfb,klines}) => {
    // console.log(klines);
    // console.log(cmfb);
    echartPath.saveKline(klines);
    echartPath.saveCmfb(cmfb);
    let top = 0;
    for (let i = 100;i < cmfb.length;i++) {
        let currentHigh = klines[i - 1].high;
        more.add(currentHigh);
        // 筹码几乎全部亏损且当天没有涨停
        if (cmfb[i].benefitPart <= 0.02 && klines[i].rate < 0.1/* && more.current * 0.9 >= currentHigh*/) {
            trade.addIn((+klines[i].low + +klines[i].high) / 2,i,cmfb[i].time);
            i++;
            while (i < cmfb.length) {
                let price = (+klines[i].low + +klines[i].high) / 2;
                let r = trade.getEarn(price);
                if (r > 1.2) {
                    trade.addOut(price,i,cmfb[i].time,'20% up');
                    break;
                }
                // if (r < 0.95) {
                //     trade.addOut(price,i,cmfb[i].time);
                //     break;
                // }
                if (cmfb[i].benefitPart >= 0.80) {
                    trade.addOut(price,i,cmfb[i].time,'80% people earn');
                    break;
                }
                if (price >= more.current) {
                    trade.addOut(price,i,cmfb[i].time,'return high');
                    break;
                }
                i++;
            }
            // currentHigh = klines[i - 1].high;
            // more.add(currentHigh);
        }
    }
    echartPath.saveRange(trade.list);
    // console.log(JSON.stringify(trade.list,'','\t'));
    console.log(`trade.hold = ${trade.hold}`);
    console.log(`trade.earn = ${trade.earn}`);
    console.log(`trade.times = ${trade.list.length}`);
    console.log(`trade.times = ${trade.list.map(_=>_.earn)}`);
})
