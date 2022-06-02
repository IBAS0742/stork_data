const fs = require('fs');
const path = require('path');
const {
    runPromiseByArrReturnPromise
} = require('./../../utils/others');
const symbols = require('./../../codes.json').map(_=>_.symbol);
const {
    FileAndServerApi
} = require('./../../utils/LoadData');
const {
    KRecordApi
} = require('./../../utils/APIS');

let kapi = new KRecordApi();

let tmpPath = `./../../tmp/datas/`;
let testData = `./../../tmp/test_data/`;
function getData(symbol) {
    const storkFS = new FileAndServerApi(tmpPath);
    storkFS.ServerPromise = () => kapi.querydfcfKRecordRangeTime(symbol,null,null);
    storkFS.FilePath = {
        fileName: `${symbol}.json`,
        filePath: `${tmpPath}${symbol}.json`,
        dearFileFn: _ => JSON.parse(_)/*.map(_ => {
        _.time = dchange.ts2ymd(_.time);
        return _;
    })*/
    }
    storkFS.autoPromise();
    return storkFS.promise()
}

let index = 0;
let deta = 0;
let tmp = [];
let rand_1 = () => Math.random() > 0.975;
let rand1 = () => Math.random() > 0.5;
runPromiseByArrReturnPromise(symbol => {
    return getData(symbol)
        .then(ret => {
            if (ret.length > 500) {
                return;
            }
            // {
            //   "id": "SZ001234_1652976000000",
            //   "symbol": "SZ001234",
            //   "time": "1652976000000",
            //   "open": "29.41",
            //   "close": "29.61",
            //   "high": "30.44",
            //   "low": "29.4",
            //   "ratePrice": "-1.23",
            //   "rate": "-0.37",
            //   "volume": "62763",
            //   "changeVolume": "187252031",
            //   "change": "23.54",
            //   "deta": "3.47"
            // }
            let len = ret.length - 5;
            let i = 0;
            for (;i < len;i++) {
                if (ret[i].rate < 0) {
                    break;
                }
            }
            console.log(`symbol = ${symbol}\tlen = ${len - i}`);
            for (i += 5;i < len;i++) {
                let save = false;
                let _tmp = [];
                if (ret[i].low === ret[i].high) {
                    continue;
                }
                let rate = ret[i + 5].low / ret[i].high;
                if (rate > 1.08 && rand1()) {
                    save = true;
                    deta++;
                } else if (rand_1()) {
                    save = true;
                    deta--;
                }
                if (save) {
                    for (let j = i - 5;j < i;j++) {
                        // _tmp = _tmp.concat([
                        //     ret[j].open,
                        //     ret[j].close,
                        //     ret[j].high,
                        //     ret[j].low,
                        //     ret[j].volume,
                        //     ret[j].changeVolume
                        // ]);
                        _tmp = _tmp.concat([
                            ret[j].rate,
                            (+ret[j].changeVolume) / (+ret[j].volume) / 100 / ret[j].open,
                            (ret[j].open - ret[j].close) / (ret[j].high - ret[j].low)
                        ]);
                    }
                    _tmp.push(rate);
                    tmp.push(_tmp);
                }
            }
            console.log(`deta = ${deta}`);
            if (tmp.length > 1000) {
                index++;
                fs.writeFileSync(path.join(testData,`${index}.txt`),tmp.map(_=>_.join(',')).join('\r\n'),'utf-8');
                tmp = [];
            }
        });
},symbols)
    .then(() => {
        console.log('end');
        if (tmp.length) {
            index++;
            fs.writeFileSync(path.join(testData,`${index}.txt`),tmp.map(_=>_.join(',')).join('\r\n'),'utf-8');
        }
    });








