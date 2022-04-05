const fs = require('fs');
const {
    get
} = require('./utils/Ajax');
const {
    Task
} = require('./utils/Task');
const {
    option
} = require('./utils/getOption')

const getUrl = page => {
    return `https://stock.xueqiu.com/v5/stock/screener/quote/list.json?type=sh_sz&order_by=percent&order=desc&market=cn&page=${page}&size=50&cancelToken=%7B%22promise%22:%7B%7D%7D&_t=PC-29d3b672-8757-46b0-9d0c-7502e4ebba39.2200046834.1648550893383.1648560867160`
};

const downloadStorkCodes = function() {
    // {
//     "data": {
//         "list": []
//     },
//     "error_code":0,
//     "error_description":""
// }
    let list = (function (){
        let p = [];
        for (let i = 1;i < 99;i++) {
            p.push(i);
        }
        return p;
    })();
    let task = new Task((page,info) => {
        if (`next` in info) {
            info.next = true;
        }
        if (info.next === false) {
            return new Promise(s => {
                s(info);
            })
        } else {
            console.log(`page = ${page}`);
            return get(getUrl(page),option).then(JSON.parse).then(obj => {
                fs.writeFileSync(`./tmp/${page}.json`,JSON.stringify(obj),'utf-8');
                if (obj.data.list.length) {
                    return {
                        next: true
                    };
                } else {
                    return {
                        next: false
                    }
                }
            });
        }
    },list,1000,() => {
        console.log('over');
    });
    task.run();
}
// downloadStorkCodes();

const mergeStorkCodes = function () {
    let arr = [];
    fs.readdirSync('./tmp').forEach(f => {
        let json = require(`./tmp/${f}`);
        arr.push(json.data.list);
    });
    fs.writeFileSync('./codes.json',JSON.stringify([].concat(...arr)),'utf-8');
}
mergeStorkCodes();
