const fs = require('fs');
const {
    get
} = require('./utils/Ajax');
const {
    Task
} = require('./utils/Task');
const {
    option
} = require('./utils/getOption');
const {
    shiftArrWhen
} = require('./utils/others');

const waitTime = 10;
const times = [
    1651766400000,
];

const getUrl = (code,time) => {
    let url = `https://stock.xueqiu.com/v5/stock/chart/minute_history.json?symbol=${code}&timestamp=${time}`;
    // console.log(url);
    return url;
};

const timeLen = times.length;
const codes = require('./codes.json');
// const codes = shiftArrWhen(require('./codes.json'),_ => _.symbol === 'SZ301059');
console.log(`codes length = ${codes.length}`);

// let arr = [];
// let saveTime = (new Date().getTime());
const downloadStorkDatas = function () {
    let codePromise = function (code) {
        // let file = `./storkData/${code.symbol}.json`;
        /*if (fs.existsSync(file)) {
            return new Promise(s => s({}));
        } else {*/
            const t = JSON.parse(JSON.stringify(times));
            let reqTime = 0;
            const oneStorkDatas = {};
            return new Promise(s => {
                new Task(time => {
                    reqTime++;
                    console.log(reqTime * 100 / timeLen);
                    return get(getUrl(code.symbol,time),option).then(dataText => {
                        let json = JSON.parse(dataText);
                        if (json.error_description.length !== 0) {
                            console.log(json.error_description);
                            setTimeout(() => {
                                process.exit(-1);
                            },5000);
                        }
                        oneStorkDatas[time] = json;
                        return {};
                    });
                },t,waitTime,() => {
                    console.log(`${code.symbol} over`);
                    // fs.writeFileSync(file,JSON.stringify(oneStorkDatas),'utf-8');
                    // s({});
                    let symbol = code.symbol;
                    // for (let i in oneStorkDatas) {
                    //     arr = [
                    //         ...arr,
                    //         ...oneStorkDatas[i].data.items.map(o => {
                    //             return {
                    //                 ...o,
                    //                 time: i,
                    //                 symbol: code.symbol
                    //             }
                    //         })
                    //     ];
                    // }
                    fs.writeFileSync(`./storkData/fs/${symbol}.json`,JSON.stringify(oneStorkDatas),'utf-8');
                    // if (arr.length >= 6e4) {
                    //     saveTime++;
                    //     fs.writeFileSync(`./storkSql/${saveTime}.sql`,arr.map(item => {
                    //         return `insert or ignore into recordFS(id,symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current) values(\"${[item.symbol + item.timestamp,item.symbol,item.time,item.timestamp,item.amount,item.percent,item.chg,item.avg_price,item.volume,item.current].join('\",\"')}\");`
                    //     }).join('\r\n'),'utf-8');
                    //     arr = [];
                    //     console.log(`save ${saveTime} times`);
                    // }
                    s();
                })
                    .run();
            });
        /*}*/
    };
    new Task(codePromise,codes,waitTime,() => {
        console.log('all over');
    })
        .setRunOver(() => {
            // if (arr.length) {
            //     fs.writeFileSync(`./storkSql/sq/${f}.sql`,arr.map(item => {
            //         return `insert or ignore into recordFS(id,symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current) values(\"${[symbol + item.timestamp,symbol,item.time,item.timestamp,item.amount,item.percent,item.chg,item.avg_price,item.volume,item.current].join('\",\"')}\");`
            //     }).join('\r\n'),'utf-8');
            // }
        })
        .run();
};
downloadStorkDatas();

// const testGetStorkData = function () {
//     get(getUrl(codes))
// };
