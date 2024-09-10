const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('node:path')
let win
const createWindow = () => {
     win = new BrowserWindow({
        width: 1080, height: 768,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false, // 注意如果没有该选项，在renderer.js 中 require is not defined
            enableRemoteModule: true
        }
    })
    //开启F12
    win.webContents.openDevTools()
    //关闭菜单项
    // win.setMenu(null)
    // win.loadFile('index.html')
    win.loadFile('search.html')
}

const initFlask = () => {
    const {PythonShell} = require('python-shell');
    let option = {
        mode: 'text',
        pythonPath: 'venv/Scripts/python'
    };
    PythonShell.run('./main.py', option, function (err, results) {
        if (err) throw err
        console.log('python-result', results)
    })
}

const initFlaskExe = () => {
    let script = path.join(__dirname, 'dist', 'main', 'main.exe')
    pyProc = require('child_process').execFile(script)
    if (pyProc != null) {
        console.log('flask server start success')
    }
}

function killFlaskExe() {
    pyProc.kill()
    console.log('kill flask server success')
    pyProc = null
}

let progressInterval
ipcMain.on('startProgressbar', async(event, data) => {
    // const INCREMENT = 0.03
    // const INTERVAL_DELAY = 100 // ms
    // let c = 0
    // progressInterval = setInterval(() => {
    //     win.setProgressBar(c)
    //     if (c < 100)
    //         c++
    // }, INTERVAL_DELAY)
})

ipcMain.on('stopProgressbar', async(event, data) => {
    // clearInterval(progressInterval)
    const options = {
        type: 'info',
        buttons: ['OK'],
        title: "",
        message: data + "下载完成，请查看output文件夹"
    };
    dialog.showMessageBox(win, options)

})

app.whenReady().then(() => {
    // initFlask()
    initFlaskExe()
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
            // initFlask()
            initFlaskExe()
        }
    })
})

app.on('window-all-closed', ()=> {
    if (process.platform !== 'darwin')
        app.quit()
    killFlaskExe()
})