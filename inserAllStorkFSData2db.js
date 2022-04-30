const {
    Api
} = require('./utils/insertIntoDb');
const {
    runPromiseByArrReturnPromise
} = require('./utils/others');
const fs = require('fs');
const waitTime = 0;
const jsonPath = './storkData'
let api = new Api(8090);
let files = fs.readdirSync(jsonPath).filter(_=>_.endsWith('.json'));

runPromiseByArrReturnPromise(file => {
    let json = JSON.parse(fs.readFileSync(jsonPath + '/' + file));
    let arr = [];
    let symbol = file.substring(0,8);
    for (let i in json) {
        arr = [
            ...arr,
            ...json[i].data.items.map(o => {
                return {
                    ...o,
                    time: i
                }
            })
        ]
    }
    return runPromiseByArrReturnPromise(item => {
        return api.insertRecordFS(symbol,item.time,item.timestamp,item.amount,item.percent,item.chg,item.avg_price,item.volume,item.current);
    },arr,null,waitTime).then(() => {
        console.log('');
    })
},files,null,waitTime).then(() => {
    console.log('over')
});

