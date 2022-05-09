const fs = require('fs');
const {
    KRecordApi,
    CMFBApi
} = require('./../../utils/APIS');
const {
    dchange
} = require('./../../utils/others');
const {
    calcCmfb,
    sqlObj2Arr
} = require('./../../utils/cmfb');

const cmfbApi = new CMFBApi('8078');
const storkApi = new KRecordApi('8088');

const savePath = "./../../tmp/cmfb.json"

const loadData = (kFrom,symbol,kFilePath,sourceFile) => {
    if (kFrom === 'server') {
        return storkApi.queryKRecordRangeTime(symbol).map(_ => sqlObj2Arr(_));
    } else if (kFrom === 'sourceFile') {
        return new Promise(s => {
            s(JSON.parse(fs.readFileSync(sourceFile,'utf-8')));
        });
    } else {
        return new Promise(s => {
            let ret = JSON.parse(fs.readFileSync(kFilePath,'utf-8'));
            s(ret.map(_ => sqlObj2Arr(_)));
        });
    }
};

function calcAllDate() {
    const ld = loadData('file','','./../../tmp/k.json');
    // const ld = loadData('sourceFile','','','./../../tmp/SH600115.json');
    // const ld = loadData('server','SH600115','');
    ld.then(klines => {
        // klines = klines.map(_ => sqlObj2Arr(_));
        const cmfb = [];
        for (let i = 0;i < klines.length;i++) {
            let o = calcCmfb(klines,i);
            cmfb.push({
                "id": `symbol_${klines[i][0]}`,
                "symbol": "symbol",
                "time": dchange.ts2ymd(+klines[i][0]),
                "benefitPart": o.benefitPart,
                "avgCost": o.avgCost,
                "sevenConcentration":   o.percentChips['70'].concentration,
                "sevenConcentrationRA": o.percentChips['70'].priceRange[0],
                "sevenConcentrationRB": o.percentChips['70'].priceRange[1],
                "nineConcentration":    o.percentChips['90'].concentration,
                "nineConcentrationRA":  o.percentChips['90'].priceRange[0],
                "nineConcentrationRB":  o.percentChips['90'].priceRange[1],
            });
        }
        fs.writeFileSync(savePath,JSON.stringify(cmfb),'utf-8');
    });
}
function calcOneDate() {
    const ld = loadData('file','','./../../tmp/k.json','');
    ld.then(klines => {
        // klines = klines;
        let i = 4773;
        // let i = 5697;
        let o = calcCmfb(klines,i);
        let time = klines[i][0];
        if (/^[0-9]+$/.test(time)) {
            time = dchange.ts2ymd(+time);
        }
        console.log({
            "id": `symbol_${klines[i][0]}`,
            "symbol": "symbol",
            "time": time,
            "benefitPart": o.benefitPart,
            "avgCost": o.avgCost,
            "sevenConcentration":   o.percentChips['70'].concentration,
            "sevenConcentrationRA": o.percentChips['70'].priceRange[0],
            "sevenConcentrationRB": o.percentChips['70'].priceRange[1],
            "nineConcentration":    o.percentChips['90'].concentration,
            "nineConcentrationRA":  o.percentChips['90'].priceRange[0],
            "nineConcentrationRB":  o.percentChips['90'].priceRange[1],
        });
    })
}
calcAllDate()