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
    jgin = jgin.map(_=>parseInt(_));
    jgout = jgout.map(_=>parseInt(_));
    yzin = yzin.map(_=>parseInt(_));
    yzout = yzout.map(_=>parseInt(_));
    let jgBuyin = [];
    let jgSaleout = [];
    let yzBuyin = [];
    let yzSaleout = [];
    let jgDeta = [];
    let yzDeta = [];
    mergeToList(jgBuyin,jgin);
    mergeToList(jgSaleout,jgout);
    mergeToList(yzBuyin,yzin);
    mergeToList(yzSaleout,yzout);
    let len = jgout.length;
    for (let i = 0;i < len;i++) {
        jgDeta.push(jgBuyin[i] - jgSaleout[i]);
        yzDeta.push(yzBuyin[i] - yzSaleout[i]);
    }
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
                position: 'right',
                type: 'value',
                name: '加和',
                offset: 10,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: 'blue'
                    }
                },
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
                name: '机构差值',
                type: 'line',
                yAxisIndex: 0,
                data: jgDeta
            },
            {
                name: '游资差值',
                type: 'line',
                yAxisIndex: 0,
                data: yzDeta
            },
            {
                name: '机构买入总和',
                type: 'line',
                yAxisIndex: 1,
                data: jgBuyin
            },
            {
                name: '机构买出总和',
                type: 'line',
                yAxisIndex: 1,
                data: jgSaleout
            },
            {
                name: '游资买入总和',
                type: 'line',
                yAxisIndex: 1,
                data: yzBuyin
            },
            {
                name: '游资买出总和',
                type: 'line',
                yAxisIndex: 1,
                data: yzSaleout
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
