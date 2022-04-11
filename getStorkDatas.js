const fs = require('fs');
const {
    get
} = require('./utils/Ajax');
const {
    Task
} = require('./utils/Task');
const {
    option
} = require('./utils/getOption');

const from = 0;
const to = 700;
const times = [
    1605024000000,
    1605110400000,
    1605196800000,
    1605456000000,
    1605542400000,
    1605628800000,
    1605715200000,
    1605801600000,
    1606060800000,
    1606147200000,
    1606233600000,
    1606320000000,
    1606406400000,
    1606665600000,
    1606752000000,
    1606838400000,
    1606924800000,
    1607011200000,
    1607270400000,
    1607356800000,
    1607443200000,
    1607529600000,
    1607616000000,
    1607875200000,
    1607961600000,
    1608048000000,
    1608134400000,
    1608220800000,
    1608480000000,
    1608566400000,
    1608652800000,
    1608739200000,
    1608825600000,
    1609084800000,
    1609171200000,
    1609257600000,
    1609344000000,
    1609689600000,
    1609776000000,
    1609862400000,
    1609948800000,
    1610035200000,
    1610294400000,
    1610380800000,
    1610467200000,
    1610553600000,
    1610640000000,
    1610899200000,
    1610985600000,
    1611072000000,
    1611158400000,
    1611244800000,
    1611504000000,
    1611590400000,
    1611676800000,
    1611763200000,
    1611849600000,
    1612108800000,
    1612195200000,
    1612281600000,
    1612368000000,
    1612454400000,
    1612713600000,
    1612800000000,
    1612886400000,
    1613577600000,
    1613664000000,
    1613923200000,
    1614009600000,
    1614096000000,
    1614182400000,
    1614268800000,
    1614528000000,
    1614614400000,
    1614700800000,
    1614787200000,
    1614873600000,
    1615132800000,
    1615219200000,
    1615305600000,
    1615392000000,
    1615478400000,
    1615737600000,
    1615824000000,
    1615910400000,
    1615996800000,
    1616083200000,
    1616342400000,
    1616428800000,
    1616515200000,
    1616601600000,
    1616688000000,
    1616947200000,
    1617033600000,
    1617120000000,
    1617206400000,
    1617292800000,
    1617638400000,
    1617724800000,
    1617811200000,
    1617897600000,
    1618156800000,
    1618243200000,
    1618329600000,
    1618416000000,
    1618502400000,
    1618761600000,
    1618848000000,
    1618934400000,
    1619020800000,
    1619107200000,
    1619366400000,
    1619452800000,
    1619539200000,
    1619625600000,
    1619712000000,
    1620230400000,
    1620316800000,
    1620576000000,
    1620662400000,
    1620748800000,
    1620835200000,
    1620921600000,
    1621180800000,
    1621267200000,
    1621353600000,
    1621440000000,
    1621526400000,
    1621785600000,
    1621872000000,
    1621958400000,
    1622044800000,
    1622131200000,
    1622390400000,
    1622476800000,
    1622563200000,
    1622649600000,
    1622736000000,
    1622995200000,
    1623081600000,
    1623168000000,
    1623254400000,
    1623340800000,
    1623686400000,
    1623772800000,
    1623859200000,
    1623945600000,
    1624204800000,
    1624291200000,
    1624377600000,
    1624464000000,
    1624550400000,
    1624809600000,
    1624896000000,
    1624982400000,
    1625068800000,
    1625155200000,
    1625414400000,
    1625500800000,
    1625587200000,
    1625673600000,
    1625760000000,
    1626019200000,
    1626105600000,
    1626192000000,
    1626278400000,
    1626364800000,
    1626624000000,
    1626710400000,
    1626796800000,
    1626883200000,
    1626969600000,
    1627228800000,
    1627315200000,
    1627401600000,
    1627488000000,
    1627574400000,
    1627833600000,
    1627920000000,
    1628006400000,
    1628092800000,
    1628179200000,
    1628438400000,
    1628524800000,
    1628611200000,
    1628697600000,
    1628784000000,
    1629043200000,
    1629129600000,
    1629216000000,
    1629302400000,
    1629388800000,
    1629648000000,
    1629734400000,
    1629820800000,
    1629907200000,
    1629993600000,
    1630252800000,
    1630339200000,
    1630425600000,
    1630512000000,
    1630598400000,
    1630857600000,
    1630944000000,
    1631030400000,
    1631116800000,
    1631203200000,
    1631462400000,
    1631548800000,
    1631635200000,
    1631721600000,
    1631808000000,
    1632240000000,
    1632326400000,
    1632412800000,
    1632672000000,
    1632758400000,
    1632844800000,
    1632931200000,
    1633622400000,
    1633881600000,
    1633968000000,
    1634054400000,
    1634140800000,
    1634227200000,
    1634486400000,
    1634572800000,
    1634659200000,
    1634745600000,
    1634832000000,
    1635091200000,
    1635177600000,
    1635264000000,
    1635350400000,
    1635436800000,
    1635696000000,
    1635782400000,
    1635868800000,
    1635955200000,
    1636041600000,
    1636300800000,
    1636387200000,
    1636473600000,
    1636560000000,
    1636646400000,
    1636905600000,
    1636992000000,
    1637078400000,
    1637164800000,
    1637251200000,
    1637510400000,
    1637596800000,
    1637683200000,
    1637769600000,
    1637856000000,
    1638115200000,
    1638201600000,
    1638288000000,
    1638374400000,
    1638460800000,
    1638720000000,
    1638806400000,
    1638892800000,
    1638979200000,
    1639065600000,
    1639324800000,
    1639411200000,
    1639497600000,
    1639584000000,
    1639670400000,
    1639929600000,
    1640016000000,
    1640102400000,
    1640188800000,
    1640275200000,
    1640534400000,
    1640620800000,
    1640707200000,
    1640793600000,
    1640880000000,
    1641225600000,
    1641312000000,
    1641398400000,
    1641484800000,
    1641744000000,
    1641830400000,
    1641916800000,
    1642003200000,
    1642089600000,
    1642348800000,
    1642435200000,
    1642521600000,
    1642608000000,
    1642694400000,
    1642953600000,
    1643040000000,
    1643126400000,
    1643212800000,
    1643299200000,
    1644163200000,
    1644249600000,
    1644336000000,
    1644422400000,
    1644508800000,
    1644768000000,
    1644854400000,
    1644940800000,
    1645027200000,
    1645113600000,
    1645372800000,
    1645459200000,
    1645545600000,
    1645632000000,
    1645718400000,
    1645977600000,
    1646064000000,
    1646150400000,
    1646236800000,
    1646323200000,
    1646582400000,
    1646668800000,
    1646755200000,
    1646841600000,
    1646928000000,
    1647187200000,
    1647273600000,
    1647360000000,
    1647446400000,
    1647532800000,
    1647792000000,
    1647878400000,
    1647964800000,
    1648051200000,
    1648137600000,
    1648396800000,
    1648483200000
];

