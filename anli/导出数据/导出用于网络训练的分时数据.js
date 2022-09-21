// 目标：找出分时数据最后十分钟交易后在第二天能获利逃走的股票
// 导出内容：正常沪深A股，且量不为 0 （当天不跌停涨停个股）
const {
    FSApi
} = require('./../../utils/APIS');

const api = new FSApi();
api.getAllSymbol().then(_ => {
    console.log(_);
})