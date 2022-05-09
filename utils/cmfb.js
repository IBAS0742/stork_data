// 筹码分布
/**
 * 返回 计算筹码分布所需的格式
 * @param obj   数据库返回的格式
 */
const sqlObj2Arr = obj => {
    return [
        obj.time,
        obj.open,obj.close,obj.high,obj.low,
        obj.volume,obj.changeVolume,obj.deta,
        obj.change,obj.rate,obj.ratePrice
    ];
};
/**
 * 计算筹码分布的函数（从东方财富网页中拿出来的）
 * @param klinedata 格式为 [k,k,k] ; k = ['2022-04-29', '274.00', '272.00', '277.60', '260.25', '82859', '2234617936.00', '6.38%', '0.68', '0.00', '0.00']
 *                                      [   日期，         开，      收，        高，      低，     成交量，      成交额，        振幅，    换手，  涨跌幅，  涨跌额]
 * @param t         序号，表示计算 klinedata 的第几个内容的筹码
 * @returns {*}
 */
function calcCmfb(klinedata,t = 6666) {
    let range = 120;
    var e = 0
        , o = 0
        , r = 150
        , i = klinedata.length ? Math.max(0, t - range + 1) : 0
        , n = klinedata.slice(i, Math.max(1, t + 1));
    if (0 === n.length)
        throw "invaild index";
    for (var a = 0; a < n.length; a++)
         var s = n[a]
             , e = e ? Math.max(e, +s[3]) : +s[3]
             , o = o ? Math.min(o, +s[4]) : +s[4];
    for (var l = Math.max(.01, (e - o) / (r - 1)), h = [], a = 0; a < r; a++)
        h.push(+(o + l * a).toFixed(2));
    for (var d = function(t) {
        for (var e = [], i = 0; i < t; i++)
            e.push(0);
        return e
    }(r), a = 0; a < n.length; a++) {
        for (var c = n[a], p = +c[1], g = +c[2], A = +c[3], u = +c[4], f = (p + g + A + u) / 4, m = Math.min(1, c[8] / 100 || 0), C = Math.floor((A - o) / l), y = Math.ceil((u - o) / l), v = [A == u ? r - 1 : 2 / (A - u), Math.floor((f - o) / l)], x = 0; x < d.length; x++)
            d[x] *= 1 - m;
        if (A == u)
            d[v[1]] += v[0] * m / 2;
        else
            for (var I = y; I <= C; I++) {
                var b = o + l * I;
                b <= f ? Math.abs(f - u) < 1e-8 ? d[I] += v[0] * m : d[I] += (b - u) / (f - u) * v[0] * m : Math.abs(A - f) < 1e-8 ? d[I] += v[0] * m : d[I] += (A - b) / (A - f) * v[0] * m
            }
    }
    for (var w = +klinedata[t][2], k = 0, a = 0; a < r; a++) {
        var M = +d[a].toPrecision(12);
        k += M
    }
    var T = new function() {
            this.x = arguments[0],
                this.y = arguments[1],
                this.benefitPart = arguments[2],
                this.avgCost = arguments[3],
                this.percentChips = arguments[4],
                this.computePercentChips = function(t) {
                    if (1 < t || t < 0)
                        throw 'argument "percent" out of range';
                    var e = [(1 - t) / 2, (1 + t) / 2]
                        , i = [R(k * e[0]), R(k * e[1])];
                    return {
                        priceRange: [i[0].toFixed(2), i[1].toFixed(2)],
                        concentration: i[0] + i[1] === 0 ? 0 : (i[1] - i[0]) / (i[0] + i[1])
                    }
                }
                ,
                this.getBenefitPart = function(t) {
                    for (var e = 0, i = 0; i < r; i++) {
                        var n = +d[i].toPrecision(12);
                        o + i * l <= t && (e += n)
                    }
                    return 0 == k ? 0 : e / k
                }
        }
    ;
    return T.x = d,
        T.y = h,
        T.benefitPart = T.getBenefitPart(w),
        T.avgCost = R(.5 * k).toFixed(2),
        T.percentChips = {
            90: T.computePercentChips(.9),
            70: T.computePercentChips(.7)
        },
        T;
    function R(t) {
        for (var e = 0, i = 0, n = 0; n < r; n++) {
            var a = +d[n].toPrecision(12);
            if (t < i + a) {
                e = o + n * l;
                break
            }
            i += a
        }
        return e
    }
}

module.exports = {
    sqlObj2Arr,
    calcCmfb
}