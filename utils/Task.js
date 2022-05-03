/**
 * 脚本的目的是将任务完整执行完的同时，让认为在执行的时候有合理的延时
 * 用于从服务器爬取数据时，可以比较有节制的进行
 * */
class Task {
    // 这里的 promise 是每次任务的内容
    // list 是 promise 执行的时候的参数数组
    // sleep 每次任务等待时间
    // runOver 完全跑完任务
    //
    // promise(list[0],this.tmp).then() ....
    // 这里的 tmp 可以理解为上一次任务与下一次任务的单向通信
    constructor(promise,list,sleep,runOver) {
        this.promise = promise;
        this.list = list;
        this.sleep = sleep;
        this.runOver = runOver;
        this.id = null;
        this.tmp = {};
    }

    setRunOver(ro) {
        this.runOver = ro;
        return this;
    }

    run() {
        let running = false;
        this.id = setInterval(() => {
            if (running) {
                return;
            }
            running = true;
            if (this.list.length) {
                let l = this.list.shift();
                this.promise(l,this.tmp).then(tmp => {
                    running = false;
                    this.tmp = tmp;
                });
            } else {
                this.runOver();
                clearInterval(this.id);
            }
        },this.sleep);
    }
}

module.exports = {
    Task
}