const getUrl = (code,time) => {
    let url = `https://stock.xueqiu.com/v5/stock/chart/minute_history.json?symbol=${code}&timestamp=${time}`;
    // console.log(url);
    return url;
};

const timeLen = times.length;
const over = [];
const codes = require('./new_codes.json').slice(from,to).filter(c => {
    let file = `./storkData/${c.symbol}.json`;
    return !fs.existsSync(file);
});
console.log(`codes length = ${codes.length}`);
let stopAll = false;

const downloadStorkDatas = function () {
    let codePromise = function (code) {
        let file = `./storkData/${code.symbol}.json`;
        /*if (fs.existsSync(file)) {
            return new Promise(s => s({}));
        } else {*/
            const t = JSON.parse(JSON.stringify(times));
            let reqTime = 0;
            const oneStorkDatas = {};
            return new Promise(s => {
                new Task(time => {
                    reqTime++;
                    console.log(reqTime * 100 / timeLen);
                    return get(getUrl(code.symbol,time),option).then(dataText => {
                        let json = JSON.parse(dataText);
                        if (json.error_description.length !== 0) {
                            console.log(json.error_description);
                            setTimeout(() => {
                                process.exit(-1);
                            },5000);
                        }
                        oneStorkDatas[time] = json;
                        return {};
                    });
                },t,1000,() => {
                    console.log(`${code.symbol} over`);
                    fs.writeFileSync(file,JSON.stringify(oneStorkDatas),'utf-8');
                    s({});
                }).run();
            });
        /*}*/
    };
    new Task(codePromise,codes.filter(_ => !over.includes(_.symbol)),1000,() => {
        console.log('all over');
    }).run();
};
downloadStorkDatas();

// const testGetStorkData = function () {
//     get(getUrl(codes))
// };
