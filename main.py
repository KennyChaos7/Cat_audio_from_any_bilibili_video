import json
import os
import time
import wbi as API
import requests

path = os.getcwd()
if os.path.exists(path + "/output") is False:
    os.mkdir(path + "/output")
path += "/output/"


def download(url: str, file_name: str):
    # if os.path.exists(path + file_name):
    #     file_name = "复制 " + file_name
    print(file_name + " downloading .... ")
    file_cache = requests.get(
                url=url,
                headers=API.req_headers
            )
    tmp_file_name = str(round(time.time()))
    if ".m4a" in file_name:
        tmp_file_name += ".m4a"
    elif ".png" in file_name:
        tmp_file_name += ".png"
    with open(path + tmp_file_name, 'wb') as file:
        file.write(file_cache.content)
    if ".m4a" in file_name:
        print(file_name + " transcoding .... ")
        os.system("ffmpeg -i " + path + tmp_file_name + " -acodec copy " + path + tmp_file_name[0:-4] + ".aac")
        os.rename(path + tmp_file_name[0:-4] + ".aac", path + file_name[0:-4] + ".aac")
        # os.remove(path + tmp_file_name[0:-4] + ".m4a")
        os.rename(path + tmp_file_name[0:-4] + ".m4a", path + file_name[0:-4] + ".m4a")
    else:
        os.rename(path + tmp_file_name[0:-4] + ".png", path + file_name[0:-4] + ".png")


if __name__ == '__main__':
    video_json = API.get_video_simple_info('BV1WX4y1L7je').json()
    if video_json['code'] == 0:
        video_url_json = API.get_video_player_url(video_json['data']['bvid'], video_json['data']['cid']).json()
        if video_url_json['code'] == 0 and str('dash') in video_url_json['data']:
            dash_data_json = json.loads(json.dumps(video_url_json['data']['dash']))
            audio_url = dash_data_json['audio'][0]['baseUrl']
            download(url=video_json['data']['pic'], file_name=video_json['data']['title']+".png")
            download(url=audio_url, file_name=video_json['data']['title']+".m4a")
