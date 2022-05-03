
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

module.exports = {
    runPromiseByArrReturnPromise,
    popArrWhen,
    shiftArrWhen,
};