const data = require('./../storkData/SH600519.json');
const fs = require('fs');

for (let i in data) {
    if (data[i].data.items.length) {
        console.log(JSON.stringify(data[i]));
        fs.writeFileSync('./../tmp/a.json',JSON.stringify(data[i]),'utf-8');
        break;
    }
}