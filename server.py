import io
import json
import os
import sys
import time
from tqdm import tqdm
import wbi as API
import requests
from PIL import Image
from flask import Flask, render_template, request, make_response
from flask_cors import cross_origin

app = Flask(__name__)
cross_origin(app)
path = os.getcwd()
if os.path.exists(path + "/output") is False:
    os.mkdir(path + "/output")
path += "/output/"
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf8')


def download(url: str, file_name: str, chunk_size: int):
    print(file_name + " downloading .... ")
    resp = requests.get(
        url=url,
        headers=API.req_headers,
        stream=True
    )
    if resp.status_code != 200:
        return "???"
    with open(path + file_name, 'wb') as file, tqdm(
        desc=file_name,
        total=int(resp.headers.get('content-length', 0)),
        unit='iB',
        unit_scale=True,
        unit_divisor=1024
    ) as bar:
        # start_time = time.perf_counter()
        # max_progress = round(len(resp.content) / chunk_size)
        # i = 0
        for content in resp.iter_content(chunk_size=1024):
            size = file.write(content)
            # progress_bar(start_time, max_progress, i)
            # i = i + 1
            bar.update(size)
        return file_name


def transcode(file_name):
    tmp_file_name = str(round(time.time())) + ".m4a"
    print(file_name + " transcoding .... ")
    os.remove(path + file_name[0:-4] + ".mp3")
    os.system("ffmpeg -i " + path + file_name + " -acodec libmp3lame -ac 2 -ab 128k -id3v2_version 3 " + path + tmp_file_name[0:-4] + ".mp3")
    os.rename(path + tmp_file_name[0:-4] + ".mp3", path + file_name[0:-4] + ".mp3")
    os.remove(path + file_name[0:-4] + ".m4a")


def get_info_bv_id(bv_id: str):
    video_json = API.get_video_simple_info(bv_id=bv_id).json()
    if video_json['code'] == 0:
        video_url_json = API.get_video_player_url(bv_id=video_json['data']['bvid'], cid=video_json['data']['cid']).json()
        if video_url_json['code'] == 0 and str('dash') in video_url_json['data']:
            dash_data_json = json.loads(json.dumps(video_url_json['data']['dash']))
            audio_url = dash_data_json['audio'][0]['baseUrl']
            download(url=video_json['data']['pic'], file_name=video_json['data']['title'] + ".png", chunk_size=1024)
            return download(url=audio_url, file_name=video_json['data']['title'] + ".m4a", chunk_size=1024 * 1024)
            # transcode(file_name=video_json['data']['title'] + ".m4a")
    else:
        return "???"


def search_by_keyword(keyword:str, page:int = 1):
    video_list_json = json.loads(API.search_by_keyword(keyword, page))
    if video_list_json['code'] == 0:
        print(video_list_json['data']['result'])
        return video_list_json['data']['result']
    else:
        return json.loads("{}")


def progress_bar(start_time, max_progress, progress):
    a = "*" * progress
    b = "." * (max_progress - progress)
    c = (progress / max_progress) * 100
    dur = time.perf_counter() - start_time
    print("\r{:^3.0f}%[{}->{}]{:.2f}s".format(c, a, b, dur), end="")
    time.sleep(0.1)


@app.route('/search', methods=['GET',])
def app_search():
    keyword = request.args.get('keyword')
    page = request.args.get('page', default=1)
    data = search_by_keyword(keyword, page)
    response = make_response(data, 200)
    response.mimetype = "application/json"
    return response


@app.route('/process_task', methods=['GET',])
def app_process_task():
    bv_id = request.args.get('bv_id')
    print(bv_id)
    response = make_response(get_info_bv_id(bv_id), 200)
    response.mimetype = "application/text"
    return response


@app.route('/')
def homepage():
    if request.method == 'POST':
        pass
    # response = make_response( "<p>python success</p>", 200)
    # response.mimetype = "application/text"
    # return response
    return "<p>python success</p>"



if __name__ == '__main__':
    # get_info_bv_id('BV1Hp4y1Y7ao')
    app.run(host='127.0.0.1', port=5000, use_reloader=False)