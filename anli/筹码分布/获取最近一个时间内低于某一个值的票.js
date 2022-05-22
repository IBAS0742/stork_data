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
    ymd2ts
} = require('./../../utils/others');

const dfcfApi = new KRecordApi('8088');
const cmfbApi = new CMFBApi('8078');

cmfbApi.queryCMFBRangeTimeAndBenefitPart(0.0001,0.005,ymd2ts('2022-05-09'),null).then(ret => {
    // console.log(ret.length);
    let sy = new Array(...new Set(ret.map(r => r.symbol)));
    console.log(sy.length)
    console.log(sy)
})