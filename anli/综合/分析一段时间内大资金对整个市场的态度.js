const {
    dchange
} = require('./../../utils/others');
const {
    YZApi
} = require('../../utils/APIS');
const fs = require('fs');
// const codes = require('../../codesMap.json');

const yzApi = new YZApi(8091);
const mergeToList = (list,targetList) => {
    let m = 0;
    targetList.forEach((v,ind) => {
        if (list.length < ind + 1) {
            list.push(0);
        }
        list[ind] += v + m;
        m += v;
    });
    return list;
};
const options = (jgin,jgout,yzin,yzout,times) => {
    let buyin = [];
    let saleout = [];
    let deta = [];
    mergeToList(buyin,jgin);
    mergeToList(buyin,yzin);
    mergeToList(saleout,jgout);
    mergeToList(saleout,yzout);
    buyin.forEach((b,ind) => {
        deta.push(b - saleout[ind]);
    });
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {},
        dataZoom: [
            {
                show: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                start: 0,
                end: 100
            },
        ],
        yAxis: [
            {
                type: 'value',
                name: '日',
                axisLabel: {
                    formatter: '{value} ml'
                }
            },
            {
                type: 'value',
                name: '加和',
                interval: 5,
                axisLabel: {
                    formatter: '{value} °C'
                }
            }
        ],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: times
            }
        ],
        series: [
            {
                yAxisIndex: 0,
                name: '机构买入',
                type: 'bar',
                emphasis: {
                    focus: 'series'
                },
                data: jgin
            },
            {
                yAxisIndex: 0,
                name: '机构卖出',
                type: 'bar',
                emphasis: {
                    focus: 'series'
                },
                data: jgout
            },
            {
                yAxisIndex: 0,
                name: '游资买入',
                type: 'bar',
                emphasis: {
                    focus: 'series'
                },
                data: yzin
            },
            {
                yAxisIndex: 0,
                name: '游资卖出',
                type: 'bar',
                emphasis: {
                    focus: 'series'
                },
                data: yzout
            },
            {
                name: '差值',
                type: 'line',
                yAxisIndex: 0,
                data: deta
            },
            {
                name: '买入',
                type: 'line',
                yAxisIndex: 1,
                data: buyin
            },
            {
                name: '买出',
                type: 'line',
                yAxisIndex: 1,
                data: saleout
            }
        ]
    }
};

yzApi.getAllSymbolFromTime(0) // dchange.ymd2ts('2020-01-01')
    .then(arr => {
        // console.log(arr);
        var jgin = [0];
        var jgout = [0];
        var yzin = [0];
        var yzout = [0];
        var times = [];
        var time = 0;
        var ind = 0;
        arr = arr.map(_ => {
            return {
                ..._,
                time: +_.time
            }
        }).sort((a,b) => a.time - b.time);
        time = arr[0].time;
        times.push(dchange.ts2ymd(time + '000'));
        arr.forEach(a => {
            if (a.time !== time) {
                ind++;
                jgout.push(0);
                jgin.push(0);
                yzin.push(0);
                yzout.push(0);
                time = a.time;
                times.push(dchange.ts2ymd(time + '000'));
            }
            if (a.dir === 'sale') {
                if (a.tag === '机构专用') {
                    jgout[ind] += + a.sale;
                } else {
                    yzout[ind] += + a.sale;
                }
            } else {
                if (a.tag === '机构专用') {
                    jgin[ind] += + a.buy;
                } else {
                    yzin[ind] += + a.buy;
                }
            }
        });
        fs.writeFileSync('./../../views/echarts/option.json',JSON.stringify(options(jgin,jgout,yzin,yzout,times)),'utf-8');
    });
