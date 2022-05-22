const {
    FileAndServerApi
} = require('./../../utils/LoadData');
const {
    KRecordApi,
    CMFBApi
} = require('./../../utils/APIS');
const {
    dchange
} = require("../../utils/others");

const k_cm_promise = function (symbol,tmpPath= './../../tmp/',cmfbPort='8078',kPort='8088') {
    const cmfbApi = new CMFBApi(cmfbPort);
    const kRecordApi = new KRecordApi(kPort);

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
    return storkFS.promise().then(klines => {
        return cmfbFS.promise().then(cmfb => {
            cmfb = cmfb.map(obj => {
                return {
                    ...obj,
                    benefitPart: +obj.benefitPart / 1e8,
                    avgCost: +obj.avgCost / 1e2,
                    time: dchange.ts2ymd(obj.time)
                };
            });
            return {
                klines,cmfb
            };
        });
    });
}

module.exports = {
    k_cm_promise
}