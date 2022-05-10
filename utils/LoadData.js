const path = require('path');
const fs = require('fs');

class LoadData {
    constructor() {
        this.from = '';
        this.methods = {};
    }

    addMethod(from,promise) {
        this.methods[from] = promise;
    }

    set promiseName(from) {
        this.from = from;
    }

    get promise() {
        console.log(`promise name = ${this.from}`);
        return this.methods[this.from];
    }
}

/**
 * 从文件或服务中获取数据
 */
class FileAndServerApi extends LoadData {
    static PromiseName = {
        file: 'file',
        server: 'server'
    }
    constructor(tmpPath) {
        super();
        this.tmpPath = tmpPath || null;
        this.fileName = null;
        this.filePath = null;
    }
    /**
     * 这个方法要在 FilePath 配置后使用才有效
     * 设用于 server 缓存数据
     * @returns {string}
     */
    autoPromise() {
        if (this.fileName && this.tmpPath) {
            this.filePath = path.join(this.tmpPath,this.fileName);
            if (fs.existsSync(this.filePath)) {
                this.from = FileAndServerApi.PromiseName.file;
            } else {
                this.from = FileAndServerApi.PromiseName.server;
            }
        } else {
            this.from = FileAndServerApi.PromiseName.server;
        }
        return this.from;
    }
    set FilePath({filePath,dearFileFn,fileName}) {
        this.fileName = fileName;
        dearFileFn = dearFileFn || (_=>_);
        this.filePath = filePath;
        this.addMethod(FileAndServerApi.PromiseName.file,(function ($this,dearFileFn) {
            return new Promise(s => {
                s(dearFileFn(fs.readFileSync($this.filePath,'utf-8')));
            });
        }).bind(null,this,dearFileFn))
    }
    set ServerPromise(promise) {
        this.addMethod(FileAndServerApi.PromiseName.server,(function (promise) {
            return promise().then(ret => {
                if (this.filePath) {
                    fs.writeFileSync(this.filePath,JSON.stringify(ret),'utf-8');
                }
                return ret;
            });
        }).bind(this,promise));
    }
}
/**
 * FileAndServerApi 有效的使用情况
 * const tmpPath = 'd:\\';
 * fas = new FileAndServerApi(tmpPath);
 * fas.FilePath = {
 *     filePath: null,
 *     dearFileFn: null,
 *     fileName: 'a.tmp',
 * }
 * fas.ServerPromise = new Promise(s=>s('123'));
 * fas.autoPromise();
 * fas.promise().then(console.log);
 * // 第一次执行时，会执行 serverPromise 并将数据 '123' 写入到 path.join(tmpPath,fileName) 中
 * // 第二次执行 fas.promise 会从 path.join(tmpPath,fileName) 读取数据进行返回
 * */

module.exports = {
    LoadData,
    FileAndServerApi,
}