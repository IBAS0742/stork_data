const {
    get,
    post
} = require('./utils/Ajax');
let all = require('./codes.json'); // {symbol:code,name:name}
const fs = require('fs');
const {
    setCookie
} = require('./utils/getOption')

const cookie = 'u=2977322391; xq_a_token=0991060380dba9ddd373c39bf1c77981f0932a33; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjI5NzczMjIzOTEsImlzcyI6InVjIiwiZXhwIjoxNjUzNzIxMDI3LCJjdG0iOjE2NTExMjkwMjg3MTQsImNpZCI6ImVHaXVKQ1luaE0ifQ.MIedH4fmrrKXxKSIDfbgZhZ2UndUOgG_YOFFcSTrG3t9SoVGUVHILj7GGHrvP989cW4PiWfCDOtTs-Z8XJkl5yjF_ctgqPbudIDYUScCQAafWzj_gecCFxv5nR5wRcbw2cJJYorxscUc0y4-BadkrnhcD3C34ZBlzLs7LJGzrwvyOeSKrJ0OgOj8yN90vla36HDMEv7fuFoe6Iwb61aB_uqxiCQz2vBHuT-tulqCMgGEITMJfYYxkvdoVgtUitUYETMhI9zssm7lc4hXU2PyfIwBhpOsbfG1z_7L6qc6-8506hlvQTj4y_XJ2h2OTAQgY1DQKeTaGUDcWJQKFTqhJw; xq_r_token=3facea0019c51451d8314ac252f1da095c7c1224; xq_is_login=1; X-Snowx-Token=eyJleHAiOiIxNjUxMTMyNjI5MDM5IiwiYWxnIjoiQTI1NkdDTUtXIiwiZW5jIjoiQTI1NkdDTSIsIml2IjoiOThVWWlRdlF3RFB4a2N3TCIsInRhZyI6IktEd2dCV1BPb25VdGg3UFlXcWpxcWcifQ.XEt_SJKFdGEgSv5q1qUHHxgwepY-_dY6OH93VJ_tROM.BiwhkofJsXaycW9q.D17WBSTqoiStaA8q1Q6rfcs2CUM5XPHy4mKi08zpfltj2a-dm7lfDeKAFacde44R8RoInlxIj0Bz7jLXc6kZ.Hvlz0xr3RfG9WriporZ2bA';
const option = setCookie(cookie);
const getUrl = symbol => `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${symbol}&begin=1651215499831&period=day&type=before&count=-260&indicator=kline,pe,pb,ps,pcf,market_capital,agt,ggt,balance`;
all = all.map(_ => {
    return {
        url: getUrl(_.symbol),
        symbol: _.symbol
    };
});


const apis = {
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
        return post(`http://localhost:8089/api`,{
            headers:{
                'Content-Type':'application/json',
            }
        },{
            method: method,
            // params: [l.id,l.text,l.right],
            params: param,
        },JSON.stringify).then();
    },
    insertkRecord(id,symbol,time,open,close,high,low,ratePrice,rate,volume,changeVolume,change){
        return apis.postToDb('insertkRecord',[id,symbol,time,open,close,high,low,ratePrice,rate,volume,changeVolume,change].map(_ => _ + ''));
    },
};

/**
 * @param promise   要执行的 promise，可以自行封装一次
 * @param arr       数组，参数集合，记得和 promise 匹配
 * @param doPromiseReturn   如果需要对 promise 的结果进行处理，可以使用这个参数
 * @returns {Promise<unknown>}
 */
const runPromiseByArrReturnPromise = (promise,arr,doPromiseReturn) => {
    let doing = false;
    doPromiseReturn = doPromiseReturn || (_=>_);
    return new Promise(s => {
        let _id = setInterval(() => {
            if (!doing) {
                doing = true;
                if (arr.length) {
                    let id = arr.pop();
                    promise(id)
                        .then(o => {
                            doPromiseReturn(o,id);
                            doing = false;
                        });
                } else {
                    clearInterval(_id);
                    s();
                }
            }
        },20);
    });
}

const emptyPromise = () => new Promise(_=>_());
function paqu() {
    runPromiseByArrReturnPromise(urlAndSymbol => {
        return get(urlAndSymbol.url,option).then(JSON.parse).then(o => {
            // console.log(o);
            if (o.data.item && o.data.item instanceof Array) {
                let item = o.data.item[o.data.item.length - 1];
                return apis.insertkRecord(urlAndSymbol.symbol + item[0],
                        urlAndSymbol.symbol,item[0],item[2],item[5],
                        item[3],item[4],item[6],item[7],
                        item[1],item[9],item[8]);
                // return runPromiseByArrReturnPromise(item => {
                //     // " id(0+x) symbol(x) time(0) open(2) close(5)",
                //     // " high(3) low(4) ratePrice(6) rate(7)",
                //     // " volume(1) changeVolume(9) change(8)"
                //     return apis.insertkRecord(urlAndSymbol.symbol + item[0],
                //         urlAndSymbol.symbol,item[0],item[2],item[5],
                //         item[3],item[4],item[6],item[7],
                //         item[1],item[9],item[8]);
                // }, o.data.item)
            } else {
                return emptyPromise();
            }
        });
    },all).then(() => {
        console.log('over');
    });
}
paqu()

// apis.insertkRecord(...`SZ0006701583942400000,SZ000670,1583942400000,1.92,1.96,1.97,1.92,0.01,0.51,11337308,22097232,1.87`.split(','))



