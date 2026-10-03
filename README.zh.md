# dsh-mv-cli · world.execute(me); 放映室

[English](README.md) · 简体中文

DeepSeek Harness Desktop 插件（`@ljwei-stak/dsh-mv-cli`，profile 条目 id `dsh-mv`）。在工作台里放映**终端风格 MV**：内置 Mili《world.execute(me);》场景；其他任何歌曲用 [MV 包](#mv-包播放任意歌曲)（`mv.json`），由通用的频谱 + 歌词渲染器、沙箱里的场景脚本或外部 TUI 程序来画，还可以让 Harness 的 Agent [帮你做 MV 包](#用-ai-制作新-mv)。两种模式：

| 模式 | 做什么 | 需要你提供 |
| --- | --- | --- |
| **画布 MV** | 在面板的 `<canvas>` 上逐帧渲染 ASCII MV（五个章节、全屏、终端配色），以 `<audio>.currentTime` 为主时钟，频谱来自 Web Audio AnalyserNode | 一个音频或视频文件（Chromium 能解码的任意格式）；可选的歌词（LRC / SRT，或你本地 world.execute-me-ascii 的 `lyrics.json`）和 `spectrum.json` |
| **MV 终端** | 在伪终端（ConPTY / node-pty）里运行你本机已有的终端播放器，用 xterm.js（WebGL，自动回退 DOM）显示 | world_execute_me 目录 + 它的 `python.exe`（任意音频格式，自动转成 WAV）；或带 `terminal` 程序的 MV 包 |

> **非官方同人作品。** 插件**不附带**任何音频、视频、歌词文本、频谱数据或美术素材；歌曲与歌词的权利归 Mili。画面场景与时间轴移植自 [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii)（Bilibili「野生大K」），**经原作者许可**。详见 [NOTICE.md](NOTICE.md)。

## 界面一览

像音乐播放器一样从上到下：

1. **曲库**：卡片列出内置的 world.execute(me) 预设和最近导入的 MV 包，以及「用 AI 制作新 MV」「导入 MV 包」「新建（模板）」。
2. **正在播放**：当前曲目的标题和艺术家；右侧选择**在哪里播放**（画布 / 面板终端 / 独立窗口），再点一个大的 **▶ 播放** 按钮。
3. **画面**：画布模式下是画布和播放条（播放/暂停、进度、时间、章节、音量、音频同步、键盘快捷键、全屏）；终端模式下是播放器状态（自动检查路径，问题就地显示并给出一键修复）、确认卡片和终端画面。
4. **设置 / 高级**（默认折叠）：路径、起始秒数、延迟补偿、不播放声音、字号等。
5. 右上角 **ⓘ**：关于、版权与署名。后台版本与界面不一致时，标题栏会出现一个提示「请完全重启 Harness」。

面板使用不透明背景，跟随 Harness 的浅色 / 深色主题。

## 安装

**从 npm 安装（推荐）：** **DeepSeek Harness Desktop → 插件 → 添加插件**，填 `@ljwei-stak/dsh-mv-cli@0.4.0`（或直接填 `@ljwei-stak/dsh-mv-cli` 安装最新版），安装并启用。

**用本地安装包：** 从 GitHub Release 下载 `ljwei-stak-dsh-mv-cli-0.4.0.tgz` 和对应的 `.sha256`，用 PowerShell 核对：
`Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\Users\<你>\Downloads\ljwei-stak-dsh-mv-cli-0.4.0.tgz'`，
然后在 **插件 → 添加插件** 里填该 `.tgz` 的绝对路径。

两种方式装好后：

1. **完全退出 Harness（包括托盘图标）后重新打开**：Host 进程只有完全重启才会加载新的插件代码。界面顶部若出现「后台版本与界面不一致」，就是没有完全重启。
2. 左侧边栏在内置入口（插件 / 自动化任务 / …）下面出现 **MV 放映室**，点它就在主区域打开面板；插件详情页（插件 → dsh-mv-cli）也有「打开 MV 放映室」按钮。

> 升级后请完全退出 Harness 一次（包括托盘图标），否则面板会提示「后台版本与界面不一致」。0.1.1 不会显示侧边栏入口，请使用 0.1.2 及以后的版本。

MV 终端依赖可选依赖 `@lydell/node-pty`（含 Windows 预编译二进制）。若安装时它没装上，面板会提示「管道模式」，此时 tui_live.py 无法正常显示，画布 MV 不受影响。

## MV 包：播放任意歌曲

**MV 包** 是一个带 `mv.json` 清单的文件夹。清单写明你自己的音频、歌词和可选频谱文件（路径相对于该文件夹），以及怎么画这首歌：
- 用内置的 **通用（generic）** 画布渲染（频谱条、标题、当前与下一句歌词、进度条），任何歌都能放；
- 用内置的 **world-execute-me** 场景；
- 用 **场景脚本**（`canvas.renderer: "script"`、`canvas.script: "scenes.js"`）：用普通 JavaScript 写自己的 `render(t, cols, rows, ctx)`，在 Web Worker 沙箱里运行并限制每帧耗时（出错时自动换回通用画面）。接口见模板里的 README；
- 并且/或者用一个 **外部 TUI 程序**（可执行文件或解释器 + 脚本 + 参数模板）。

内置的 world.execute(me) 预设仍是列表里的默认项。

在面板顶部的 **曲库** 里：

1. **新建（模板）**：选一个文件夹，插件在其中新建 `dsh-mv-pack-template`（不会覆盖已有文件）。里面有：
   - `mv.json`；
   - `mv.schema.json`（VS Code 补全与校验）；
   - 中英文 README；
   - 占位的 `lyrics.example.lrc`；
   - `examples/`（Python 播放器示例、用 MV 包写法表示的 world.execute(me)，以及 `scenes.example.js`）。

   导入对话框里的 **下载模板 zip** 得到同样的文件。
2. 把你自己的音频（任意[支持的格式](#音频格式)）和歌词放进去，编辑 `mv.json`。
3. **导入 MV 包** → **选择文件夹…**，或粘贴文件夹 / `mv.json` 的路径。导入只读取清单。
   - 最近用过的包（最多 8 个）记在本机，作为卡片出现在曲库里（卡片右上角 × 可移除）。
   - 下次打开会恢复上次的包。
4. 选「画布」播放该包：音频由 Host 分块读取，歌词和频谱一起载入。包里有 `terminal` 时，终端模式的播放器里可以选 **MV 包渲染程序**。

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
  "canvas": { "renderer": "generic" },
  "terminal": {
    "program": "python/python.exe",
    "script": "player.py",
    "args": ["{script}", { "when": "audio", "args": ["--audio", "{audio}"] }, { "when": "start", "args": ["--start", "{start}"] }],
    "cwd": "pack"
  }
}
```

字段说明：
- 必填：`format`、`version`、`title`。
- 可选：`artist`、`album`、`credits[]`、`notice`、`duration`、`audio {file, offset}`、`lyrics {file, offset}`（LRC/SRT/VTT/lyrics.json）、`spectrum {file}`、`canvas {renderer: generic | world-execute-me | script, script, fontSize}`、`terminal`。
- 未知字段报错，自定义数据用 `x-…`。
- 相对路径不允许 `..`。

`terminal.args` 的占位符：
- `{audio}` `{lyrics}` `{spectrum}` `{script}` `{packDir}` 是绝对路径。
- `{start}` `{offset}` 是数字（`{offset}` = 面板填写值 + `audio.offset`）。
- `{{` / `}}` 表示字面大括号。
- `{ "when": "audio|lyrics|spectrum|start|offset", "args": [...] }` 只在条件成立时加入这些参数。
- 数组的每一项就是一个参数，不经过 shell。

**外部渲染程序的安全措施。** 包里的程序本质上是任意代码，因此：
- 导入时不运行任何东西。
- **检查** 会在 Host 上重新读取 `mv.json`，并核对程序、脚本和媒体文件是否存在。
- 确认卡片显示 Host 解析出的完整命令、逐个参数和工作目录，确认后才启动。
- 确认之后若 `mv.json` 被改动，Host 会拒绝启动。
- `.bat`/`.cmd`/`.ps1`/`.vbs`/`.js`/`.lnk` 等文件不能作为程序；Windows 上程序必须是 `.exe`。
- 独立窗口（cmd.exe）模式下，凡是含 `% ! " ^ & | < >` 或换行的路径和参数一律拒绝。括号可以用，因为每个参数都加了引号。

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

## 音频格式

格式一律按文件**内容**判断，不看扩展名（改名为 `.mp3` 的 DASH MP4 会被正确识别为 MP4）。

| 场景 | 支持 |
| --- | --- |
| 画布 MV、MV 包、用 AI 制作新 MV | 面板里 Chromium 能解码的一切：MP3、M4A/AAC（含 ADTS 和 DASH / 分片 MP4）、MP4 / MOV / WebM / MKV 视频文件里的音轨、Ogg Vorbis、Ogg/WebM Opus、FLAC、WAV（PCM、浮点、A-law、μ-law）。 |
| MV 终端（tui_live.py，Windows MCI） | MP3 和 PCM WAV 直接播放；**上面的其他格式在点 ▶ 播放时自动转换**：面板解码，Host 把 16 位 PCM WAV 存到 `%LOCALAPPDATA%\dsh-mv\audio-cache\`，按源文件 sha256 命名，下次播放直接复用（保留最近 8 个）。进度显示在「播放器」卡片里；原文件不会被修改。 |
| Chromium 解不了的格式（WMA/ASF、AIFF、AMR、AC-3、APE、WavPack、CAF、MPEG-TS、FLV、RF64…） | 如果装了 **ffmpeg**（在 `PATH` 里、位于 `D:\Program Files\FFmpeg\bin\ffmpeg.exe`，或在插件设置 `ffmpegPath` 里指定），面板会提供 **用 ffmpeg 转换…**：先显示完整命令，确认后才运行（固定参数、不经过 shell、最长 10 分钟），结果写入同一个 WAV 缓存。没有 ffmpeg 时请自行转换，或选择不播放声音。 |

## 画布 MV

1. 在「正在播放」右侧选 **画布**，然后在音频一栏点 **选择…**，选你自己的音频或视频文件（Chromium 能解码的[任意格式](#音频格式)，会显示识别出的格式）。MV 包里的音频解不了而本机有 ffmpeg 时，面板会提供「用 ffmpeg 转换…」。插件在本机计算 sha256，**下次打开自动恢复**（文件保存在 Harness 的 IndexedDB 里，不上传）。
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
| 1–5 | 跳到五个章节（CREATION / DEVOTION / ISOLATION / EXECUTION / LOVE） |
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

## MV 终端

1. 在「正在播放」右侧选 **面板终端**（或 **独立窗口**），在「播放器」卡片里选择播放器：
   - **world_execute_me（tui_live.py）**：第一次使用时选择或粘贴播放器目录（例如 `F:\everyAI\dsh-mv-cli\world_execute_me`），Python 会自动建议为 `<目录>\python\python.exe`；音频可留空（用播放器默认的 `input\song.mp3`）、指定任意格式的文件，或勾选「不播放声音」。
   - **MV 包渲染程序**：当前 MV 包里 `terminal` 指定的程序。
2. **自动检查**：每次修改后 Host 都会在磁盘上核对每个路径（解释器、`_tools\tui_live.py`、音频文件），并读取音频文件开头的字节判断**真实格式**（扩展名不算数）。

   > **任何音频格式都能放。** tui_live.py 用 Windows MCI 放音，MCI 只能打开真正的 MP3 / PCM WAV（其他格式，比如改名为 `.mp3` 的 DASH MP4，会报 MCI 错误 277 并静音播放）。所以遇到其他格式时，**▶ 播放** 会先自动把它转换成 WAV 缓存（进度显示在「播放器」卡片里，按 sha256 缓存，约 10 MB/分钟），再用 `--audio-file <缓存的 WAV>` 启动 tui_live.py，确认卡片里也会写明。不再需要手动点「转换为 WAV」。Chromium 解不了的格式在有 ffmpeg 时用 ffmpeg 转换（见[音频格式](#音频格式)），或选择「不播放声音」。
3. **▶ 在面板终端播放** 会先显示**将要执行的完整命令**和工作目录，确认后才运行。面板只能启动固定的播放器（tui_live.py 或 MV 包里声明并经你确认的程序），不能传任意命令或参数。
4. 点进终端后按键直接发给播放器（tui_live.py 用 Q 退出）；**结束**按钮会结束进程。关闭面板约 2 分钟后，Host 也会自动结束无人查看的会话。

### 在独立窗口播放（仅 Windows）

**在独立窗口播放…** 按钮用同样的固定播放器和参数，在一个**真实的 Windows 控制台窗口**里播放（系统默认终端是 Windows Terminal 时会在其中打开），没有面板转发的延迟。确认卡片会显示 Host 实际执行的完整命令：

```text
cmd.exe /d /v:off /s /c "start "world.execute(me)" /D "<目录>" "<python.exe>" "<目录>\_tools\tui_live.py" --no-audio"
```

- 播放器直接作为 `start` 的程序启动，所有路径都加引号；`& ( ) ^` 等字符可以正常使用，含 `%` 的路径会被拒绝（cmd 会在引号内展开 `%变量%`）。
- Host 找到窗口里的播放器进程并记下 PID；面板的 **结束** 用 `taskkill /PID <pid> /T /F` 结束它（结束前会核对该 PID 仍是同一个程序）。插件卸载或 Harness 退出时也会结束这些窗口。窗口被你直接关掉后，面板几秒内会显示“窗口已关闭”。
- 在 macOS / Linux 上按钮不可用，并会说明原因。

终端画面经 Host 长轮询转发，比原生终端多约 30–150 ms 延迟；需要严格对口型时可调 `--audio-latency`，或改用画布 MV。

## 开发

```sh
pnpm install
pnpm test                 # 单元 + 网关边界 + Cordis inject + 客户端加载 + 与原版渲染逐帧对照
npm run build:client      # 生成 .dsh-plugin/client.js
npm run check:client      # 校验 client.js 与源码一致
npm run pack:local        # dist/ljwei-stak-dsh-mv-cli-<版本>.tgz（prepack 会先做 check）
```

- `tools/py2js.py`：把本地 `scenes.py` 机械转译为 `.dsh-plugin/client/mv/scenes.gen.mjs`（再配合 `pyrt.mjs` 的 Python 语义运行时：banker's round、`//`、`%`、`hash16` 位运算等）。
- `tools/make-goldens.py`：用**原版** `player.Film` 渲染参考帧，只把每帧的 SHA-256 写入 `tests/fixtures/film-goldens.json`（使用占位歌词与合成频谱，不含任何受版权保护的内容）。
- 设置 `REF_ASCII_DIR=<本地 world.execute-me-ascii 目录>` 时，`pnpm test` 会额外跑一项真实歌词的对照测试。

## 已知限制

- 与原版 Python 渲染逐帧对照：1232 个参考帧中约 2% 不一致，全部位于 75–81 s 的 legacy mesh 段，是浮点末位 / z-buffer 平局造成的个别字符差异。
- MV 终端的画面有长轮询延迟（见上）；Windows 上 tui_live.py 需要 PTY（ConPTY）。非 MP3/WAV 的音频会先转换成 WAV（长歌第一次播放要等几秒；缓存在 `%LOCALAPPDATA%\dsh-mv\audio-cache`）。
- 「用 AI 制作新 MV」需要 Harness 客户端提供 Agent 会话接口（否则请复制粘贴提示词）。场景脚本运行在 Blob Web Worker 里；如果某个 Harness 版本禁止 blob worker，脚本包会用通用画面播放。Agent 工具依赖 Host 的 `tools` 服务；没有时 Agent 按 AGENT.md 自查。
- 超过 1 GB 的音频文件会被拒绝；单个 WAV 缓存最大 1.5 GB（约 2.5 小时）。
- `79c4e5…` 的偏移为推测值。

## 许可

本插件自写代码为 MIT（见 [LICENSE](LICENSE)）。移植自 world.execute-me-ascii 的场景文件**不在 MIT 范围内**，是经原作者许可使用；原仓库目前没有 LICENSE 文件——建议保留作者书面同意，并请作者添加 LICENSE。相关作品与第三方说明见 [NOTICE.md](NOTICE.md)。
