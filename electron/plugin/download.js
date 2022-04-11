class Item {
    constructor(item) {
        this.item = item;
        this.state = '';
        this.speed = 0;
        this.receivedBytes = 0;
        this.lastModifiedTime = 0;
    }
    updateState(state) {
        this.state = state;
    }
    speed() {
        return this.receivedBytes / this.item.getTotalBytes();
    }
    getInfo() {
        return {
            item: this.item,
            state: this.state,
            speed: this.speed(),
            receivedBytes: this.receivedBytes,
        }
    }
}

class Download {
    constructor(main) {
        // this.main = main;
        this.webContents = main.webContents;
        this.items = [];
        this.bind();
    }

    bind() {
        this.webContents.session.on('will-download',(event, item, webContents) => {
            // 记录上一次下载的字节数据
            let keep_item = new Item(item);
            this.items.push(keep_item);
            item.on('updated', (event, state) => {
                const receivedBytes = item.getReceivedBytes()
                // 计算每秒下载的速度
                keep_item.speed = receivedBytes - keep_item.prevReceivedBytes
                keep_item.prevReceivedBytes = receivedBytes
                keep_item.updateState(state);
                if (state === 'interrupted') {
                    console.log('Download is interrupted but can be resumed')
                } else if (state === 'progressing') {
                    if (item.isPaused()) {
                        console.log('Download is paused')
                    } else {
                        console.log(`Received bytes: ${item.getReceivedBytes()}`)
                    }
                }
                webContents.send('download-event',this.items.map(_=>_.getInfo()));
            })
            item.once('done', (event, state) => {
                keep_item.updateState(state);
                keep_item.receivedBytes = item.getReceivedBytes()
                keep_item.lastModifiedTime = item.getLastModifiedTime()
                if (state === 'completed') {
                    console.log('Download successfully');
                } else {
                    console.log(`Download failed: ${state}`);
                }
                webContents.send('download-event',this.items.map(_=>_.getInfo()));
            });
        });
    }
}

module.exports = {
    Download
}
