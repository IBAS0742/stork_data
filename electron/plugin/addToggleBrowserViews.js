
const { BrowserView, webContents} = require('electron')

class AddToggleBrowserViews {
    // 垂直显示前两个窗体，rate 是 上部分你的占比
    static showTheFirstTwoViewVertical(rate) {
        if (!rate || rate > 1) {
            rate = 0.5;
        }
        let arrayId = `${(new Date().getTime())}_${parseInt(Math.random() * 1000)}`;
        let showIndex = [0,1];
        return function () {
            let $this = this;
            let sizeFn = (function () {
                let b = $this.main.getBounds();
                let uh = Math.floor(b.height * rate);
                $this.bvs[0].setBounds({x:0,y:0,width:b.width,height:uh});
                $this.bvs[1].setBounds({x:0,y:uh,width:b.width,height:b.height - uh});
                $this.showIndex = showIndex;
                $this.showIndexArrAyId = arrayId;
            });
            let fn = (function () {
                if ($this._hide(showIndex,arrayId)) {
                    sizeFn.bind($this)();
                }
            });
            $this.size = sizeFn.bind($this);
            return fn();
        };
    }

    // main : BrowserWindow
    // number : browserView 的个数
    // menus : 菜单，格式为
    // {
    //      label: '切换 bv',
    //      submenu: [
    //      {
    //          label: '第一个',
    //          click() {} <- 这个无需提供
    //      }
    //      ]
    // }
    // showIndex : 显示哪一个
    // webPreferences 可以写注入
    constructor(main,number,menus,urls,showIndex,webPreferences) {
        this.main = main;
        this.number = number;
        this.menus = {
            label: '切换',
            submenu: [
            ]
        } || menus;
        this.urls = urls;
        this.webPreferences = webPreferences || [];
        this.bvs = [];
        this.showIndex = showIndex || 0;
        this.showIndexArrAyId = -1;
        this.size = _ => _;
        this._init = false;
        this.init();
    }
    buildDevTools() {
        let devTools = {
            label: 'devTools',
            submenu: [
            ]
        };
        for (let i = 0;i < this.number;i++) {
            devTools.submenu.push({
                label: `toggle ${i + 1} dev`,
                click: (function (i) {
                    this.bvs[i].webContents.toggleDevTools();
                }).bind(this,i)
            });
        }
        return devTools;
    }
    addShowMenu(label,action) {
        this.menus.submenu.push({
            label,
            click: action.bind(this)
        });
        return this;
    }
    init() {
        if (this._init) return;
        this._init = true;
        for (let i = 0;i < this.number;i++) {
            let bv = new BrowserView({
                webPreferences: this.webPreferences[i] ? this.webPreferences[i] : {}
            });
            bv.setBounds({x:0,y:0,width:0,height:0});
            let url = this.urls[i];
            if (url) {
                if (url.startsWith('http')) {
                    bv.webContents.loadURL(this.urls[i]);
                } else {
                    bv.webContents.loadFile(this.urls[i]);
                }
            }
            this.main.addBrowserView(bv);
            this.bvs.push(bv);
        }
        for (let i = 0;i < this.number;i++) {
            let $show = this.showOne.bind(this,i);
            if (this.menus.submenu[i]) {
                this.menus.submenu[i].click = $show;
            } else {
                this.menus.submenu.push({
                    label: `显示第 ${i+1} 个`,
                    click: $show
                });
            }
        }
        let $this = this;
        this.main.on('resize',function () {
            let b = $this.main.getBounds();
            if ($this.showIndex instanceof Array) {
                $this.size();
            } else {
                $this.bvs[$this.showIndex].setBounds({x:0,y:0,width:b.width,height:b.height});
            }
        });
        let b = this.main.getBounds();
        this.bvs[this.showIndex].setBounds({x:0,y:0,width:b.width,height:b.height});
        this.bvs[this.showIndex].webContents.openDevTools();
        setTimeout(() => {
            this.bvs[this.showIndex].webContents.closeDevTools();
        },500);
    }
    _hide(showIndex,showIndexArrayId) {
        if (showIndex === this.showIndex) return false;
        if (this.showIndex instanceof Array) {
            if (this.showIndexArrAyId === showIndexArrayId) {
                return false;
            }
            this.showIndex.forEach(si => {
                this.bvs[si].setBounds({x:0,y:0,width:0,height:0});
            });
        } else {
            this.bvs[this.showIndex].setBounds({x:0,y:0,width:0,height:0});
        }
        return true;
    }
    showOne(ind,showIndexArrayId) {
        if (this._hide(ind,showIndexArrayId)) {
            let b = this.main.getBounds();
            this.bvs[ind].setBounds({x:0,y:0,width:b.width,height:b.height});
            this.showIndex = ind;
        }
    }
}

module.exports = {
    AddToggleBrowserViews
}
