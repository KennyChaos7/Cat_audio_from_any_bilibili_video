import json
import os
import time
from tqdm import tqdm
import wbi as API
import requests
from PIL import Image
from flask import Flask, render_template, request
from flask_cors import cross_origin

app = Flask(__name__)
path = os.getcwd()
if os.path.exists(path + "/output") is False:
    os.mkdir(path + "/output")
path += "/output/"


def download(url: str, file_name: str, chunk_size: int):
    print(file_name + " downloading .... ")
    resp = requests.get(
        url=url,
        headers=API.req_headers,
        stream=True
    )
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


def main(bv_id: str):
    video_json = API.get_video_simple_info(bv_id).json()
    if video_json['code'] == 0:
        video_url_json = API.get_video_player_url(video_json['data']['bvid'], video_json['data']['cid']).json()
        if video_url_json['code'] == 0 and str('dash') in video_url_json['data']:
            dash_data_json = json.loads(json.dumps(video_url_json['data']['dash']))
            audio_url = dash_data_json['audio'][0]['baseUrl']
            download(url=video_json['data']['pic'], file_name=video_json['data']['title'] + ".png", chunk_size=1024)
            return download(url=audio_url, file_name=video_json['data']['title'] + ".m4a", chunk_size=1024 * 1024)
            # transcode(file_name=video_json['data']['title'] + ".m4a")


def progress_bar(start_time, max_progress, progress):
    a = "*" * progress
    b = "." * (max_progress - progress)
    c = (progress / max_progress) * 100
    dur = time.perf_counter() - start_time
    print("\r{:^3.0f}%[{}->{}]{:.2f}s".format(c, a, b, dur), end="")
    time.sleep(0.1)


@app.route('/process_task', methods=['GET',])
def app_process_task():
    bv_id = request.args.get('bv_id')
    print(bv_id)
    main(bv_id)
    return bv_id


@app.route('/')
def homepage():
    if request.method == 'POST':
        pass
    return "<p>python success</p>"


if __name__ == '__main__':
    # main('BV1Hp4y1Y7ao')
    app.run(host='127.0.0.1', port=5000, use_reloader=False)
