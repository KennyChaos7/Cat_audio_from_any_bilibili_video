const {app, BrowserWindow} = require('electron')
const path = require('node:path')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800, height: 600,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false, // 注意如果没有该选项，在renderer.js 中 require is not defined
            enableRemoteModule: true
        }
    })
    //开启F12
    // win.webContents.openDevTools()
    win.loadFile('index.html')
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