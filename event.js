function send_bv_id() {
    let input_bv = document.getElementById("input_bv")
    let url = "http://127.0.0.1:5981/process_task?bv_id=" + input_bv.value
    fetch(url).then((data) => {
        return data.text()
    }).then((text) => {
        document.getElementById("python_result").innerText = text
    })
}

document.getElementById("btn_download").onclick = send_bv_id



