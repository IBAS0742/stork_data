// main.js
const { Download } = require('./plugin/download');
const { Menu } = require('./plugin/menu');
// 控制应用生命周期和创建原生浏览器窗口的模组
const { app, BrowserWindow, BrowserView, ipcMain} = require('electron')
const path = require('path')
const {
    AddToggleBrowserViews
} = require("./plugin/addToggleBrowserViews");

function createWindow () {
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 1500,
        height: 940,
        webPreferences: {
            nodeIntegration: true,
            // 官网似乎说是默认false，但是这里必须设置contextIsolation
            contextIsolation: false,
            // preload: path.join(__dirname, 'preload.js')
            webviewTag: true, //开启webview标签渲染
        }
    });

    let abv = new AddToggleBrowserViews(mainWindow,2,{
        label: '切换',
        submenu: [
            {
                label: '下载',
            },
            {
                label: '返回页面'
            }
        ]
    },['./views/showKline.html','https://xueqiu.com/'],0,[
        {
            nodeIntegration: true,
            // 官网似乎说是默认false，但是这里必须设置contextIsolation
            contextIsolation: false,
            // preload: path.join(__dirname, 'preload.js')
            webviewTag: true, //开启webview标签渲染
        },{
            nodeIntegration: true,
            // 官网似乎说是默认false，但是这里必须设置contextIsolation
            contextIsolation: false,
            // preload: path.join(__dirname, 'preload.js')
            webviewTag: true, //开启webview标签渲染
            preload: path.join(__dirname, 'ipcmain.js'),
        }
    ])
        .addShowMenu('垂直二分',AddToggleBrowserViews.showTheFirstTwoViewVertical(0.9));

    let menu = new Menu();
    menu.addMenuObj(abv.menus).addMenuObj(abv.buildDevTools()).init();

    ipcMain.on('get_data',function (event,args) {
        abv.bvs[1].webContents.send('urls',args);
    });
    ipcMain.on('dl',function (event,args) {
        abv.bvs[0].webContents.send('fetch_result',args);
    })
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
