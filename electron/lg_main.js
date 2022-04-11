// 控制应用生命周期和创建原生浏览器窗口的模组
const { app, BrowserWindow, BrowserView, ipcMain} = require('electron')
const path = require('path');
const fs = require('fs');

function createWindow () {
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            // 官网似乎说是默认false，但是这里必须设置contextIsolation
            contextIsolation: false,
            // preload: path.join(__dirname, 'preload.js')
            webviewTag: true, //开启webview标签渲染
            preload: path.join(__dirname, 'ipcmain.js'),
        }
    });
    mainWindow.loadURL('https://www.ilo.org/shinyapps/bulkexplorer2/?lang=en&segment=indicator&id=EAP_2WAP_SEX_AGE_RT_A');
    const ses = mainWindow.webContents.session;
    ses.webRequest.onBeforeRequest({urls:['*://*/*']},
        function (details, callback) {
            if (details.url.startsWith('https://apis.map.qq.com/place_cloud/search/region')) {
                mainWindow.webContents.send('urls', details.url)
            }
            callback({});
        });

    ipcMain.on('dl', (event, arg) => {
        fs.writeFileSync(path.join(__dirname, 'dl_datas',`${arg.name}.json`),arg.data,'utf-8');
    });
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
        // 打开的窗口，那么程序会重新创建一个窗口。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。
