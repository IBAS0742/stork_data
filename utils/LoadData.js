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
        return this.methods[this.from];
    }
}

class FileAndServerApi extends LoadData {
    static PromiseName = {
        file: 'file',
        server: 'server'
    }
    constructor() {
        super();
    }
    set FilePath({filePath,dearFileFn}) {
        dearFileFn = dearFileFn || (_=>_);
        this.addMethod(FileAndServerApi.PromiseName.file,(function (fp,dearFileFn) {
            return new Promise(s => {
                s(dearFileFn(fs.readFileSync(fp,'utf-8')));
            });
        }).bind(null,filePath,dearFileFn))
    }
    set ServerPromise(promise) {
        this.addMethod(FileAndServerApi.PromiseName.server,promise);
    }
}

module.exports = {
    LoadData,
    FileAndServerApi,
}