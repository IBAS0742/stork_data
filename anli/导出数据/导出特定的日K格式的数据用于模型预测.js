const fs = require('fs');
const path = require('path');
const {
    runPromiseByArrReturnPromise
} = require('./../../utils/others');
// const symbols = require('./../../codes.json').map(_=>_.symbol);
const {
    FileAndServerApi
} = require('./../../utils/LoadData');
const {
    KRecordApi
} = require('./../../utils/APIS');

let kapi = new KRecordApi();

let tmpPath = `./../../tmp/datas/`;
let testData = `./../../views/Rnn/pred_data.txt`;
let strokData = './../../views/Rnn/stork.json'
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

let tmp = [];
const symbol = 'SH601872';
getData(symbol)
    .then(ret => {
        fs.writeFileSync(strokData,JSON.stringify(ret,),'utf-8');
        // if (ret.length > 500) {
        //     return;
        // }
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
        for (let i = 5;i < len;i++) {
            let _tmp = [];
            for (let j = i - 5;j < i;j++) {
                _tmp = _tmp.concat([
                    ret[j].open,
                    ret[j].close,
                    ret[j].high,
                    ret[j].low,
                    ret[j].volume,
                    ret[j].changeVolume
                ]);
            }
            tmp.push(_tmp);
        }
        fs.writeFileSync(testData,tmp.map(_=>_.join(',')).join('\r\n'),'utf-8');
    });


