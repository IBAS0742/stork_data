const fs = require('fs');
const {
    KRecordApi,
    CMFBApi
} = require('./../../utils/APIS');
const {
    runPromiseByArrReturnPromise,
    runPromiseWhenTrue,
    numberNexter,
    popArrWhen
} = require('./../../utils/others');
const {
    dchange
} = require('./../../utils/others');

const cmfbApi = new CMFBApi('8078');
const storkApi = new KRecordApi('8088');

// const savePath = "./../../tmp/k.json"
const savePath = "./../../views/SimpleLine/kline.json"
const symbol = 'SH600115';

storkApi.querydfcfKRecordRangeTime(symbol)
.then(txt => {
    fs.writeFileSync(savePath,JSON.stringify(txt));
})