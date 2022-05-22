const fs = require('fs');
const {
    k_cm_promise
} = require('./k_cm');

const symbol = 'SH600809';

k_cm_promise(symbol).then(({cmfb}) => {
    let rn = [];
    for (let i = 0;i < 100;i++) {
        rn.push(0);
    }
    console.log(cmfb.length)
    cmfb.slice(100).forEach(_ => {
        rn[parseInt(_.benefitPart * 100) - 1]++
    });
    console.log(`[
    ${rn.slice(0,20).join(',')},
    ${rn.slice(20,40).join(',')},
    ${rn.slice(40,60).join(',')},
    ${rn.slice(60,80).join(',')},
    ${rn.slice(80,100).join(',')},
]`)
})