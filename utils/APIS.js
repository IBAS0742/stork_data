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
}

class CMFBApi extends _API {
    constructor() {
        super();
        this.port = "8078";
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
        return [`insert or ignore into cmfb(id,symbol,time,benefitPart,avgCost,sevenConcentration,sevenConcentrationRA,sevenConcentrationRB,nineConcentration,nineConcentrationRA,nineConcentrationRB) 
        values("${id}","${symbol}",${arr.join(',')});`]
    }
    queryCMFBRangeTime(symbol,fromTime,endTime) {
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
}

module.exports = {
    KRecordApi,
    CMFBApi
};