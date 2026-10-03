# NOTICE / 声明

`@ljwei-stak/dsh-mv-cli`（dsh-mv）是**非官方的同人工具**，与 Mili、DeepSeek 及下列项目的作者均无隶属关系。
This is an **unofficial fan work**, not affiliated with Mili, DeepSeek, or the authors listed below.

## 1. 歌曲与歌词 / Song and lyrics

《world.execute(me);》的作曲、作词、录音及其歌词文本的一切权利归 **Mili** 及其权利人所有。
本插件**不包含**任何音频、视频、歌词文本、频谱数据或字体；用户需自行提供合法取得的音频与歌词文件，
文件只在用户本机的 Harness 里读取，不会上传。（0.6.0 起包内附带第 3 节所述、按 CC BY-NC-SA 4.0 授权的鲸鱼娘立绘。）

All rights in "world.execute(me);" (composition, lyrics, recordings) belong to Mili and the respective rights
holders. The package ships **no** audio, video, lyric text, spectrum data or fonts; users supply their own files.
(Since 0.6.0 it includes the CC BY-NC-SA 4.0 whale-girl artwork described in section 3.)

## 2. 场景与时间轴：world.execute-me-ascii（经作者许可移植）/ Scenes and timing (ported with permission)

- 原项目：<https://github.com/yym8224961/world.execute-me-ascii>，作者 **yym8224961**（Bilibili UP 主「野生大K」）。
- `.dsh-plugin/client/mv/scenes.gen.mjs`、`film.mjs`、`canvas.mjs` 是该项目 `scenes.py` / `player.py`
  （`Film.render(t, w, h)`、Canvas、字体、章节与时间轴）的 JavaScript 移植（`scenes.gen.mjs` 由 `tools/py2js.py`
  从用户本机的 `scenes.py` 机械转译后再手工修正）。
- **许可情况**：
  1. 作者在其 Bilibili 视频的置顶评论中表示该项目已开源、可以在各种终端中播放，并给出了上面的 GitHub 链接；
  2. 作者于 **2026-10-03** 直接向本插件作者 **Alice-Marx** 表示同意修改和使用该项目。
- **注意**：截至 2026-10-03，该仓库**没有 LICENSE 文件**。「开源」的口头表述和私下同意都不等同于明确的开源许可证，
  其效力和范围（例如是否允许他人再分发本移植）并不确定。建议：
  - 把作者的同意**保存为书面记录**（截图/私信/邮件，注明日期和许可范围）；
  - 请作者在原仓库**添加 LICENSE**（例如 MIT），届时本项目将按该许可证更新本声明。
- 如果作者撤回同意或提出其他要求，本项目会按其要求修改或移除移植部分。
- 第三方如需复用上述移植文件，请先自行取得原作者许可；本仓库的 MIT 许可证**不覆盖**这些文件（见 LICENSE 末尾）。

The scene/timing code is a port of world.execute-me-ascii by yym8224961 (Bilibili: 野生大K). The author's pinned
comment describes the project as open source and playable in various terminals, and the author directly granted
Alice-Marx permission to modify and use it on 2026-10-03. The repository has **no LICENSE file**, so this is a
permission, not an open-source licence: get it in writing and ask the author to add a LICENSE. The MIT licence of
this repository does not cover the ported files.

## 3. dsh PV 预设：world-execute-me-dsh-pv（MIT）与鲸鱼娘立绘（CC BY-NC-SA 4.0）/ dsh PV preset

**整个 npm 包的许可是 `(MIT AND CC-BY-NC-SA-4.0)`，不是纯 MIT。The package as a whole is not purely MIT.**

- **代码与数据（MIT）**：「world.execute(me); dsh PV」画布预设移植自 **MisakaZentai / world-execute-me-dsh-pv**
  （<https://github.com/MisakaZentai/world-execute-me-dsh-pv>，commit `a4dd0f7`，MIT，Copyright (c) 2026 MisakaZentai）。
  `.dsh-plugin/client/mv/dshpv/*.mjs` 是其合成渲染器的 JavaScript 重写；`.dsh-plugin/assets/dsh-pv/` 里的
  `timeline.json`、`chat.json`、`band.json` 是在本机运行上游渲染器后记录的绘制指令、对话窗口内容与时间表，
  MIT 全文见该目录的 `NOTICE.md`。数据中的歌词只以 sha256 和时间出现，不含歌词文字；`IF I CAN` 等歌词横幅已替换。
  DeepSeek 前端的 CSS / 图标 / 字体和上游的字体都没有复制，窗口为原生重画。
