const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const { spawn , exec} = require('child_process')
const path = require('node:path')
let win, workerProcess
const createWindow = () => {
     win = new BrowserWindow({
        width: 1080, height: 768,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    //开启F12
    // win.webContents.openDevTools()
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
    PythonShell.run('./server.py', option, function (err, results) {
        if (err) throw err
        console.log('python-result', results)
    })
}

const initFlaskExe = async () => {
    let script = path.join('server.exe')
    const EXECUTION_OPTIONS = {
        windowsHide: true,
        detached: false // 让子进程独立于父进程运行
    }
    workerProcess = spawn(script, [], EXECUTION_OPTIONS)
    if (workerProcess != null) {
        console.log('flask server start success')
    }
}

function killFlaskExe() {
    if (workerProcess.exitCode === null) {
        workerProcess.kill()
    }
    exec('taskkill /im server.exe -f')
    console.log('kill flask server success')
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

app.on('before-quit', ()=> {
    killFlaskExe()
})

app.on('window-all-closed', ()=> {
    if (process.platform !== 'darwin')
        app.quit()
})