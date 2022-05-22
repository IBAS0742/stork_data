class Trade {
    constructor() {
        this.list = [];     //
        this.assets = 1;    // 总资产（未使用）
        this._index = 0;    //
        this.earn = 1;      // 获利
        this.hold = false;  // 正在持有
    }
    addIn(price,index,time) {
        this.hold = true;
        this.list.push({
            in: price,          // 买入价格
            out: -1,            // 卖出价格
            earn: -1,           // 获利点
            inIndex: index,     // 买入位置（索引）
            outIndex: -1,       // 卖出位置（索引）
            hold: 0,            // 持有时间（天/交易日）
            inTime: time,       // 买入时间（年月日）
            outTime: -1,        // 卖出时间（年月日）
            why: '',            // 卖出理由
        });
        return this;
    }
    addOut(price,index,time,why) {
        this.hold = false;
        let inPrice = this.list[this._index].in;
        this.list[this._index].why = why || '';
        this.list[this._index].out = price;
        this.list[this._index].earn = price / inPrice - 0.005;
        this.list[this._index].outIndex = index;
        this.list[this._index].outTime = time;
        this.list[this._index].hold = index - this.list[this._index].inIndex;
        this.earn *= this.list[this._index].earn;
        this.list[this._index].earn -= 1;
        this._index++;
        return this;
    }
    getEarn(price) {
        let inPrice = this.list[this._index].in;
        return price / inPrice;
    }
}

module.exports = {
    Trade
}