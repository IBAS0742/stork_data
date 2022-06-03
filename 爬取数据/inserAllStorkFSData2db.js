const {
    Api
} = require('../utils/insertIntoDb');
const {
    runPromiseByArrReturnPromise,
    popArrWhen
} = require('../utils/others');
const fs = require('fs');
const waitTime = 0;
const map = require('../db/fs/map.json');
const jsonPath = './../storkSql/fs_source';
for (let i in map) {
    map[i].forEach(symbol => map[symbol] = +i + 1);
}
const writeOutPath = symbol => {
    console.log(symbol);
    return `./../storkSql/${map[symbol]}/${symbol}_${(new Date().getTime())}.sql`;
};
let api = new Api(8099);
let files = popArrWhen(fs.readdirSync(jsonPath).filter(_=>_.endsWith('.json')),_ => _=== 'SZ301129.json');

console.log(`len = ${files.length}`);

for (let i = 1;i < 49;i++) {
    let dir = `./../storkSql/${i}`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
}

function buildSql() {
    const file2Sql = f => {
        let json = JSON.parse(fs.readFileSync(jsonPath + '/' + f));
        let arr = [];
        let symbol = f.substring(0,8);
        for (let i in json) {
            arr = [
                ...arr,
                ...json[i].data.items.map(o => {
                    return {
                        ...o,
                        time: i
                    }
                })
            ];
        }
        fs.writeFileSync(writeOutPath(symbol),arr.map(item => {
            return `insert or ignore into recordFS(id,symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current) values(\"${[symbol + item.timestamp,symbol,item.time,item.timestamp,item.amount,item.percent,item.chg,item.avg_price,item.volume,item.current].join('\",\"')}\");`
        }).join('\r\n'),'utf-8');
    };
    files.forEach(file2Sql);
}
buildSql();

