const {ipcRenderer} = require('electron')
const timers = require("timers");

let search_last_time_url;
let page = 1;

function add_data_to_div(json_array) {
    let body = document.getElementById('search_body')
    for (let i = 0; i < json_array.length; i++) {
        let json = json_array[i]
        json['title'] = json['title'].replaceAll("<em class=\"keyword\">", "")
        json['title'] = json['title'].replaceAll("</em>", "")
        let div = document.createElement('div')
        div.className = 'content_card'
        let image = new Image(200, 100)
        image.src = "https://" + json['pic']
        image.alt = json['title']
        let p = document.createElement('p')
        p.innerText = json['title']
        // let footer = document.createElement('footer')
        // footer.innerText = json['author']
        // div.appendChild(footer)
        div.appendChild(p)
        div.appendChild(image)
        body.appendChild(div)
    }
}

function search() {
    search_last_time_url = ''
    page = 1
    let input_keyword = document.getElementById("input_keyword")
    let url = "http://127.0.0.1:5000/search?keyword=" + input_keyword.value + "&page=" + page
    fetch(url)
        .then((resp) => {
            return resp.json()
        })
        .then((json_array) => {
            search_last_time_url = "http://127.0.0.1:5000/search?keyword=" + input_keyword.value
            let body = document.getElementById('search_body')
            while (body.firstChild) {
                body.removeChild(body.lastChild)
            }
            add_data_to_div(json_array)
        })
        .finally(()=> {
            console.log(url)
        })
}
document.getElementById("search_by_keyword").onclick = search;
document.getElementById("body").onkeydown = function (event) {
    if (event.keyCode === 13)
        search()
};


function search_next_page() {
    let url = search_last_time_url + "&page=" + (page + 1)
    console.log(url)
    let time_out_signal = setTimeout(()=> {
        console.log('next page time out')
    }, 10 * 1000)
    fetch(url)
        .then((resp) => {
            return resp.json()
        })
        .then((json_array) => {
            clearTimeout(time_out_signal)
            add_data_to_div(json_array)
            page++
        })
        .catch((error) => {
            console.log(error)
        })
        .finally(()=>{
            console.log(page)
    })

}
document.getElementById("search_next_page").onclick = search_next_page;

