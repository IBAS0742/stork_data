let ignoreCodes = ['SZ000508','SZ001226','SZ001316','SH688349'];
module.exports = {
    getCodes() {
        return require('./allcode.json').filter(_=> {
            let sym = _.code;
            if (ignoreCodes.includes(sym)) {
                return false;
            }
            return (sym[2]==='0' || sym[2]==='6') && !(_.name.startsWith('*ST') || _.name.startsWith('ST'));
        }).map(_=>{
            return {
                symbol: _.code
            }
        });
    }
}