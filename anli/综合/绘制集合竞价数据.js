const fs = require('fs');
const {
    get
} = require('./../../utils/Ajax');
const {
    JHJJApi
} = require('./../../utils/APIS');
const {
    dchange
} = require("../../utils/others");

let symbol = '000887';
const date = '2022-06-02';
// const source = 'realtime';
const source = 'db';
const buildOptions = out => {
    let date = dchange.ts2ymd(out[0].time);
    let fromTime = dchange.ymdhms2ts(`${date} 09:15:00`);
    let toTime = dchange.ymdhms2ts(`${date} 09:25:05`);
    let ind = 0;
    let newOut = [];
    for (let i = fromTime;i < toTime;i += 1000 * 10) {
        if (ind < out.length) {
            if (out[ind].time <= i) {
                while ( ind < out.length && out[ind].time <= i) {
                    newOut.push({
                        ...out[ind],
                        time: out[ind].time, //dchange.ts2ymdhms(out[ind].time)
                    });
                    ind++;
                }
            } else {
                newOut.push({
                    time: i, //dchange.ts2ymdhms(out[ind].time)
                    price: null,
                    volume: 0,
                    dimension: 2,
                    bidask: 0,
                })
            }
        } else {
            newOut.push({
                time: i, //dchange.ts2ymdhms(out[ind].time)
                price: null,
                volume: 0,
                dimension: 2,
                bidask: 0,
            })
        }
    }
    return _buildOptions(
        newOut
    );
};
const _buildOptions = out => {
    let times = [];
    let price = [];
    let vols = [];
    let asks = [];
    let vMax = 0;
    let aMax = 0;
    let pMax = 0;
    let pMin = 1e8;
    out.forEach((str,ind) => {
        times.push(dchange.ts2ymdhms(str.time).replace('T', '\n'));
        price.push(str.price);
        if (price[ind] && pMax < price[ind]) {
            pMax = price[ind];
        }
        if (price[ind] && pMin > price[ind]) {
            pMin = price[ind];
        }
        vols.push([ind,+str.volume,str.direction - 2]);
        asks.push([ind,+str.bidask,str.direction - 2]);
        if (vols[ind][1] && vols[ind][1] > vMax) {
            vMax = vols[ind][1];
        }
        if (vols[ind][1] && asks[ind][1] > aMax) {
            aMax = asks[ind][1];
        }
    });
    let option = {
        title: {
            text: `${symbol}\t集合竞价`
        },
        grid: {
            bottom: 80,
            right: 200,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            }
        },
        legend: {
            // data: ['股价', '竞价量','未匹配量'],
        },
        dataZoom: [
            {
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                axisLine: { onZero: false },
                // prettier-ignore
                data: times,
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis: [
            {
                offset: 20,
                name: '股价(元)',
                type: 'value',
                min: pMin,
                max: pMax,
                splitLine: {
                    show: false
                }
            },
            {
                position: 'right',
                name: '竞价量(手)',
                type: 'value',
                min: 0,
                max: vMax * 2.1,
                offset: 100,
                splitLine: {
                    show: false
                }
            },
            {
                offset: 20,
                position: 'right',
                name: '未匹配量(手)',
                nameLocation: 'start',
                type: 'value',
                inverse: true,
                min: 0,
                max: aMax * 2.1,
                splitLine: {
                    show: false
                }
            }
        ],
        visualMap: [
            {
                show: false,
                seriesIndex: 1,
                dimension: 2,
                pieces: [
                    {
                        value: 1,
                        color: 'red'
                    },
                    {
                        value: 0,
                        color: 'black'
                    },
                    {
                        value: -1,
                        color: 'green'
                    }
                ]
            },
            {
                show: false,
                seriesIndex: 2,
                dimension: 2,
                pieces: [
                    {
                        value: 1,
                        color: 'red'
                    },
                    {
                        value: 0,
                        color: 'black'
                    },
                    {
                        value: -1,
                        color: 'green'
                    }
                ]
            }
        ],
        series: [
            {
                name: '股价',
                type: 'line',
                data: price,
                smooth: true,
                showSymbol: false,
                connectNulls: true,
            },
            {
                yAxisIndex: 1,
                name: '竞价量',
                type: 'pictorialBar',
                data: vols,
                barWidth: '100%',
                symbol: 'rect',
            },
            {
                name: '未匹配量',
                type: 'pictorialBar',
                yAxisIndex: 2,
                data: asks,
                barWidth: '100%',
                symbol: 'rect',
            }
        ]
    };
    // console.log(option);
    return option;
};
let buildUrl = (symbol,fromtime,totime) => {
    return `http://localhost:8765?name=getk&symbol=${symbol}&fromtime=${fromtime}&totime=${totime}`;
};
const jhjj = new JHJJApi();

if (source === 'realtime') {
    get(buildUrl(symbol,`${date} 09:15:00`,`${date} 09:26:00`)).then(o => {
        o = o.map(oo => {
            let direction = 2;
            let bidask = 0;
            if (oo.quotes[1].askVolume) {
                bidask = oo.quotes[1].askVolume;
                direction = 1;
            } else if (oo.quotes[1].bidVolume) {
                bidask = oo.quotes[1].bidVolume;
                direction = 3;
            }
            return {
                time: dchange.ymdhms2ts(oo.createdAt.split('+')[0]),
                price: oo.quotes[0].bidPrice,
                volume: oo.quotes[0].bidVolume,
                direction,
                bidask
            }
        });
        fs.writeFileSync(`./../../views/echarts/option.json`,JSON.stringify(buildOptions(JSON.parse(o))),'utf-8');
    });
} else {
    if (symbol.length === 6) {
        if (symbol[0] === '6') {
            symbol = `SH${symbol}`;
        } else {
            symbol = `SZ${symbol}`;
        }
    }
    // console.log()
    jhjj.queryJHJJRangeTime(symbol,dchange.ymdhms2ts(`${date} 09:15:00`),dchange.ymdhms2ts(`${date} 09:26:00`)).then(o => {
        // console.log(o);
        o = o.map(_=>{
            return {
                ..._,
                price: _.price / 100,
                time: +_.time,
                // time: dchange.ts2ymdhms(+_.time)
            };
        });
        fs.writeFileSync(`./../../views/echarts/option.json`,JSON.stringify(buildOptions(o)),'utf-8');
    });
}
