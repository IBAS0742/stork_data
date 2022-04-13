const fs = require('fs');
const codes = require('./../codes.json');
const mapping = {};
codes.forEach(code => {
    if (code.symbol[2] === '0' || code.symbol[2] === '6') {
        mapping[code.symbol] = code.name;
        mapping[code.name] = code.symbol;
    }
});
fs.writeFileSync(`./views/js/code.js`,`window.codeMapping = ${JSON.stringify(mapping)}`,'utf-8');