# dsh-mv-cli · world.execute(me); 放映室

[English](README.md) · 简体中文

DeepSeek Harness Desktop 插件（`@ljwei-stak/dsh-mv-cli`，profile 条目 id `dsh-mv`）。在工作台的 `<canvas>` 上放映**终端风格 MV**，以你自己的音频为时钟逐帧渲染：

| 曲目 | 做什么 | 需要你提供 |
| --- | --- | --- |
| **world.execute(me);**（内置预设） | Mili《world.execute(me);》的 ASCII MV（五个章节），移植自 world.execute-me-ascii | 一个音频或视频文件；可选歌词与 `spectrum.json` |
| **world.execute(me); dsh PV**（0.6.0 新增的内置画布预设） | MisakaZentai「大肥鱼眼中的 world.execute(me)」PV 的实时 JavaScript 移植：DeepSeek 窗口、终端界面、鲸鱼娘立绘，随你的音频实时同步 | 同一首歌的音频；可选带时间的歌词（LRC） |
| **MV 包**（`mv.json`） | 任何歌：通用频谱 + 歌词渲染器，或沙箱里的场景脚本；还可以让 Harness 的 Agent [帮你做 MV 包](#用-ai-制作新-mv) | 你的音频、歌词 |

> **0.6.0 起删除了「面板终端」和「独立窗口」两种播放方式**（以及 node-pty / xterm.js、tui_live.py 集成和 MCI 用的自动 WAV 转换）。插件只在画布上播放，不再运行任何外部播放器；旧 `mv.json` 里的 `terminal` 字段会被忽略并提示。

> **非官方同人作品。** 插件**不附带**任何音频、视频、歌词文本或字体；歌曲与歌词的权利归 Mili。world.execute(me) 预设的场景与时间轴移植自 [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii)（Bilibili「野生大K」），**经原作者许可**。dsh PV 预设移植自 [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)（MIT），并附带其 **CC BY-NC-SA 4.0** 的鲸鱼娘立绘（见 [许可](#许可)）。详见 [NOTICE.md](NOTICE.md)。

## 界面一览

像音乐播放器一样从上到下：

1. **曲库**：卡片列出两个内置预设（world.execute(me) 和 world.execute(me); dsh PV）、最近导入的 MV 包，以及「用 AI 制作新 MV」「导入 MV 包」「新建（模板）」。
2. **正在播放**：当前曲目的标题和艺术家，右侧一个 **▶ 播放** 按钮。
3. **画面**：画布和播放条（播放/暂停、进度、时间、章节、音量、音频同步、键盘快捷键、全屏）。
4. **设置**（默认折叠）：字号、字幕偏移等。
5. 右上角 **ⓘ**：关于、版权与署名。后台版本与界面不一致时，标题栏会出现一个提示「请完全重启 Harness」。

面板使用不透明背景，跟随 Harness 的浅色 / 深色主题。

## 安装

**从 npm 安装（推荐）：** **DeepSeek Harness Desktop → 插件 → 添加插件**，填 `@ljwei-stak/dsh-mv-cli@0.6.0`（或直接填 `@ljwei-stak/dsh-mv-cli` 安装最新版），安装并启用。

**用本地安装包：** 从 GitHub Release 下载 `ljwei-stak-dsh-mv-cli-0.6.0.tgz` 和对应的 `.sha256`，用 PowerShell 核对：
`Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\Users\<你>\Downloads\ljwei-stak-dsh-mv-cli-0.6.0.tgz'`，
然后在 **插件 → 添加插件** 里填该 `.tgz` 的绝对路径。

两种方式装好后：

1. **完全退出 Harness（包括托盘图标）后重新打开**：Host 进程只有完全重启才会加载新的插件代码。界面顶部若出现「后台版本与界面不一致」，就是没有完全重启。
2. 左侧边栏在内置入口（插件 / 自动化任务 / …）下面出现 **MV 放映室**，点它就在主区域打开面板；插件详情页（插件 → dsh-mv-cli）也有「打开 MV 放映室」按钮。

> 升级后请完全退出 Harness 一次（包括托盘图标），否则面板会提示「后台版本与界面不一致」。0.1.1 不会显示侧边栏入口，请使用 0.1.2 及以后的版本。

0.6.0 不再有任何原生依赖（node-pty 已删除），安装更快。

## MV 包：播放任意歌曲

**MV 包** 是一个带 `mv.json` 清单的文件夹。清单写明你自己的音频、歌词和可选频谱文件（路径相对于该文件夹），以及怎么画这首歌：
- 用内置的 **通用（generic）** 画布渲染（频谱条、标题、当前与下一句歌词、进度条），任何歌都能放；
- 用内置的 **world-execute-me** 场景，或 **dsh-pv** 预设（`canvas.renderer: "dsh-pv"`，只适合同一首歌）；
- 用 **场景脚本**（`canvas.renderer: "script"`、`canvas.script: "scenes.js"`）：用普通 JavaScript 写自己的 `render(t, cols, rows, ctx)`，在 Web Worker 沙箱里运行并限制每帧耗时（出错时自动换回通用画面）。接口见模板里的 README；

0.6.0 起不再支持外部 TUI 程序：旧包里的 `terminal` 字段会被忽略，并在导入时提示。内置的 world.execute(me) 预设仍是列表里的默认项。

在面板顶部的 **曲库** 里：

1. **新建（模板）**：选一个文件夹，插件在其中新建 `dsh-mv-pack-template`（不会覆盖已有文件）。里面有：
   - `mv.json`；
   - `mv.schema.json`（VS Code 补全与校验）；
   - 中英文 README；
   - 占位的 `lyrics.example.lrc`；
   - `examples/`（用 MV 包写法表示的 world.execute(me) 和 dsh PV，以及 `scenes.example.js`）。

   导入对话框里的 **下载模板 zip** 得到同样的文件。
2. 把你自己的音频（任意[支持的格式](#音频格式)）和歌词放进去，编辑 `mv.json`。
3. **导入 MV 包** → **选择文件夹…**，或粘贴文件夹 / `mv.json` 的路径。导入只读取清单。
   - 最近用过的包（最多 8 个）记在本机，作为卡片出现在曲库里（卡片右上角 × 可移除）。
   - 下次打开会恢复上次的包。
4. 点 **▶ 播放**：音频由 Host 分块读取，歌词和频谱一起载入。

最小的 `mv.json`：

```json
{
  "$schema": "./mv.schema.json",
  "format": "dsh-mv-pack",
  "version": 1,
  "title": "我的歌",
  "artist": "某人",
  "audio": { "file": "song.mp3", "offset": 0 },
  "lyrics": { "file": "lyrics.lrc" },
  "canvas": { "renderer": "generic" }
}
```

字段说明：
- 必填：`format`、`version`、`title`。
- 可选：`artist`、`album`、`credits[]`、`notice`、`duration`、`audio {file, offset}`、`lyrics {file, offset}`（LRC/SRT/VTT/lyrics.json）、`spectrum {file}`、`canvas {renderer: generic | world-execute-me | dsh-pv | script, script, fontSize}`。`terminal`（0.6.0 以前的外部播放器）会被忽略并提示。
- 未知字段报错，自定义数据用 `x-…`。
- 相对路径不允许 `..`。

## 用 AI 制作新 MV

**曲库 → 用 AI 制作新 MV** 把你手上的任意一首歌做成 MV 包：由 Harness 的 Agent 来写歌词时间轴、`mv.json` 和 ASCII 场景脚本。

1. 点 **用 AI 制作新 MV** 卡片，在对话框里填写：
   - **选择音频…**：Chromium 能解码的任意音频或视频文件（见 [音频格式](#音频格式)），旁边会显示按内容识别出的格式。
   - **歌名**（按文件名预填）和可选的 **歌手**。
   - **歌词**（可选）：直接粘贴，或 **从文件读取…**。带时间轴的 LRC 最好；纯文本也可以，Agent 会估计时间。
   - **风格说明**（可选）：你想要的画面，例如「赛博朋克雨夜、副歌时满屏代码雨」。
   - **保存位置**：默认 `%LOCALAPPDATA%\dsh-mv\packs`，在这里新建一个以歌名命名的子文件夹，不会覆盖已有文件。
2. **创建 MV 包**：面板在本机解码音频、计算 `spectrum.json`（48 个频段、20 fps），Host 建好文件夹：音频副本 `audio.<扩展名>`、`spectrum.json`、你的歌词（`lyrics.lrc` / `lyrics.txt`）、能直接播放的 `mv.json`（通用渲染）、`scenes.js`（示例场景）、`mv.schema.json`、README 和 `AGENT.md`（给 Agent 的任务说明与场景脚本接口）。这个包立刻出现在曲库里，用通用画面就能播放。原文件不会被修改，也不会上传任何东西。
3. **在新会话中交给 AI**：插件把该文件夹加为 Harness 工作区，在其中新建一个名为「MV：<歌名>」的 Agent 会话并发送任务（发送前可以修改提示词）。Agent 阅读 `AGENT.md`，对齐歌词、编写 `scenes.js` 和最终的 `mv.json`，并用插件提供的 Agent 工具 **`mv_pack_validate`**（检查清单、文件、歌词时间轴，并在沙箱里试运行场景脚本）和 **`mv_pack_preview_frame`**（把某一时刻的画面渲染成文本）自查。Harness 可能会请你批准写文件的权限；会话会消耗你的模型额度。
   - 如果你的 Harness 版本没有向插件开放会话接口，对话框会改为显示 **复制提示词**（能打开空白会话时还有 **打开新会话**）：自己在该文件夹上新建会话，粘贴提示词发送即可。
4. Agent 完成后，在曲库里点这个包的卡片重新载入，再点 **▶ 播放**。如果场景脚本在面板里出错、太慢或卡住，面板会提示原因并自动换回通用画面。

安全：这个流程里插件不会运行任何外部程序；场景脚本在沙箱中运行（面板里是 Web Worker，Agent 工具里是带时间限制、没有 `require`/`process` 的 `node:vm`）；两个 Agent 工具都是只读的，可以在插件设置里用 `agentTools` 关掉。

## MV 模板：提示词与示例（0.7.0）

**下载模板** 以及每个用 **用 AI 制作新 MV** 新建的包，现在都附带帮助 AI（或你自己）写出高质量 MV 的材料，而不只是一个简单示例：

- `prompts/zh/` 和 `prompts/en/`：`01-creative-brief.md`（根据歌曲、歌词和段落写整体创意）、`02-storyboard.md`（逐段分镜）、`03-scene-script-guide.md`（场景接口、每帧耗时预算、沙箱限制、ASCII / 版式技巧，以及与歌词、逐词时间、频谱和节拍同步）、`04-qa-checklist.md`（完成前自查清单）、`05-iteration.md`（迭代修改用的提示词）。`AGENT.md` 和「在新会话中交给 AI」的提示词会引导 Agent 按这个顺序使用它们。
- `examples/`：七个带注释的小场景模块，改编自 [world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)（MIT，© 2026 MisakaZentai，见 `examples/NOTICE.md`）：`chat-window`（聊天窗口）、`heartbeat`（心跳线）、`ops-ticker`（运维滚动条）、`token-bar`（stdout token 条）、`execution-split`（EXECUTION 分屏）、`whale-fall`（鲸落结尾，剪影由代码绘制，**不含立绘**）和 `post-effects`（后期效果）。每个都能直接在沙箱脚本渲染器里运行。
- `examples/rich-pack/`：完整的多段落示例包（120 秒、6 段、转场、逐词卡拉 OK 高亮、频谱环、节拍脉冲、副歌故障效果、鲸落结尾），**歌词为占位文字、不含音频**：放入你自己的音频即可试看。
- 场景 `ctx` 新增：`ctx.section` / `ctx.sections`（来自 `x-dsh-mv-ai.sections`）、`ctx.beat`（来自 `canvas.bpm` / `canvas.beatOffset`）、`ctx.lyric.words` / `word` / `progress`（来自增强 LRC 的 `<mm:ss.xx>` 逐词时间或 `timing.json`）。

## 创意工坊（0.7.0）

社区 MV 包画廊，基于公开 GitHub 仓库 [Alice-Marx/dsh-mv-workshop](https://github.com/Alice-Marx/dsh-mv-workshop)，没有自建服务器。每个包是一个 `packs/<id>/` 文件夹（`mv.json`、场景脚本、`cover.png`/`.webp`、README，可选 `lyrics.timing.json`）。GitHub Actions 检查每个 PR（结构、大小限制、不得含音频或歌词文本文件、必须声明许可、沙箱安全的静态检查、在几个时间点试运行场景），合并后重新生成带每个文件 sha256 的 `index.json`。

**安装与播放**

1. **曲库 → 创意工坊**：浏览封面，按歌名 / 歌手 / 作者 / 标签搜索，按许可或渲染方式筛选，或只看已安装。点卡片查看详情（许可、时长、文件及 sha256、源码链接）。
2. **安装到曲库**：面板从 `raw.githubusercontent.com` 按索引记录的提交下载文件，核对大小和 sha256，再校验一遍后保存到 `%LOCALAPPDATA%\dsh-mv\workshop\<id>`。索引里有新版本时卡片显示 **有更新**（**更新到 …**）；**卸载** 会删除该文件夹。
3. 用**你自己的**音频（以及可选的歌词）播放，面板按包记住你的选择。会比较时长（±2 秒）以及包里存的粗略音频指纹（若有），不一致时提示（可能是其他剪辑版本或别的歌）。包里有 `lyrics.timing.json` 时，按每句的哈希把你的歌词对齐到包的时间轴；工坊包本身从不包含歌词文字。

**发布**

1. 载入你的包，打开创意工坊，点 **发布到工坊…**。填写 id、版本、许可（必填）、作者、简介和标签，选择是否附带音频指纹和封面（当前画面）。
2. **检查并打包**：Host 校验这个包，**去掉音频、频谱和歌词文本**（`lyrics.timing.json` 只保留每句的时间和哈希），写好封面和 README，整理到 `%LOCALAPPDATA%\dsh-mv\workshop-publish\<id>\packs\<id>\`。对话框列出所有文件和步骤，并给出可直接使用的 PR 标题和说明。
3. 勾选确认框后，**在 GitHub 上提交…** 会在浏览器里打开 `packs/<id>` 的 GitHub 上传页面：把文件拖进去，GitHub 会自动帮你 fork，由你自己创建 Pull Request。插件不会自动提交任何东西。（设备码登录需要 OAuth 应用的 client id，本版未实现。）

信任提示：工坊里的包由其他人编写。它们的场景脚本始终和其他脚本包一样在沙箱中运行（没有网络、存储和 DOM 的 Web Worker，限制每帧耗时，出错自动回退），工坊界面也会显示这条提示。包内不含音频和歌词；请尊重歌曲权利和每个包的许可（仓库默认 CC BY-NC-SA 4.0，包内另有声明的除外）。

## 自动制作歌词时间轴与校准

在 **用 AI 制作新 MV** 对话框里只要选好音频，点 **自动制作**，其余都自动完成，并有步骤进度（任何一步都可以 **停止**）：

1. **建 MV 包**：同上（本机解码、频谱、建文件夹）。歌名 / 歌手 / 专辑从文件标签（ID3、MP4、FLAC、Vorbis/Opus）或文件名读取。
2. **LRCLIB**（可选，设置 `lrclib`，默认开）：到 <https://lrclib.net> 查现成的带时间轴歌词。**只发送歌名、歌手、专辑和时长**，不上传音频、不发送文件名、不需要账号。对话框会显示将要发送的内容；取消勾选或在设置里关掉即完全离线。找到带时间轴的歌词就直接用；只有纯文本时交给引擎对齐。请求会走 `HTTPS_PROXY` 代理。
3. **本机歌词引擎**（没找到时间轴时；有 GPU 时默认也用来核对 LRCLIB 的时间）：可选 Demucs **htdemucs** 分离人声，再用 **faster-whisper**（large-v3 / medium / small；语言 自动 / 中 / 日 / 英 / 韩 / 粤；开启 VAD 和逐词时间）识别。全部在本机运行。
4. **对齐**：把歌词（你粘贴的或 LRCLIB 的）和识别出的词对齐（按词 / 汉字做 Needleman–Wunsch），每句得到一个 **置信度**；LRCLIB 和引擎的时间会合并（整体偏移 + 逐句比对）。完全没有歌词文本时，用识别结果直接成句。
5. **段落**：根据歌词重复、停顿和频谱能量识别主歌 / 副歌 / 桥段 / 间奏 / 前奏 / 尾奏，写入 `sections.json` 和 `mv.json` 的 `x-dsh-mv-ai.sections`。
6. **保存**：`lyrics.lrc`、`timing.json`（逐句置信度）、`sections.json`，并让 `mv.json` 指向 `lyrics.lrc`。之后照常交给 AI；提示词会要求 Agent 保留时间轴、按段落安排场景（是否发送由你决定，发送会消耗模型额度）。

### 安装歌词引擎

引擎是装在 `%LOCALAPPDATA%\dsh-mv\engine` 的独立 Python 环境，不影响你自己的 Python。在对话框里（引擎未安装时）点 **一键安装…**，确认卡片会先显示选项和**下载大小**，确认后才开始下载：

| 选项 | 下载 | 占用磁盘 |
| --- | --- | --- |
| NVIDIA GPU（PyTorch 2.8.0 + CUDA 12.6）+ large-v3 + htdemucs | 约 5.9 GB | 约 9.6 GB |
| NVIDIA GPU + small | 约 3.5 GB | 约 7.1 GB |
| 仅 CPU + small | 约 1.4 GB | 约 2.3 GB |

- 需要 [uv](https://docs.astral.sh/uv/)（在 `PATH`、`%USERPROFILE%\.local\bin` 里，或在设置 `uvPath` 中指定）。uv 会建一个 Python **3.12** 虚拟环境（PyTorch 没有 3.14 的安装包），从 download.pytorch.org 装 `torch==2.8.0`，再按完整的版本约束装 `faster-whisper==1.2.1`、`ctranslate2==4.8.2`、`demucs==4.1.0`、`julius==0.2.8`；模型从 huggingface.co 下载（可断点续传；镜像可填设置 `hfEndpoint`）。面板显示进度和日志；**停止** 会结束整个进程树，下次安装会接着装。
- Host 只运行固定的参数列表（uv，以及 `python -X utf8 -u dsh_mv_engine.py probe|prefetch|transcribe <args.json>`），不经过 shell，也不接受任意命令。识别时 Hugging Face 处于离线模式。
- 想用自己的环境：在设置 `enginePython` 填一个已装好上述依赖的 `python.exe`，面板只做检查。
- CUDA 可用（检查结果为准）时用 GPU，否则用 CPU 并提示较慢——CPU 请选 **small**。

### 歌词校准编辑器

每个 MV 包的画布播放器下面都有 **歌词校准**（有待确认的句子时自动展开）：

- 波形（引擎分离出人声时显示人声，否则显示原曲）上叠着歌词色块：拖两端改开始 / 结束，拖中间整体移动，点空白处跳转；Ctrl+滚轮或 ＋/− 缩放。
- 点一句从它前 2 秒开始播放。**黄色** 的是置信度低的句子，**下一个不确定**（N）跳到下一句。
- 快捷键（先点一下编辑器）：←/→ 把开始时间微调 ±50 ms（Shift ±500 ms，Alt 调结束时间），↑/↓ 选句，Enter 播放，**T** 打点模式（播放时按空格把当前句的开始设为此刻并跳到下一句），S 在播放头处拆分，M 与下一句合并，C 确认，Delete 删除，Ctrl+Z / Ctrl+Y 撤销 / 重做。双击一句可修改歌词和翻译。
- **整体偏移** 让所有句子一起前后移动。每次修改都会立即在 MV 画布上预览。
- **保存** 写回 `lyrics.lrc`、`timing.json` 和 `mv.json`，旧版本保存在 `.dsh-mv-backup\`（每个文件保留最近 10 份）。只能写这几个固定文件名，`mv.json` 会先校验。

## 音频格式

格式一律按文件**内容**判断，不看扩展名（改名为 `.mp3` 的 DASH MP4 会被正确识别为 MP4）。

| 场景 | 支持 |
| --- | --- |
| 画布 MV、MV 包、用 AI 制作新 MV | 面板里 Chromium 能解码的一切：MP3、M4A/AAC（含 ADTS 和 DASH / 分片 MP4）、MP4 / MOV / WebM / MKV 视频文件里的音轨、Ogg Vorbis、Ogg/WebM Opus、FLAC、WAV（PCM、浮点、A-law、μ-law）。 |
| Chromium 解不了的格式（WMA/ASF、AIFF、AMR、AC-3、APE、WavPack、CAF、MPEG-TS、FLV、RF64…） | 如果装了 **ffmpeg**（在 `PATH` 里、位于 `D:\Program Files\FFmpeg\bin\ffmpeg.exe`，或在插件设置 `ffmpegPath` 里指定），面板会提供 **用 ffmpeg 转换…**：先显示完整命令，确认后才运行（固定参数、不经过 shell、最长 10 分钟），结果写入 `%LOCALAPPDATA%\dsh-mv\audio-cache\` 的 WAV 缓存（按源文件 sha256 命名）。没有 ffmpeg 时请自行转换，或选择不播放声音。 |

## 画布 MV

1. 在音频一栏点 **选择…**，选你自己的音频或视频文件（Chromium 能解码的[任意格式](#音频格式)，会显示识别出的格式）。MV 包里的音频解不了而本机有 ffmpeg 时，面板会提供「用 ffmpeg 转换…」。插件在本机计算 sha256，**下次打开自动恢复**（文件保存在 Harness 的 IndexedDB 里，不上传）。
2. 在歌词一栏点 **选择…**：
   - LRC：同一时间戳写两行（英文一行、中文一行），或一行写 `English / 中文`；支持 `[offset:]`。
   - SRT / VTT：每个字幕块两行文本。
   - 或直接选你本地 world.execute-me-ascii 目录下的 `lyrics.json`（`[{time,end,en,zh}]`）。
3. 可选：选该目录下的 `spectrum.json`，画面就和原版终端播放器的频谱逐帧一致；不选则用实时 AnalyserNode。
4. 点 **▶ 播放**（或播放条左侧的圆形按钮）。音频同步可以在播放条上用 −/+ 调整，字幕偏移、字号在「设置」里。点画面获得焦点后用键盘（播放条上的键盘图标也列出了这些按键）：

| 按键 | 作用 |
| --- | --- |
| 空格 / 回车 | 播放 / 暂停 |
| ← / → | 后退 / 前进 5 秒 |
| R | 从头播放 |
| 1–5 | 跳到五个章节（CREATION / DEVOTION / ISOLATION / EXECUTION / LOVE；dsh PV 里是 BOOT / SFT / DEPLOY / REWARD_HACK / EVAL: LOVE） |
| `[` / `]` | 字幕提前 / 延后 0.1 秒（同原版） |
| Alt+`[` / Alt+`]` | 音频同步偏移 −/+ 0.1 秒（画面相对音频整体平移） |
| `,` / `.` | 上一句 / 下一句 |
| + / − | 音量 |
| M | 静音 |
| F 或双击 | 全屏 |
| H | 帮助 |

**同步**：画面时间 = `audio.currentTime + 音频同步偏移`。插件按 sha256 识别几种常见版本并自动套用偏移（2026-10-03 用起音包络互相关实测，10 ms 精度）：

| sha256 前缀 | 来源 | 偏移 |
| --- | --- | --- |
| `40e902…` | world.execute-me-ascii 附带版本（AAC，211.9 s） | 0（时间轴基准） |
| `8b7a41…` | world-execute-me-dsh-pv `input/song.mp3`（AAC） | +0.12 s |
| `79c4e5…` | dsh-pv 参考 MP3（320 kbps） | +0.12 s（推测，未实测） |
| `f98eaa…` | world_execute_me 附带版本（AAC，224.5 s） | −4.83 s |

其他版本默认 0，用 Alt+`[` / Alt+`]` 校准；调整后的两种偏移都按 sha256 保存在本机。没有选音频时进入**静音模式**，画面照常按内部时钟播放。

## dsh PV 画布预设

**world.execute(me); dsh PV** 是 [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)（commit `a4dd0f7`，MIT）的实时 JavaScript 移植：一部以「大肥鱼」（DeepSeek）视角重写 world.execute(me) 的 PV，97 个镜头、10 个章节（BOOT → PRETRAIN → SFT → RLHF → DEPLOY → USER_LEFT → REWARD_HACK → EXECUTION → EVAL: LOVE → WHALE_FALL）。上游是离线渲染成视频的 Python 程序；这里在画布上按你的音频逐帧重画。

**使用：**

1. 更新到 0.6.0，并完全重启 Harness。
2. **MV 放映室 → 曲库 → 「world.execute(me); dsh PV」** 卡片。
3. **音频**：选你自己的《world.execute(me);》音频或视频文件（与另一个预设共用，选过一次两边都能用）。
4. **歌词**（可选，推荐）：选你自己的 LRC。插件把每句歌词的 sha256 和内置的时间表比对，匹配上的句子使用原 PV 的**逐词时间**（打字效果、底部 stdout 词元条、`satisfaction` 镜头里的注意力词元都来自你的歌词）；歌词栏显示「逐词时间匹配 x/y 句」。LRCLIB 上 id 36914646 的歌词能匹配 97/98 句。匹配不足一半时改用你文件里的时间按行显示。不选歌词时，歌词位置留空。
5. **▶ 播放**。键盘、音频同步（Alt+`[` / Alt+`]`）、全屏与另一个预设相同。

**怎么做的：** 在本机用上游的合成渲染器跑了一遍，把每个镜头 2–6 个关键帧（约每 0.5 s 一个）的绘制指令（文字、矩形、线条、颜色、位置）、DeepSeek 窗口的布局与对话内容、各层透明度记录下来，打包为 `.dsh-plugin/assets/dsh-pv/` 下的 `timeline.json`、`chat.json`、`band.json`（约 4.4 MB，npm 包内压缩后更小）。画布按时间回放关键帧，新出现的文字做解码式打字，并补上动态部分：随实时音量跳动的心跳线、右侧 ops 滚动条、stdout 词元条、DeepSeek 窗口（原生重画，不用 DeepSeek 前端的 CSS / 图标 / 字体）、EXECUTION 红色分屏与胶带、结尾鲸落，以及光迹、泛光、扫描线、暗角等后期效果。数据里**不含任何歌词文字**：歌词只以 sha256 和时间出现，构建脚本还检查了不存在任何 4 词以上的歌词片段，歌词全部在运行时取自你的文件。

**还原度：** 镜头结构、时间、文字、布局、对话窗口和歌词条与原 PV 一致；上游的几类位图层（字符舞者、热力格、照片 / 贴图）没有移植，用近似画面代替，「IF I CAN」等大字横幅是近似重画。字体使用系统字体（DejaVu Sans Mono / Consolas / 微软雅黑等），不附带上游字体。

**立绘：** 包里带了上游的 8 张鲸鱼娘表情和 1 张女仆立绘（缩到 200×360 的 WebP），按 **CC BY-NC-SA 4.0** 授权，署名链与改动说明见 `.dsh-plugin/assets/dsh-pv-art/NOTICE.md`。这些角色设计据上游说明是用 AI 图像模型（GPT Image 2）生成的。删掉该目录后预设改画占位剪影。

## 开发

```sh
pnpm install
pnpm test                 # 单元 + 网关边界 + Cordis inject + 客户端加载 + 与原版渲染逐帧对照
npm run build:client      # 生成 .dsh-plugin/client.js
npm run check:client      # 校验 client.js 与源码一致
npm run pack:local        # dist/ljwei-stak-dsh-mv-cli-<版本>.tgz（prepack 会先做 check）
```

- `tools/dsh-pv/`：从上游仓库重新生成 dsh PV 数据的脚本（只在本机运行，需要上游仓库、它的 Python 环境和你自己的歌词；不进 npm 包），见其中的 README。
- `tools/ui-preview/`：面板截图（`node tools/ui-preview/build-preview.mjs && node tools/ui-preview/shoot.mjs <输出目录>`）。
- `tools/py2js.py`：把本地 `scenes.py` 机械转译为 `.dsh-plugin/client/mv/scenes.gen.mjs`（再配合 `pyrt.mjs` 的 Python 语义运行时：banker's round、`//`、`%`、`hash16` 位运算等）。
- `tools/make-goldens.py`：用**原版** `player.Film` 渲染参考帧，只把每帧的 SHA-256 写入 `tests/fixtures/film-goldens.json`（使用占位歌词与合成频谱，不含任何受版权保护的内容）。
- 设置 `REF_ASCII_DIR=<本地 world.execute-me-ascii 目录>` 时，`pnpm test` 会额外跑一项真实歌词的对照测试。

## 已知限制

- 与原版 Python 渲染逐帧对照：1232 个参考帧中约 2% 不一致，全部位于 75–81 s 的 legacy mesh 段，是浮点末位 / z-buffer 平局造成的个别字符差异。
- dsh PV：时间线固定为原曲长度 211.9 s；其他剪辑版本需要用音频同步偏移对齐，长度不同的版本后半段会错位。上游位图层是近似画面；没有附带字体，不同系统上字形略有差异。立绘为 CC BY-NC-SA 4.0（非商业）。npm 包因此增大到约 1.1 MB（解压后约 5.5 MB）。
- 0.6.0 删除了面板终端 / 独立窗口：想用 tui_live.py 请直接在终端里运行它。
- 「用 AI 制作新 MV」需要 Harness 客户端提供 Agent 会话接口（否则请复制粘贴提示词）。场景脚本运行在 Blob Web Worker 里；如果某个 Harness 版本禁止 blob worker，脚本包会用通用画面播放。Agent 工具依赖 Host 的 `tools` 服务；没有时 Agent 按 AGENT.md 自查。
- 超过 1 GB 的音频文件会被拒绝；单个 WAV 缓存最大 1.5 GB（约 2.5 小时）。
- `79c4e5…` 的偏移为推测值。
- 自动时间轴：识别效果取决于混音；快速说唱、重度效果和念白会出现需要检查的黄色句子。LRCLIB 只收录别人上传过的歌，且需要能连上 lrclib.net（连不上时会跳过并提示）。仅 CPU 的 PyTorch 方案没有在测试机上实装；GPU 需要支持 CUDA 12.6 的 NVIDIA 驱动。中文 / 日文按字对齐，只做了单元测试。
- 创意工坊：音频指纹很粗略（只看能量包络），可能漏判或误判不同剪辑；只有文字与包内哈希一致的歌词句子才能对齐时间；GitHub 上传页需要手动拖入文件；raw.githubusercontent.com 有约 5 分钟缓存，新包会延迟出现；CI 里的 `node:vm` 只是检查，不是安全边界（真正的边界是面板的 Worker 沙箱）。

## 许可

npm 包的许可表达式是 **`(MIT AND CC-BY-NC-SA-4.0)`**，整个包**不是纯 MIT**：

- 本插件自写代码为 MIT（见 [LICENSE](LICENSE)）。
- `.dsh-plugin/assets/dsh-pv/`：移植自 MisakaZentai/world-execute-me-dsh-pv 的数据，MIT（Copyright (c) 2026 MisakaZentai，全文见该目录的 NOTICE.md）。
- `.dsh-plugin/assets/dsh-pv-art/`：鲸鱼娘立绘，**CC BY-NC-SA 4.0**（署名 · 非商业 · 相同方式共享），署名链：溟月 © 上善无形 → ZipZipPipe（Pixiv 148186519，AI 生成）→ Small-tailqwq/dsh-deep-whale → dsh-whale-galgame → MisakaZentai。需要纯 MIT 时删掉这个目录即可。
- 移植自 world.execute-me-ascii 的场景文件**不在 MIT 范围内**，是经原作者许可使用；原仓库目前没有 LICENSE 文件——建议保留作者书面同意，并请作者添加 LICENSE。

相关作品与第三方说明见 [NOTICE.md](NOTICE.md)。
