const {
    post
} = require("./Ajax");

class _API {
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
    updatePort(port) {
        this.port = port;
    }

    postToDb(method,param,json) {
        // 执行结果等同下面代码
        // fetch('http://localhost:8089/api',{
        //     method: 'post',
        //     body: JSON.stringify({
        //         Method: method,
        //         Params: param
        //     })
        // }).then(_=>_.text())
        console.log(`method = ${method} & param = ${param ? param.join(',') : ''}`)
        let ret = post(`http://localhost:${this.port}/api`,{
            headers:{
                'Content-Type':'application/json',
            }
        },{
            method: method,
            // params: [l.id,l.text,l.right],
            params: param.map(_=>_+''),
        },JSON.stringify);
        if (json) {
            return ret.then(JSON.parse).then(_ => JSON.parse(_.content))
        } else {
            return ret;
        }
    }
}

class KRecordApi extends _API {
    constructor(port='8088') {
        super(port);
    }

    insertkRecord(id,symbol,time,open,close,high,low,ratePrice,rate,volume,changeVolume,change){
        return this.postToDb('insertkRecord',[id,symbol,time,open,close,high,low,ratePrice,rate,volume,changeVolume,change].map(_ => _ + ''));
    }

    insertRecordFS(symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current){
        return this.postToDb('insertRecordFS',[symbol + timeStamp,symbol,time,timeStamp,amount,percent,chg,avg_price,volume,current].map(_ => _ + ''));
    }

    /**
     * @param symbol 股票代码
     * @param fromTime  开始时间（默认为0，即需要返回全部）
     * @param endTime   结束时间（默认为今天）
     * @returns {Promise<string>}
     */
    queryKRecordRangeTime(symbol,fromTime = 0,endTime = 0) {
        if (!fromTime) {
            fromTime = 0;
        }
        if (!endTime) {
            endTime = new Date().getTime();
        }
        return this.postToDb('queryKRecordRangeTime',[symbol,fromTime,endTime].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
    querydfcfKRecordRangeTime(symbol,fromTime = 0,endTime = 0) {
        if (!fromTime) {
            fromTime = 0;
        }
        if (!endTime) {
            endTime = new Date().getTime();
        }
        return this.postToDb('querydfcfKRecordRangeTime',[symbol,fromTime,endTime].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
    querydfcfKRecordOrderByTimeLimit(symbol,limit) {
        return this.postToDb('querydfcfKRecordOrderByTimeLimit',[symbol,limit].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
}

class CMFBApi extends _API {
    constructor(port) {
        super(port);
        this.port = port || "8078";
    }

    insertkCMFB(id,symbol,time,benefitPart,avgCost,sevenConcentration,sevenConcentrationRA,sevenConcentrationRB,nineConcentration,nineConcentrationRA,nineConcentrationRB){
        return this.postToDb('insertkCMFB',[
            id,symbol,time,parseInt(benefitPart * 1e8),parseInt(avgCost * 100),
            parseInt(sevenConcentration * 1e8),parseInt(sevenConcentrationRA * 100),parseInt(sevenConcentrationRB * 100),
            parseInt(nineConcentration * 1e8),parseInt(nineConcentrationRA * 100),parseInt(nineConcentrationRB * 100)
        ].map(_ => _ + ''));
    }
    insertkCMFB2Sql(id,symbol,time,benefitPart,avgCost,sevenConcentration,sevenConcentrationRA,sevenConcentrationRB,nineConcentration,nineConcentrationRA,nineConcentrationRB) {
        let arr = [time,parseInt(benefitPart * 1e8),parseInt(avgCost * 100),
            parseInt(sevenConcentration * 1e8),parseInt(sevenConcentrationRA * 100),parseInt(sevenConcentrationRB * 100),
            parseInt(nineConcentration * 1e8),parseInt(nineConcentrationRA * 100),parseInt(nineConcentrationRB * 100)];
        return `insert or ignore into cmfb(id,symbol,time,benefitPart,avgCost,sevenConcentration,sevenConcentrationRA,sevenConcentrationRB,nineConcentration,nineConcentrationRA,nineConcentrationRB) 
        values("${id}","${symbol}",${arr.join(',')});`;
    }
    queryCMFBRangeTime(symbol,fromTime,endTime) {
        if (!fromTime) {
            fromTime = 0;
        }
        if (!endTime) {
            endTime = new Date().getTime();
        }
        return this.postToDb('queryCMFBRangeTime',[symbol,fromTime,endTime],true);
    }
    /**
     * @param benefitPartFrom 默认已经 乘以 1e8 0.1 对应的就是 1e7
     * @param benefitPartTo 默认已经 乘以 1e8 0.1 对应的就是 1e7
     * @param fromTime 开始时间是必须设置的
     * @param endTime 默认为 现在此刻（一定能获取到最后的记录）
     * @returns {Promise<unknown>}
     */
    queryCMFBRangeTimeAndBenefitPart(benefitPartFrom,benefitPartTo,fromTime,endTime) {
        if (!fromTime) {
            fromTime = 0;
        }
        if (benefitPartFrom < 1) {
            benefitPartFrom *= 1e8;
        }
        if (benefitPartTo < 1) {
            benefitPartTo *= 1e8;
        }
        if (!endTime) {
            endTime = new Date().getTime();
        }
        return this.postToDb('queryCMFBRangeTimeAndBenefitPart',[benefitPartFrom,benefitPartTo,fromTime,endTime],true);
    }

    getAllSymbol() {
        return this.postToDb('getAllSymbol',[].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
    // todo:接口定义位置错误（这里虽然不是很严重的问题，但是会导致接口无法理解）
    getAllSymbolFromTime(time) {
        time = time + '';
        time = time.substring(0,'1000915200'.length);
        return this.postToDb('getAllSymbolFromTime',[time].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
    // todo:接口定义位置错误（这里虽然不是很严重的问题，但是会导致接口无法理解）
    getAllSymbolFromTimeOnlySymbol(time) {
        time = time + '';
        time = time.substring(0,'1000915200'.length);
        return this.postToDb('getAllSymbolFromTimeOnlySymbol',[time].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }

    getAllDateBySymbol(symbol) {
        return this.postToDb('getAllDateBySymbol',[symbol].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
}

class YZApi extends _API {
    constructor(port) {
        super(port);
        this.port = port || "8091";
    }
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
    getAllSymbolFromTime(time) {
        time = `${time}`.slice(0,10);
        return this.postToDb('getAllSymbolFromTime',[time].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
    getAllSymbolFromTimeOnlySymbol(time) {
        time = time + '';
        time = time.substring(0,'1000915200'.length);
        return this.postToDb('getAllSymbolFromTimeOnlySymbol',[time].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
}

class JHJJApi extends _API {
    constructor(port) {
        super(port);
        this.port = port || "8068";
    }
    // "symbol","fromTime","endTime"
    queryJHJJRangeTime(symbol,fromTime,endTime) {
        return this.postToDb('queryJHJJRangeTime',[symbol,fromTime,endTime].map(_ => _ + '')).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
}

class FSApi extends _API {
    constructor(port) {
        super(port);
        this.port = port || "8022";
    }
    getAllSymbol() {
        return this.postToDb('getAllSymbol',[]).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
    queryRecordFSBySymbol(symbol) {
        return this.postToDb('queryRecordFSBySymbol',[symbol]).then(JSON.parse).then(o => {
            return JSON.parse(o.content);
        });
    }
}

module.exports = {
    KRecordApi,
    CMFBApi,
    YZApi,
    JHJJApi,
    FSApi,
};