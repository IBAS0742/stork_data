const {
    get
} = require('../utils/Ajax');
const {
    setCookie
} = require('../utils/getOption');
const fs = require('fs');
const path = require('path');
// const codes = require('../codes.json');
const codes = require('./getCodes').getCodes();
// const codes = [{symbol:"SZ002382"}];
const {
    runPromiseByArrReturnPromise,
    ymd2ts
} = require('../utils/others');

let opt = setCookie('');

let url = symbol => {
    let tar = symbol => {
        if (symbol.startsWith('SH')) {
            return `1.${symbol.slice(2)}`;
        } else {
            return `0.${symbol.slice(2)}`;
        }
    };
    return ['http://push2his.eastmoney.com/api/qt/stock/kline/get?cb=ret',
    '&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61&',
        'ut=7eea3edcaed734bea9cbfc24409ed989&',
        'klt=101&fqt=1&secid=',tar(symbol),
        '&beg=0&end=20500000&_=',new Date().getTime().toString()].join('')
}

const sourceFilePath = './../storkSql/dfcf_k/';
const sqlFilePath = './../storkSql/dfcf_sql/';

const keepLines = 100;


const ws = fs.createWriteStream(path.join(sqlFilePath, 'm.sql'), {
    fd: null,
    flags: 'w+',
    mode: 438,
    encoding: 'utf-8',
    start: 0,
    autoClose: true,
    highWaterMark: 2
})

function buildSqlFromJson(json,symbol) {
    // "1999-11-10,0.40,0.13,0.44,0.02,1740850,4859102000.00,-16.41,105.08,2.69,54.40"
    let sql = (line,symbol) => {
        let l = line.split(',');
        let date = ymd2ts(l[0]);
        let arr = [`${symbol}_${date}`,symbol,date,...l.slice(1)];
        // [   日期，         开，      收，        高，      低，     成交量，      成交额，  振幅(high / (0%) - low / (0%)) ，  换手, 涨跌幅，  涨跌额, ]
        return `insert into dfcfkRecord(id,symbol,time,open,close,high,low,volume,changeVolume,deta,rate,ratePrice,change) values("${arr.join('","')}");`;
    }
    return json.data.klines.map(l => sql(l,symbol))
}
function download() {
    return runPromiseByArrReturnPromise(obj => {
        return get(url(obj.symbol),opt)
            .then(txt => {
                console.log(`[${new Date().toDateString()}] ${obj.symbol} [over]`);
                txt = JSON.parse(txt.substring(4,txt.length - 2));
                // console.log(txt)
                if (txt.data.klines.length) {
                    if (keepLines !== -1) {
                        txt.data.klines = txt.data.klines.slice(txt.data.klines.length - keepLines);
                    }
                    buildSqlFromJson(txt,obj.symbol).forEach(sql => {
                        ws.write(sql + '\r\n');
                    });

                    fs.writeFileSync(`${sourceFilePath}${obj.symbol}.json`,JSON.stringify(txt),'utf-8');
                } else {
                    console.log(`error ${obj.symbol}`);
                }
            });
    },codes).then(() => {
        ws.close();
    });
}
function buildSql() {
    // "1999-11-10,0.40,0.13,0.44,0.02,1740850,4859102000.00,-16.41,105.08,2.69,54.40"
    let sql = (line,symbol) => {
        let l = line.split(',');
        let date = ymd2ts(l[0]);
        let arr = [`${symbol}_${date}`,symbol,date,...l.slice(1)];
        // [   日期，         开，      收，        高，      低，     成交量，      成交额，  振幅(high / (0%) - low / (0%)) ，  换手, 涨跌幅，  涨跌额, ]
        return `insert into dfcfkRecord(id,symbol,time,open,close,high,low,volume,changeVolume,deta,rate,ratePrice,change) values("${arr.join('","')}");`;
    }
    function buildOne(symbol) {
        // let symbol = 'SH600000';
        let filepath = `${sourceFilePath}${symbol}.json`;
        if (!fs.existsSync(filepath)) {
            return [];
        }
        let d = require(filepath);
        d.data.klines.map(l => sql(l,symbol)).forEach(sql => {
            ws.write(sql + '\r\n');
        });
    }
    codes.forEach(c => buildOne(c.symbol));
    ws.end();
    // buildOne("SH600000");
}

download();
// buildSql()
    // .then(() => {
    //     buildSql();
    // });
// buildSql();
// buildSql();

