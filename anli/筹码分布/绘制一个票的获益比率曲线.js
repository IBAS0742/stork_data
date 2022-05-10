const fs = require('fs');
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

const symbol = 'SZ002382';
const tmpPath = './../../tmp/'
const cmfbFS = new FileAndServerApi(tmpPath);
cmfbFS.ServerPromise = () => cmfbApi.queryCMFBRangeTime(symbol,null,null).then(ret => {
    ret.benefitPart = ret.map(_=>+_.benefitPart / 1e8)
    ret.avgCost = ret.map(_=>+_.avgCost / 1e2)
    ret.time = ret.map(_=>dchange.ts2ymd(_.time));
    return ret;
});
cmfbFS.FilePath = {
    filePath: "./../../tmp/cmfb.json",
    dearFileFn: _ => JSON.parse(_),
    fileName: `cmfb_${symbol}.json`,
}
cmfbFS.autoPromise();

cmfbFS.promise().then(ret => {
    return ret.map(obj => {
        return {
            ...obj,
            benefitPart: +obj.benefitPart / 1e8,
            avgCost: +obj.avgCost / 1e2,
            time: dchange.ts2ymd(obj.time)
        };
    });
}).then(ret => {
    // console.log(ret.length);

    const colors = ['#5470C6', '#91CC75', '#EE6666'];
    let option = {
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
    };
    fs.writeFileSync('./../../views/SimpleLine/line.json',JSON.stringify(option),'utf-8');
});