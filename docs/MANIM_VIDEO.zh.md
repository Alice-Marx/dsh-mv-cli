# 导入 Manim 原版 MV 与普通本地视频

播放器支持 `canvas.renderer: "video"`，直接播放本地成片，保留 Manim 渲染出的数学板书、字幕、动画和原始帧。视频通过 Host 的 MV 包文件读取通道送到播放器，并由 Desktop 的浏览器解码。

适用项目：[Alice-Marx/manim-for-world-execute-me](https://github.com/Alice-Marx/manim-for-world-execute-me)。以下源文件结构与输出路径依据上游提交 `573ffe24270888c22affe20b4dff2b27ee2a3e7c`。它提供 Manim 源码，需要先在本机渲染；导入工具只读取已有视频与时间常量。

## 先渲染上游项目

按上游 README 安装 Python、Manim 与系统依赖。上游 Bash 构建流程可在 Linux、WSL 或配置了相应依赖的 Bash 环境运行：

```bash
git clone https://github.com/Alice-Marx/manim-for-world-execute-me.git
cd manim-for-world-execute-me
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
./build.sh -ql
```

`-ql` 先生成 480p15 预览，确认后可用 `./build.sh -qh` 渲染 1080p60。构建脚本在 `out/` 生成：

| 文件 | 播放方式 |
|---|---|
| `world-execute-me-manim-silent.mp4` | 原版画面，配合你本地的音轨 |
| `world-execute-me-manim.mp4` | 构建时提供音轨则已混音；未提供时是静音副本 |

在 Windows 原生 Manim 环境也可直接运行：

```powershell
python -m manim -ql --disable_caching --media_dir media scenes/world_execute_me.py WorldExecuteMe
```

此命令输出 `media/videos/world_execute_me/480p15/WorldExecuteMe.mp4`。可直接传这个文件给导入工具并加 `--manim`；只有上游 `build.sh` 会整理 `out/` 输出。

## 生成可加载的 MV 包

Node.js 版本要求为 20 或更新。通过 npm 执行导入工具：

```powershell
npx --yes --package @ljwei-stak/dsh-mv-cli@0.12.0 dsh-mv-import-video "D:/MV/manim-for-world-execute-me" --out "D:/MV-packs/manim-original"
```

在项目源码目录也可运行 `node .dsh-plugin/import-video.mjs`；全局 npm 安装该包后可直接使用下方的 `dsh-mv-import-video` 命令。仅在 Harness 内安装插件不会把命令添加到系统 PATH；这种情况下请为下方示例加上 `npx --yes --package @ljwei-stak/dsh-mv-cli@0.12.0` 前缀。`--out` 必须指定尚不存在的新目录。

已有混音成片：

```powershell
dsh-mv-import-video "D:/MV/manim-for-world-execute-me" --out "D:/MV-packs/manim-original"
```

目录输入会优先选择 `out/world-execute-me-manim.mp4`，缺少它时使用静音成片。使用你自己的本地音轨时，会优先选择静音成片：

```powershell
dsh-mv-import-video "D:/MV/manim-for-world-execute-me" --out "D:/MV-packs/manim-with-song" --audio "D:/Music/world-execute-me.mp3"
```

直接导入 Manim 文件：

```powershell
dsh-mv-import-video "D:/MV/manim-for-world-execute-me/media/videos/world_execute_me/480p15/WorldExecuteMe.mp4" --manim --out "D:/MV-packs/manim-preview" --audio "D:/Music/world-execute-me.mp3"
```

普通本地视频也可以导入：

```powershell
dsh-mv-import-video "D:/Videos/my-video.mp4" --out "D:/MV-packs/my-video" --title "我的 MV"
```

随后在插件的 MV 包加载入口选择生成的文件夹或其中的 `mv.json`。播放器使用视频自身时间轴；如果包指定外部 `audio`，由外部音轨发声并对齐画面。没有外部音轨时使用视频内的声音，静音视频则仍可播放画面。

导入工具输出 JSON，成功包含 `manifestPath`、`manifest` 和 `warnings`；失败在标准错误输出 JSON，进程退出码为 `1`。包只写入 `mv.json`，所有媒体使用原文件的绝对路径。移动或删除原视频、音轨、歌词会使包引用失效；跨设备使用时需重新导入。

## 音轨与歌词对齐

上游 `cues.py` 的默认 `AUDIO_OFFSET = 5.16` 表示视频最前方有 5.16 秒标题卡，歌曲歌词时间从标题卡之后开始。

| 输入 | 导入设置 | 含义 |
|---|---|---|
| 含前置静音的参考音轨 | `--audio song.mp3` | 外部音轨偏移默认 `0`，前置静音已经在音轨里 |
| 去掉了前置静音的音轨 | `--audio song.mp3 --audio-offset 5.16` | 将音轨开始位置推迟到标题卡之后 |
| 上游歌曲时间轴的本地歌词 | `--lyrics world-execute-me.lrc` | Manim 输入默认将歌词时间整体加上 `AUDIO_OFFSET` |
| 已按成片时间轴制作的歌词 | `--lyrics final.lrc --lyrics-offset 0` | 使用歌词已有时间 |

导入源目录时，工具只读取 `cues.py` 顶层 `AUDIO_OFFSET` 的数值字面量，支持你修改后重新渲染的时间值；不会执行 Python。未找到可读取的数值时会返回提示并使用 `5.16`。直接传视频文件时，只有指定 `--manim` 才启用此默认时间，普通视频默认歌词偏移为 `0`。偏移值允许范围为 `-30` 到 `30` 秒。

示例：原版静音画面、去掉前置静音的音轨、本地歌曲时间歌词：

```powershell
dsh-mv-import-video "D:/MV/manim-for-world-execute-me" --out "D:/MV-packs/manim-local" --audio "D:/Music/trimmed.mp3" --audio-offset 5.16 --lyrics "D:/MV/manim-for-world-execute-me/world-execute-me.lrc"
```

Manim 底部字幕已经写进视频帧。生成的包设定 `canvas.subtitles: false`，避免再覆盖一层字幕；附加歌词仍可供播放器的歌词视图使用。视频没有烧录字幕且需要覆盖歌词时，可在 `mv.json` 将 `canvas.subtitles` 改为 `true`。

## 清单示例与格式限制

```json
{
  "format": "dsh-mv-pack",
  "version": 1,
  "title": "world.execute(me); — Manim",
  "video": { "file": "D:/MV/out/world-execute-me-manim-silent.mp4", "offset": 0 },
  "audio": { "file": "D:/Music/world-execute-me.mp3", "offset": 0 },
  "lyrics": { "file": "D:/MV/world-execute-me.lrc", "offset": 5.16 },
  "canvas": { "renderer": "video", "subtitles": false }
}
```

支持本地 `.mp4`、`.m4v`、`.mov`、`.webm`、`.mkv`，实际能否解码仍取决于 Desktop 浏览器支持的音视频编码。Manim 输出的 H.264 MP4 是建议格式；容器扩展名不会自动转换编码。不支持的编码需用你自己的媒体工具另行转换后重新导入。视频与外部音轨各限 1 GiB，歌词限 8 MiB。

导入工具不下载音源、分发成片或复制商业歌曲。此项目交付 CLI、播放器支持与使用文档；使用者提供自己有权使用的本地媒体。视频包不运行上游代码，也不启动 Manim、Python 或 ffmpeg。
