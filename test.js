const fs = require('fs');
const codes = require('./codes.json');

let count = 0;
let len = 48;
let map = {};
let ids = [];
codes.forEach(c => {
    count = count % len;
    if (!(count in map)) {
        map[count] = [];
        ids.push([]);
    }
    ids[count].push(c.symbol);
    map[count].push(c.symbol);
    count++;
});

const write_sql_path = name => `C:\\Users\\admin\\Documents\\stork_data\\storkSql\\fs\\${name}`;
const insert_sql_path = name => `C:\\Users\\admin\\Documents\\stork_data\\storkSql\\${name}`;

const configure = {
    "port": ":8099",
    "db_path": "storkFS.db",
    "static_path": "views\\",
    "static_url": "/views/",
    "others": [
        "数据库表说明",
        " id : symbol + timeStamp, symbol,time : 当日的时间戳,timeStamp : 单条记录的时间戳,amount : 该时间点交易量",
        "percent : 涨跌幅, chg : 涨跌额, avg_price : 平均价格, volume : 量, current : 当前价格"
    ],
    "sqls": [
        "create table if not exists recordFS (id char(30) primary key not null,symbol char(20) not null,time char(20) not null,timeStamp char(20) not null,amount char(20) not null,percent char(8) not null,chg char(20) not null,avg_price char(10) not null,volume char(20) not null,current char(20) not null);"
    ],
    "apis": ids.map((is,ind) => {
        return [
            {
                "name": `write_recordFS${ind + 1}`,
                "return": [
                    "id","symbol","time","timeStamp","amount","percent","chg","avg_price","volume","current"
                ],
                "param": [
                    // `C:\\Users\\admin\\Documents\\stork_data\\storkSql\\fs\\out_${ind + 1}.sql`,
                    write_sql_path(`out_${ind + 1}.sql`),
                    "insert or ignore into recordFS(id,symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current) values(\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\",\"{6}\",\"{7}\",\"{8}\",\"{9}\");\r\n"
                ],
                "sql": `select * from recordFS;`,
                "desc": "-apis 获取所有的表名\r"
            },
            {
                "name": `execute_recordFS${ind + 1}`,
                "return": [
                ],
                "param": [
                    // `C:\\Users\\admin\\Documents\\stork_data\\storkSql\\${ind + 1}.sql`,
                    insert_sql_path(`${ind + 1}.sql`),
                    "",
                    "1000",
                    ";insert or ignore into recordFS(id,symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current) values"
                ],
                "sql": "{0}",
                "desc": "sql 由 param[1] 生成"
            }
        ]
    }).flatMap(_=>_)
}

// fs.writeFileSync('./db/fs/map.json',JSON.stringify(map),'utf-8');
fs.writeFileSync('./db/fs/sp.json',JSON.stringify(configure,'','\t'),'utf-8');

