const {
    get
} = require('../utils/Ajax');
const {
    setCookie
} = require('../utils/getOption');
const fs = require('fs');
const codes = require('../codes.json');
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

const keepLines = 10;
function download() {
    return runPromiseByArrReturnPromise(obj => {
        return get(url(obj.symbol),opt)
            .then(txt => {
                txt = JSON.parse(txt.substring(4,txt.length - 2));
                // console.log(txt)
                if (txt.data.klines.length) {
                    if (keepLines !== -1) {
                        txt.data.klines = txt.data.klines.slice(txt.data.klines.length - keepLines);
                    }
                    fs.writeFileSync(`${sourceFilePath}${obj.symbol}.json`,JSON.stringify(txt),'utf-8');
                } else {
                    console.log(`error ${obj.symbol}`);
                }
            });
    },codes);
}
function buildSql() {
    function buildOne(symbol) {
        // "1999-11-10,0.40,0.13,0.44,0.02,1740850,4859102000.00,-16.41,105.08,2.69,54.40"
        let sql = (line,symbol) => {
            let l = line.split(',');
            let date = ymd2ts(l[0]);
            let arr = [`${symbol}_${date}`,symbol,date,...l.slice(1)];
            // [   日期，         开，      收，        高，      低，     成交量，      成交额，  振幅(high / (0%) - low / (0%)) ，  换手, 涨跌幅，  涨跌额, ]
            return `insert into dfcfkRecord(id,symbol,time,open,close,high,low,volume,changeVolume,deta,rate,ratePrice,change) values("${arr.join('","')}");`;
        }
        // let symbol = 'SH600000';
        let d = require(`${sourceFilePath}${symbol}.json`);
        let sqls = d.data.klines.map(l => sql(l,symbol));
        fs.writeFileSync(`${sqlFilePath}${symbol}.sql`,sqls.join('\r\n'),'utf-8');
    }
    codes.forEach(c => buildOne(c.symbol));
    // buildOne("SH600000");
}

// download();
buildSql()
    // .then(() => {
    //     buildSql();
    // });
// buildSql();
// buildSql();

