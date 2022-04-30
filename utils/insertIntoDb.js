const {
    post
} = require('./../utils/Ajax');

class Api {
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


}

module.exports = {
    Api
};