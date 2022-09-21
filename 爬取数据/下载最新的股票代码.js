const {get} = require("./../utils/Ajax");
const fs = require('fs');

const GetCodes = (function () {
    const getSHtUrl = pn => `http://50.push2.eastmoney.com/api/qt/clist/get?cb=GetCodes.rc&pn=${pn}&pz=20&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&wbp2u=|0|0|0|web&fid=f3&fs=m:1+t:2,m:1+t:23&fields=f12,f14&_=1654312256089`;
    const getSZtUrl = pn => `http://50.push2.eastmoney.com/api/qt/clist/get?cb=GetCodes.rc&pn=${pn}&pz=20&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&wbp2u=|0|0|0|web&fid=f3&fs=m:0+t:6,m:0+t:80&fields=f12,f14&_=1654312256137`;
    let getUrl = getSHtUrl;
    let codeHeader = ['SH','SZ']
    let ind = 0;
    let allCodes = [];
    let page = 1;
    let fetching = false;
    let fetchOver = false;
    const rc = obj => {
        console.log(`fetch page = ${page}`)
        // obj.diff[0].f12 // code
        // obj.diff[0].f14 // name
        // console.log(obj);
        if (obj.data && obj.data.diff.length) {
            obj.data.diff.forEach(o => allCodes.push({code: codeHeader[ind] + o.f12,name: o.f14}));
            page++;
        } else {
            if (!ind) { // 上证请求结束了
                ind = 1;
                page = 1;
                getUrl = getSZtUrl;
            } else { // 深证也请求结束了
                fetchOver = true;
            }
        }
        fetching = false;
    };

    return {
        rc,
        fetchAllCodes() {
            let id = setInterval(() => {
                if (!fetching) {
                    if (!fetchOver) {
                        get(getUrl(page)).then(ret => {
                            eval(ret);
                        });
                    } else {
                        console.log(`all over`);
                        clearInterval(id);
                        fs.writeFileSync(`./allcode.json`,JSON.stringify(allCodes),'utf-8');
                    }
                }
            },500);
        }
    }
})();

GetCodes.fetchAllCodes();



