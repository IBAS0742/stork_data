const {
    post
} = require('./../utils/Ajax');

class Api {
    static cut(str,len) {
        if (str.length > len) {
            return str.substring(0,len - 1);
        } else {
            return str;
        }
    }

    constructor(port) {
        this.port = port;
    }

    postToDb(method,param) {
        // 执行结果等同下面代码
        // fetch('http://localhost:8089/api',{
        //     method: 'post',
        //     body: JSON.stringify({
        //         Method: method,
        //         Params: param
        //     })
        // }).then(_=>_.text())
        console.log(`method = ${method} & param = ${param ? param.join(',') : ''}`)
        return post(`http://localhost:${this.port}/api`,{
            headers:{
                'Content-Type':'application/json',
            }
        },{
            method: method,
            // params: [l.id,l.text,l.right],
            params: param,
        },JSON.stringify).then();
    }


    insertkRecord(id,symbol,time,open,close,high,low,ratePrice,rate,volume,changeVolume,change){
        return this.postToDb('insertkRecord',[id,symbol,time,open,close,high,low,ratePrice,rate,volume,changeVolume,change].map(_ => _ + ''));
    }

    insertRecordFS(symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current){
        return this.postToDb('insertRecordFS',[symbol + timeStamp,symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current].map(_ => _ + ''));
    }

    queryKRecordRangeTime(symbol,fromTime,endTime) {
        return this.postToDb('queryKRecordRangeTime',[symbol,fromTime,endTime].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
    querydfcfKRecordRangeTime(symbol,fromTime,endTime) {
        return this.postToDb('querydfcfKRecordRangeTime',[symbol,fromTime,endTime].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }

    // 游资
    insertRecordYZRow(id,symbol,time,name,buy,sale,tag,succ,dir,ind) {
        tag = Api.cut(tag,20);
        name = Api.cut(name,20);
        return this.postToDb('insertRecordYZRow',[id,symbol,time,name,buy,sale,tag,succ,dir,ind].map(_ => _ + ''));
    }
    checkYZRowBySymbolAndTime(symbol,time) {
        return this.postToDb('checkYZRowBySymbolAndTime',[symbol,time].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content)[0].len;
        });
    }
    getAllSymbol() {
        return this.postToDb('getAllSymbol',[].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
    getAllDateBySymbol(symbol) {
        return this.postToDb('getAllDateBySymbol',[symbol].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
}

module.exports = {
    Api
};