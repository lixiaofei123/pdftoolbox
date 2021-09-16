
[![docker build](https://github.com/lixiaofei123/pdftoolbox/actions/workflows/docker.yml/badge.svg)](https://github.com/lixiaofei123/pdftoolbox/actions/workflows/docker.yml)

## 一个简单的在线压缩pdf网站

使用 [GhostScript](https://www.ghostscript.com) 进行压缩

## 使用方法

### 使用Docker部署

建议使用Docker一键部署

```
docker run -d --name pdftoolbox --restart=always -p 8082:8082 -v /data/pdftoolbox/input:/opt/pdftoolbox/input  -v /data/pdftoolbox/output:/opt/pdftoolbox/output  mrlee326/pdftoolbox
```

启动成功后，在浏览器中访问 http://ip:8082，如下图所示

![pdf在线压缩首页](./images/index.jpg)

点击【点击此处上传】按钮，选择要转换的文件，即可上传。目前支持三种压缩质量
 - 高质量 (300dpi)
 - 中质量 (150dpi)
 - 低质量 (72dpi)

### 在Linux上部署

请参考Dockerfile文件





