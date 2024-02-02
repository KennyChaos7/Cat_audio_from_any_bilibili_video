#CAFV
> 本质上通过对bv号发出请求获取视频的地址，然后利用ffmpeg只拉去音频流，并保持文件和视频的封面等信息，再通过将封面信息整合进音频文件中或者再开发一个专用播放器

- 资源
  - 视频
    https://upos-sz-mirror08c.bilivideo.com/upgcxcode/04/15/1225081504/1225081504-1-16.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&uipk=5&nbs=1&deadline=1706851556&gen=playurlv2&os=08cbv&oi=1947651412&trid=e10b79230f084a6eb20b0522aa3f4637h&mid=0&platform=html5&upsig=f55ed24fb571db9a300d7e8d2998ba49&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&bvc=vod&nettype=0&f=h_0_0&bw=48958&logo=80000000
  - 阿b接口
    https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/videostream_url.md
    - 对应postman
      https://api.bilibili.com/x/player/playurl?bvid=BV1WX4y1L7je&cid=1225081504&qn=80&platform=html5&high_quality=1 