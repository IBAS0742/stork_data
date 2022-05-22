
/**
 * @param promise   要执行的 promise，可以自行封装一次
 * @param arr       数组，参数集合，记得和 promise 匹配
 * @param doPromiseReturn   如果需要对 promise 的结果进行处理，可以使用这个参数
 * @returns {Promise<unknown>}
 */
const runPromiseByArrReturnPromise = (promise,arr,doPromiseReturn,waitTime) => {
    let doing = false;
    let ind = 0;
    console.log(`arr.length = ${arr.length}`);
    doPromiseReturn = doPromiseReturn || (_=>_);
    return new Promise(s => {
        let _id = setInterval(() => {
            if (!doing) {
                doing = true;
                if (arr.length) {
                    let id = arr.pop();
                    promise(id,ind)
                        .then(o => {
                            doPromiseReturn(o,id);
                            doing = false;
                            ind++;
                        });
                } else {
                    clearInterval(_id);
                    s();
                }
            }
        },waitTime);
    });
};

const numberNexter = (_from,_step) => {
    let step = _step || 1;
    let from = _from - step;
    return function () {
        from += step;
        return from;
    }
};
/**
 * 一直执行一个 promise 只要判定条件一直是 true
 * @param promise   promise函数
 * @param nexter    迭代器(可以一直输出 promise 需要的参数)
 * @param checkFn   检查是否满足条件的函数 接收参数为(promise的输出内容和 nexter 的输出内容)
 */
const runPromiseWhenTrue = (promise,nexter,checkFn) => {
    let doing = false;
    return new Promise(s => {
        let _id = setInterval(() => {
            if (!doing) {
                doing = true;
                let nextArg = nexter();
                promise(nextArg).then(o => {
                    if (checkFn(o,nextArg)) {
                        doing = false;
                    } else {
                        s();
                    }
                });
            }
        },500);
    });
};

const popArrWhen = (arr,check) => {
    let len = arr.length;
    for (let i = 0;i < len;i++) {
        if (check(arr[arr.length - 1])) {
            break;
        } else {
            arr.pop();
        }
    }
    return arr;
}
const shiftArrWhen = (arr,check) => {
    let len = arr.length;
    for (let i = 0;i < len;i++) {
        if (check(arr[0])) {
            break;
        } else {
            arr.shift();
        }
    }
    return arr;
}

const ymd2ts = (function () {
    let d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    // ymd = 1999-11-10
    return ymd => {
        ymd = ymd.split('-').map(_=>+_);
        d.setFullYear(ymd[0]);
        d.setDate(ymd[2]);
        d.setMonth(ymd[1] - 1);
        return d.getTime();
    };
})();

const dchange = (function () {
    let d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    // ymd = 1999-11-10
    let t2 = a => {
        a = a + '';
        return '00'.substring(a.length) + a;
    }
    return {
        ymd2ts: ymd => { // 将 yyyy-mm-dd 转为时间戳
            ymd = ymd.split('-').map(_=>+_);
            d.setFullYear(ymd[0]);
            d.setMonth(ymd[1] - 1);
            d.setDate(ymd[2]);
            return d.getTime();
        },
        ts2ymd: ts => { // 将 时间戳 转为 yyyy-mm-dd
            d.setTime(ts);
            return `${d.getFullYear()}-${t2(d.getMonth() + 1)}-${t2(d.getDate())}`
        }
    };
})();

// 用于持续获取一个动态序列中，最后 len 个内符合条件的内容
// 例如，一个序列中，一直返回最后4个最大的一个值
// 序列如下：[1,5,8,1,3,5,4,6,]
// [1] -> 1
// [1,5] -> 5
// [1,5,8] -> 8
// [1,5,8,1] -> 8
// [5,8,1,3] -> 8
// [8,1,3,5] -> 8
// [1,3,5,4] -> 5
// [3,5,4,6] -> 6
// m = new More(4,(a,b) => a > b);
// [1,5,8,1,3,5,4,6,].forEach(_ => {m.add(_);console.log(m.current)});
class More {
    /**
     * @param len       存储长度
     * @param compare   对比函数
     *                  function(old,new):bool {}
     */
    constructor(len,compare) {
        this.compare = compare || Math.max;
        this.cand = [];
        this.len = len;
    }
    add(n) {
        let clen = this.cand.length;
        if (clen) {
            let i = 0;
            for (;i < this.cand.length;i++) {
                this.cand[i].ind++;
                if (!this.compare(this.cand[i].n,n)) {
                    break;
                }
            }
            this.cand = this.cand.slice(0,i).filter(_ => _.ind < this.len);
            this.cand.push({
                n: n,
                ind: 0
            })
        } else {
            this.cand.push({
                n: n,
                ind: 0
            })
        }
    }
    get current() {
        return this.cand[0].n;
    }
}

module.exports = {
    runPromiseByArrReturnPromise,
    popArrWhen,
    shiftArrWhen,
    ymd2ts,
    dchange,
    numberNexter,
    runPromiseWhenTrue,
    More,
};