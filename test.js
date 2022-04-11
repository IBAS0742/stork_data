// const d = require('./codes.json');
// const fs = require('fs');
//
// console.log(d.length)
//
// let filePath = `C:\\Users\\admin\\Documents\\stork_data\\storkData\\`;
// let symbols = d.filter(dd =>
// {
//     return !fs.existsSync(`${filePath}${dd.symbol}.json`);
// }).map(_ => {
//     return {
//         symbol: _.symbol
//     }
// });

// fs.writeFileSync(`new_codes.json`,JSON.stringify(symbols),'utf-8');
// console.log(symbols.length)

// let lastOneIndex = 16;
// let checklen = 200;
// fs.readdirSync('./storkData').slice(lastOneIndex * checklen,(lastOneIndex + 1) * checklen).forEach((f,ind) => {
//     // console.log(`lastOneIndex = ${ind}`);
//     let json = require(`./storkData/${f}`);
//     for (let i in json) {
//         if (json[i]['error_description'] && json[i]['error_description'].length > 2) {
//             console.log(f)
//             break;
//         }
//     }
//     delete json;
// });
// fs.writeFileSync(`new_codes.json`,JSON.stringify(symbols),'utf-8');
// console.log(symbols.length)

const fs = require('fs');
const codes = {};
let d = require('./result.json');
require('./codes.json').forEach(c => {
    codes[c.symbol] = c.name;
});
// {"file":"C:\\Users\\admin\\Documents\\stork_data\\storkData\\SH600007.json","buyInPrice":12.09,"last":16.64,"earn":108.33559999999999,"deta":563.3356}
d = d.filter(_ => _.buyInPrice > 0.1).map(_ => {
    let code = _.file.split('\\')[6].substring(0,8);
    if (code[2] !== '0' && code[2] !== '6') {
        return ``;
    } else {
        if (_.last < 25) {
            return `${_.file},${code},${_.buyInPrice},${_.last},${_.earn},${_.deta},${_.deta / _.buyInPrice}`;
        }
    }
}).filter(_ => _);
fs.writeFileSync('result.csv',`file,code,buyInPrice,last,earn,deta,rate,\r\n` + d.join('\r\n'),'utf-8');