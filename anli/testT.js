const {
    formatDatas
} = require('./formatDatas');
const fs = require('fs');
// const codes = {};
// require('./codes.json').forEach(c => {
//     codes[c.symbol] = c.name;
// });
const {
    doOneStorkT
} = require('./doOneStorkT')

let filePath = `C:\\Users\\admin\\Documents\\stork_data\\storkData\\`;
let result = fs.readdirSync(filePath).filter(_ => _.endsWith('.json')).map(j => {
    return doOneStorkT(filePath + j);
}).filter(_ => _);
fs.writeFileSync('./../result.json',JSON.stringify(result),'utf-8');
// {"file":"C:\\Users\\admin\\Documents\\stork_data\\storkData\\SH600007.json","buyInPrice":12.09,"last":16.64,"earn":108.33559999999999,"deta":563.3356}

// result = result.filter(_ => _.buyInPrice > 0.1).map(_ => {
//     let code = _.file.split('\\')[6].substring(0,8);
//     if (code[2] !== '0' && code[2] !== '6') {
//         return ``;
//     } else {
//         if (_.last < 25) {
//             return `${_.file};${codes[code]};${_.buyInPrice};${_.last};${_.earn};${_.deta};${_.deta / _.buyInPrice}`;
//         }
//     }
// }).filter(_ => _);
// fs.writeFileSync('result.csv',`file,code,buyInPrice,last,earn,rate;\r\n` + d.join('\r\n'),'utf-8');