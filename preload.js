window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element)
            element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }

    var {PythonShell} = require('python-shell');
    let option = {
        mode: 'text',
        pythonPath: 'venv/Scripts/python'
    };
    PythonShell.run('./main.py', option, function (err, results) {
        if (err) throw err;
        replaceText('python-result', results)
        console.log('python-result', results)
    })
})