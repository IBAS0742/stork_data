// 将一个股票通过 doOneStorkT 拉取出所有交易的 T 曲线
const {
    doOneStorkT
} = require('./doOneStorkT');
const fs = require('fs');

let lines = doOneStorkT('./../storkData/SH600809.json',true);
fs.writeFileSync('./../tmp/out.json',JSON.stringify(lines),'utf-8');