- **立绘（CC BY-NC-SA 4.0）**：`.dsh-plugin/assets/dsh-pv-art/` 里的 8 张表情和 1 张女仆立绘（缩小为 200×360 WebP）
  按 **署名-非商业性使用-相同方式共享 4.0 国际** 授权，许可全文为该目录的 `LICENSE`，署名链与改动见其 `NOTICE.md`：
  1. 角色原作 溟月（鲸鱼娘）© **上善无形 / 上善**；
  2. 女仆版设计 **ZipZipPipe**（Pixiv 作品 148186519；据上游说明使用 AI 图像模型 GPT Image 2 生成）；
  3. 立绘 **Small-tailqwq / dsh-deep-whale** `maid-atelier`；
  4. 八种表情 **dsh-whale-galgame**；
  5. 经 **MisakaZentai / world-execute-me-dsh-pv** 取得。
  上游的原始 NOTICE 保留在同一目录。运行时画布对这些图做裁切、像素化、调色和故障效果，这些改编画面同样按
  CC BY-NC-SA 4.0 共享。**不得商用**；改编须按同一许可分享。需要纯 MIT 的构建时删掉该目录，预设改画占位剪影。
- The dsh PV preset is a JavaScript port of MisakaZentai/world-execute-me-dsh-pv (MIT); its recorded data lives in
  `.dsh-plugin/assets/dsh-pv/` (MIT notice inside). The whale-girl images in `.dsh-plugin/assets/dsh-pv-art/` are
  CC BY-NC-SA 4.0 with the attribution chain above (licence text and chain in that folder). Non-commercial;
  share-alike. Delete the folder for an MIT-only build.
- 0.6.0 以前 MV 终端可以启动用户本机的 **world_execute_me**（`tui_live.py`，作者 林原林海 / MisakaZentai 等）；
  **0.6.0 已删除该功能**，本插件从未包含其文件。

## 4. 相关作品 / Related work

- world-execute-me-ascii-rust（<https://github.com/bilixxb/world-execute-me-ascii-rust>，作者 bilixxb）：world.execute-me-ascii 的
  Rust 重写版。0.2.x–0.3.x 的 MV 终端可以启动用户自己下载的这个程序；**自 0.4.0 起已移除该支持**，本插件从未复制其任何代码或数据。
- world-execute-me-dsh-pv：见第 3 节；音频版本识别表里还包含其音频文件的 sha256（只存哈希）。
- React（MIT）打包进客户端。0.6.0 起不再使用 xterm.js 和 @lydell/node-pty。
- **King-LRC-Waveform-Editor**（<https://github.com/TKCB/King-LRC-Waveform-Editor>，作者 TKCB，MIT）：0.5.0 的歌词校准编辑器
  （波形上拖动歌词块、打点、微调快捷键等交互）参考了它的设计；代码为重新编写，未复制其源文件。Calibration editor interaction
  ideas adapted from King-LRC-Waveform-Editor (MIT, © TKCB); no source files were copied.

## 5. 歌词引擎与在线服务（不随包分发）/ Lyrics engine and online service (not bundled)

用户确认后，插件用 uv 把下列软件和模型下载到 `%LOCALAPPDATA%\dsh-mv\engine`，它们按各自许可证使用，不随本包分发：
PyTorch（BSD-3-Clause）、faster-whisper（MIT，SYSTRAN）、CTranslate2（MIT）、Demucs / htdemucs（MIT，Meta）、
julius（MIT）、PyAV（BSD-3-Clause，FFmpeg 为 LGPL）、Hugging Face Hub 客户端（Apache-2.0）、
OpenAI Whisper 模型权重（MIT，经 Systran 转换为 CTranslate2 格式）。
**LRCLIB**（<https://lrclib.net>）是社区维护的免费歌词库；查询只发送歌名、歌手、专辑和时长，歌词内容的权利归原权利人所有，
可以在设置 `lrclib` 中关闭。
