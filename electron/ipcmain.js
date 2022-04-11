const { ipcRenderer } = require('electron')
// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

ipcRenderer.on('urls', (event, arg) => {
    console.log(arg) // prints "pong"
    if (arg instanceof Array) {
        download(arg).then(ret => {
            ipcRenderer.send(`dl`, ret);
        })
    }
});

let download = function (codes) {
    let ret = {};
    let lock = false;
    return new Promise(s => {
        let id = setInterval(() => {
            if (lock) {

            } else {
                lock = true;
                if (codes.length) {
                    let code = codes.shift();
                    fetch(`https://stock.xueqiu.com/v5/stock/chart/minute.json?symbol=${code}&period=1d`,{credentials: 'include'}).then(_=>_.json()).then(data => {
                        ret[code] = data;
                        lock = false;
                    });
                } else {
                    s(ret);
                }
            }
        },100);
    })
}

// let timer = 0;
// const download = function (url) {
//     timer++;
//     let name = document.getElementsByClassName('region-switch_main')[0].innerText.replace(/\n/g,'_') + `_` + timer;
//     fetch(url).then(_ => _.text()).then(ret => {
//         ipcRenderer.send('dl',{
//             data: ret,
//             name: name,
//         });
//     });
// }

