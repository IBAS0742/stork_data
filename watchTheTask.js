const fs = require('fs');
const spawn = require('child_process').spawn;

let t = 0;
fs.writeFileSync('runGSD.cmd',`chcp 65001\r\nstart node getStorkDatas.js`,'utf-8');

fs.watch('./storkData',(eventType,filename) => {
    console.log(`eventType = ${eventType}`);
    console.log(`filename = ${filename}`);
    t = 0;
    if (eventType === 'rename') {
        console.log(`成功完成创建文件 ${filename}`);
    }
});
const wakeup = function () {
    console.log(`1分钟后将重新唤醒下载进程`);
    setTimeout(() => {
        console.log(`下载被重新唤醒，并重新计时`)
        spawn('runGSD.cmd');
        t = 0;
    },1000 * 60);
};
console.log(`添加监听完成`);
setInterval(() => {
    t++;
    if (t === 60 * 8) {
        wakeup();
        console.log(`8 分钟没有任何文件创建，可能发生了什么事情，这里需要进行任务重启`);
        t = 0;
    } else {
        if (t % 60 === 0) {
            console.log(`已经过去 ${t / 60} 分钟`);
        }
    }
},1000);
console.log(`定时器启动完成`);
spawn('runGSD.cmd');