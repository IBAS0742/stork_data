const d = require('./codes.json');
const fs = require('fs');

let symbols = d.filter(dd =>
{
    return !fs.existsSync(`./storkData/${dd.symbol}.json`);
}).map(_ => {
    return {
        symbol: _.symbol
    }
});

// fs.writeFileSync(`new_codes.json`,JSON.stringify(symbols),'utf-8');
// console.log(symbols.length)

let lastOneIndex = 16;
let checklen = 200;
fs.readdirSync('./storkData').slice(lastOneIndex * checklen,(lastOneIndex + 1) * checklen).forEach((f,ind) => {
    // console.log(`lastOneIndex = ${ind}`);
    let json = require(`./storkData/${f}`);
    for (let i in json) {
        if (json[i]['error_description'] && json[i]['error_description'].length > 2) {
            console.log(f)
            break;
        }
    }
    delete json;
});
// fs.writeFileSync(`new_codes.json`,JSON.stringify(symbols),'utf-8');
// console.log(symbols.length)