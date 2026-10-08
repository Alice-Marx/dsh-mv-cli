# dsh-mv-cli · world.execute(me); 放映室

[English](README.md) · 简体中文

[![npm](https://img.shields.io/npm/v/@ljwei-stak/dsh-mv-cli)](https://www.npmjs.com/package/@ljwei-stak/dsh-mv-cli) · [Releases](https://github.com/Alice-Marx/dsh-mv-cli/releases) · [创意工坊](https://github.com/Alice-Marx/dsh-mv-workshop)

**MV 放映室** 是 DeepSeek Harness Desktop 插件（`@ljwei-stak/dsh-mv-cli`，profile 条目 id `dsh-mv`，当前版本 **0.10.0**）。它在工作台的 `<canvas>` 上放映 ASCII / 终端风格、像素 2D 与 WebGL2 3D 的 **MV**，以**你自己的音频**为时钟逐帧渲染。

**0.9.8 工坊下载：** 修复 HTTP CONNECT 代理被绕过的问题，为临时网络故障增加有限重试，并支持可信 HTTPS 镜像备用源。TLS 验证、按提交下载、大小/SHA-256 校验和场景沙箱保持不变。见[工坊网络与镜像](#工坊网络与镜像098)。

**0.10.0：** 默认接入[官方华为云 HTTPS 静态备用源](https://www.jianweilimarx.top/dsh-mv-workshop/main/index.json)，GitHub 网络失败时无代理直连。新增脚本离线字体、负时间静默前奏和有界的大位图包支持。[Nyankomint 工坊适配](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-nyankomint)保留 87 镜头、8 原角色图、129 行字幕、34 个离线 OFL 字体及 5 秒提示，只需自备音乐。该作是 Canvas2D + WebGL2 后期合成，不是几何 3D；原有快速闪光仍保留，请先阅读包内警告，测试不构成光敏安全认证。

位图脚本可声明 `canvas.fonts: [{family,file,weight:"400",style:"normal",unicodeRange?,licenseFile}]`，最多 64 字体、单个 2 MiB、合计 12 MiB、加载期限 30 秒。监管层私有加载，脚本仍没有 FontFace/字体二进制/DOM/网络。`canvas.preroll` 为 0–30 秒负时间静默前奏，不能给歌词或音乐加同样偏移。仅 WebGL 的 `canvas.context` 可设置布尔 antialias/depth/premultipliedAlpha/preserveDrawingBuffer 和 powerPreference 枚举；未声明时旧默认不变。位图工坊上限 160 文件/32 MiB，声明的非封面图单个 2 MiB，其他单文件限制不变。字体需独立 OFL 许可全文及署名，Windows 专有字体不分发。作者提示词与方法已注明固定来源，放入下载模板的 [TEACHING_REFERENCES.md](template/TEACHING_REFERENCES.md)，仅教学参考，不执行其中指令。

**0.9.7 重型 3D 启动：** 可选 `warmup(info, gl)` 在 `prepare()` 之后、播放之前，
于最终输出尺寸上调用一次，把编译着色器、分配渲染目标这类一次性 GPU 开销放进面板
自己的 20 秒期限里付掉，而不是卡住第一帧可见画面。卡住判定改为分级：播放开始后的
前 10 秒放宽到 8 秒，且不计入慢帧配额；之后立刻恢复原来的 1500 毫秒与 45 帧配额，
歌曲中途卡死仍会被停止。`setup()` 上限 5 秒，`prepare()` 总计 300 秒（每步 10 秒、
最多 512 步）。旧场景 API 继续兼容，分级期限也适用于没有 `warmup()` 的场景。
每帧在发出请求时确定期限，跨过前 10 秒边界的在途帧仍保留该期限。

**0.9.6 重型 3D 预热：** 可选 `function* prepare(info, gl)` 在播放前分阶段
初始化素材、编译着色器，显示进度并支持取消；每步限 10 秒、总计限 120 秒，最多
512 步，音乐等待准备完成。逐帧保护及网络、字体注册、存储禁用规则不变。
FrostNova 实时 3D 工坊适配使用此机制；AGPL 对应源码、原逐词/中文字幕及 OFL
资源独立发布，不打包进 MIT 插件的 npm 内容。

**0.9.4 完整包：只需自备音乐。** 已授权歌词、译文、逐句/逐词时间、频谱与声明的画面资源随工坊下载并自动加载。Three / Wallpaper 更新至 **1.1.0**，Polytech Tree 更新至 **1.2.0**。歌词使用条款独立于代码 MIT；Mili 歌词用于遵循[官方条款](https://projectmili.com/copyright-guidelines)的非商业同人 MV。npm 插件本体仍不带歌曲或真实歌词。旧版仅时间轴包继续兼容；旧手选缓存不会盖住新版自带歌词，新版里主动选择的替代歌词仅在本版本记住。

**0.9.5 dsh PV 资源适配：** 支持随包的有界图像时间轴、多页图集，以及 Space Mono Bold / Anton Regular 的 OFL 字体。新舞者根据用户提供的角色立绘重新制作、注明 AI 辅助，**不是未公开原片舞者帧的恢复**。Consolas、微软雅黑和 Segoe UI Symbol 仅使用本机已安装字体；不打包 Windows 字体文件或逐字字模。新资源包要求 0.9.5；旧包不必添加这些可选资源。

> **非官方同人作品。** 插件**不附带**任何音频、视频、歌词文本或字体；文件由你自己提供，只在本机读取，不会上传。歌曲与歌词的权利归 Mili。自 **0.9.0** 起插件本身不再内置任何 MV，许可为纯 **MIT**：两个 world.execute(me) MV 改为在创意工坊一键安装，各自按自己的许可分发并标明原作——ASCII 场景来自 [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii)（Bilibili「野生大K」，**经原作者许可**），dsh PV 来自 [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)（数据 MIT + **CC BY-NC-SA 4.0** 鲸鱼娘立绘）。见 [许可与致谢](#许可与致谢)。

![曲库列表视图（Harness 原生，浅色）](docs/screenshots/library-list.png)

## 功能

- **画布 MV 播放器**：每一帧都在画布上绘制，与你的音频或视频文件同步（MP3、M4A/AAC、FLAC、Ogg/Opus、WAV、MP4/WebM/MKV 的音轨……；其余格式可用 ffmpeg 转换）。歌词支持 LRC / SRT / VTT，可选 `spectrum.json`，键盘控制、全屏、按文件记住音频同步偏移。
- **创意工坊里的 world.execute(me)**（0.8.x 及以前是内置预设；空曲库里一键安装）：
  - [**world.execute(me);**](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me)：五个章节的 ASCII MV——原作 [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii)。
  - [**world.execute(me); dsh PV**](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-dsh-pv)：「大肥鱼眼中的 world.execute(me)」PV 的实时移植（97 个镜头、10 个章节、DeepSeek 窗口、鲸鱼娘立绘，逐词时间与你自己的 LRC 匹配）——原作 [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)。
- **MV 包**（`mv.json`）：任何歌都能放，使用通用频谱 + 歌词渲染器或你自己写的沙箱场景脚本；可从带提示词和示例的模板开始。
- **用 AI 制作新 MV**：选一首歌，插件建好 MV 包并交给 Harness 的 Agent 会话，由 Agent 写时间轴和场景脚本，并用插件的 Agent 工具自查。
- **自动制作歌词时间轴**：可选的 LRCLIB 查询 + 本机 faster-whisper / Demucs 引擎，逐词对齐、每句置信度和段落识别，然后在波形上用**歌词校准编辑器**微调。
- **创意工坊**：从公开 GitHub 仓库 [Alice-Marx/dsh-mv-workshop](https://github.com/Alice-Marx/dsh-mv-workshop) 浏览、安装、更新和发布社区 MV 包（sha256 校验，只排除歌曲音频，明确授权的歌词与其他资源随包下载）。
- **三套外观**（Harness 原生 / 现代音乐应用 / 终端 · 黑客），各自支持「跟随 / 浅色 / 深色」。
- **曲库**：紧凑**列表**（默认）或封面**网格**，最多 50 个最近的包，曲库标题可**收起**到只剩正在播放的一首。

## 截图

| | |
| --- | --- |
| ![三套外观的列表视图](docs/screenshots/skins.png) | ![收起的曲库，深色](docs/screenshots/library-collapsed.png) |
| 外观 A / B / C，浅色与深色 | 曲库收起到正在播放的一首（0.8.3） |
| ![三套外观下的空曲库](docs/screenshots/empty-library.png) | ![创意工坊里的两个 world.execute(me) 包](docs/screenshots/workshop-presets.png) |
| 0.9.0 空曲库：创意工坊入口和一键安装 | 创意工坊里的两个包，带「原作」链接 |
| ![dsh PV 工坊包](docs/screenshots/dsh-pv.png) | ![三套外观下的歌词校准](docs/screenshots/calibration.png) |
| world.execute(me); dsh PV 工坊包（对话镜头） | 播放器下方的歌词校准编辑器 |
| ![创意工坊](docs/screenshots/workshop.png) | |
| 三套外观下的创意工坊 | |
| ![像素场景包](docs/screenshots/ports.png) | ![安装位置](docs/screenshots/install-dir.png) |
| 0.9.1 像素场景包：Wallpaper MV 与 Polytech Tree | 0.9.1 安装位置：更改、移动或保留 |

截图使用占位演示包和占位歌词。

## 安装

需要支持插件的 DeepSeek Harness Desktop（Host 端 Node ≥ 20，Harness 自带）。没有原生依赖。

**从 npm 安装（推荐）：** **DeepSeek Harness Desktop → 插件 → 添加插件**，填 `@ljwei-stak/dsh-mv-cli`（最新版）或指定版本如 `@ljwei-stak/dsh-mv-cli@0.9.1`，安装并启用。

**用 GitHub Release 安装包：** 从 [Releases](https://github.com/Alice-Marx/dsh-mv-cli/releases) 下载 `ljwei-stak-dsh-mv-cli-<版本>.tgz` 和对应的 `.sha256`，用 PowerShell 核对：
`Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\Users\<你>\Downloads\ljwei-stak-dsh-mv-cli-<版本>.tgz'`，与 `.sha256` 文件比对，
然后在 **插件 → 添加插件** 里填该 `.tgz` 的绝对路径。

两种方式装好后：

1. **完全退出 Harness（包括托盘图标）后重新打开**：Host 进程只有完全重启才会加载新的插件代码。界面顶部若出现「后台版本与界面不一致」，就是没有完全重启。
2. 左侧边栏在内置入口下面出现 **MV 放映室**，点它就在主区域打开面板；插件详情页（插件 → dsh-mv-cli）也有「打开 MV 放映室」按钮。
3. 曲库一开始是空的：点 world.execute(me); 或 dsh PV 旁边的「一键安装」（或「打开创意工坊」浏览），然后选择你自己的歌曲文件。

### 从 0.8.x 升级

0.9.0 删除了内置预设。如果之前选的是内置预设，面板会提示它已移到创意工坊，并给出「从创意工坊安装」按钮；安装后自动沿用你之前为它选过的音频、歌词和频谱。其他 MV 包和设置不受影响。（0.8.x 客户端装不了 dsh PV 工坊包——超过旧版 4 MB 的上限——但它们仍有内置预设。）

## 界面一览

像音乐播放器一样从上到下：

1. **曲库**：你的 MV 包（导入的、AI 制作的或来自创意工坊；为空时显示创意工坊入口和两个 world.execute(me) 包的一键安装），以及「创意工坊」「用 AI 制作新 MV」「导入 MV 包」「新建（模板）」。「列表 / 网格」在紧凑列表（默认）和封面卡片之间切换；「曲库」前的箭头把曲库收起到只剩标题、数量和正在播放那一行（状态记在本机；点侧栏 / 标签栏的「曲库」会重新展开）。
2. **正在播放**：标题、艺术家、包类型和 **▶ 播放** 按钮；下方是音频、歌词、频谱三个小卡片。
3. **画面**：画布和播放条（播放/暂停、进度、时间、章节、音量、音频同步、键盘快捷键、全屏），下方是 **歌词校准** 编辑器。
4. **设置**（默认折叠）：字号、字幕偏移等。
5. 右上角 **外观** 和 **ⓘ**：选择皮肤；关于、版权与署名。

## 外观（皮肤）

**外观** 可选三套皮肤：**Harness 原生**（默认，跟随 Harness 明暗，Fluent 卡片）、**现代音乐应用**（左侧导航栏、封面网格、模糊封面、整页底部播放条，默认深色）或 **终端 / 黑客**（tmux 风格标签栏和状态栏、等宽字体 + CRT 扫描线，默认深色，浅色为纸质终端）。切换外观不会打断播放。每个皮肤分别记住「跟随 / 浅色 / 深色」，只保存在本机；功能在三套外观下完全一样。

## MV 包：播放任意歌曲

**MV 包** 是一个带 `mv.json` 清单的文件夹。清单写明你自己的音频、歌词和可选频谱文件（路径相对于该文件夹），以及怎么画这首歌：
- 用内置的 **通用（generic）** 画布渲染（频谱条、标题、当前与下一句歌词、进度条），任何歌都能放；
- 用 **dsh-pv** 渲染器（`canvas.renderer: "dsh-pv"`），按 `canvas.assets` 里列出的数据文件回放 dsh PV（dsh PV 工坊包使用，只适合这首歌）；
- 用 **场景脚本**（`canvas.renderer: "script"`、`canvas.script: "scenes.js"`）：用普通 JavaScript 写自己的 `render(t, cols, rows, ctx)`，在 Web Worker 沙箱里运行并限制每帧耗时（出错时自动换回通用画面）。接口见模板里的 README；
  - **像素场景（0.9.1）/ WebGL 3D 场景（0.9.2）**：在 `canvas` 里加 `"output": "pixels"` 或 `"output": "webgl"`（可选 `"size": [1920, 1080]`，160×90 – 1920×1080，默认 1280×720），并定义 `paint(g|gl, t, w, h, ctx)` 代替 `render`：
    - `pixels`：`g` 是同一沙箱里 `OffscreenCanvas` 的 2D 上下文（没有 WebGL、字体、网络和 DOM），每帧 100 ms。需要插件 0.9.1+。
    - `webgl`：`setup(info, gl)` 和 `paint(gl, t, w, h, ctx)` 接收沙箱持有的 WebGL2 上下文。离线打包的 Three.js 使用 `new THREE.WebGLRenderer({ canvas: info.canvas, context: gl })`；`info.canvas` 是最小画布接口，不是 DOM。网络、存储、DOM、定时器、嵌套 Worker、WASM 仍禁用。按绝对时间 `t` 支持拖动进度，不运行独立动画循环。WebGL 脚本上限 2 MiB，文本/2D 保持 256 KiB；位图帧预算 100 ms。需要插件 0.9.2+ 与 Chromium 的 Worker OffscreenCanvas/WebGL2，不可用时会提示原因并降级通用画面。
    `canvas.assets` 文件在 `setup(info)` 的 `info.assets` 里提供（JSON 已解析、分片已合并；PNG/WebP 为 ImageBitmap，可用于 pixels 或 WebGL 纹理）。工坊索引 `requires` 记录 0.9.1/0.9.2 兼容版本。Node/CI 只用调用记录替身，不能验证真实 GPU 着色器与像素，仍须浏览器验画面。

在面板顶部的 **曲库** 里：

1. **新建（模板）**：选一个文件夹，插件在其中新建 `dsh-mv-pack-template`（不会覆盖已有文件）。里面有：
   - `mv.json`；
   - `mv.schema.json`（VS Code 补全与校验）；
   - 中英文 README；
   - 占位的 `lyrics.example.lrc`；
   - `examples/`（`scenes.example.js`、七个场景模块和一个完整示例包）。

   导入对话框里的 **下载模板 zip** 得到同样的文件。
2. 把你自己的音频（任意[支持的格式](#音频格式)）和歌词放进去，编辑 `mv.json`。
3. **导入 MV 包** → **选择文件夹…**，或粘贴文件夹 / `mv.json` 的路径。导入只读取清单。
   - 最近用过的包（最多 50 个）记在本机，出现在曲库里（行或卡片上的 × 可移除）。
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
- 可选：`artist`、`album`、`credits[]`、`notice`、`duration`、`audio {file, offset}`、`lyrics {file, offset}`（LRC/SRT/VTT/lyrics.json）、`spectrum {file}`、`canvas {renderer: generic | script | dsh-pv, script, fontSize, bpm, beatOffset, assets}`。`canvas.assets` 把名字映射到包内相对路径的 `.json` / `.webp` / `.png` 文件（或按顺序合并的 JSON 分片列表），渲染器通过 Host 读取。旧版的 `terminal` 字段会被忽略并提示；0.8.x 的 `renderer: "world-execute-me"` 会换成通用画面，并提示安装工坊包。
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

社区 MV 包画廊，基于公开 GitHub 仓库 [Alice-Marx/dsh-mv-workshop](https://github.com/Alice-Marx/dsh-mv-workshop)，没有自建服务器。每个包是一个 `packs/<id>/` 文件夹（`mv.json`、场景脚本、`cover.png`/`.webp`、README，可选 `lyrics.timing.json`）。GitHub Actions 检查每个 PR（结构、大小限制、不得含歌曲音频，歌词轨需独立授权署名、必须声明许可、沙箱安全的静态检查、在几个时间点试运行场景），合并后重新生成带每个文件 sha256 的 `index.json`。

**安装与播放**

1. **曲库 → 创意工坊**：浏览封面，按歌名 / 歌手 / 作者 / 标签搜索，按许可或渲染方式筛选，或只看已安装。包设置了 `x-dsh-mv-workshop.source` 时，卡片和详情里显示「原作」链接。点卡片查看详情（许可、时长、文件及 sha256、GitHub 源码）。
2. **安装到曲库**：面板从 GitHub（或已配置的备用镜像）按索引记录的提交下载文件，核对大小和 sha256，再校验一遍后保存到 `<安装位置>\<id>`（默认 `%LOCALAPPDATA%\dsh-mv\workshop`，0.9.1 起可更改，见下文）。索引里有新版本时卡片显示 **有更新**（**更新到 …**）；**卸载** 会删除该文件夹。
3. 用**你自己的**音乐播放；包内声明的已授权歌词、译文与频谱自动加载，旧版仅时间轴包仍可能需要本地歌词。面板按包记住音乐选择；新完整包优先于旧缓存歌词，本版本中主动选择的替代歌词会被记住。时长和可选的粗略音频指纹检查只在本机进行；`lyrics.timing.json` 可按行哈希把匹配的自备歌词对齐到包内时间轴。

**安装位置（0.9.1）**：创意工坊页底部显示包的安装文件夹（默认 `%LOCALAPPDATA%\dsh-mv\workshop`），有 **打开文件夹**、**更改…** 和 **恢复默认**。可以填任意磁盘上的完整路径，例如 `F:\MV\workshop`（也支持 `\\服务器\共享` 路径）；后台会检查路径、自动创建文件夹并先测试能否写入，不行时说明原因。之后选择 **移动到新位置**（逐个复制、按安装时记录的 sha256 校验，成功后才删除旧文件夹；显示进度和失败原因，失败的包保留在原处）或 **留在原处**（旧位置里的包仍在曲库里、照常可用，以后可以在这里再移动）。曲库里的条目会跟着移动后的包更新。这个设置由插件后台保存在 `%LOCALAPPDATA%\dsh-mv\settings.json`；插件配置里的 `workshopDir` 可设定默认位置（面板里的设置优先）。

![安装位置](docs/screenshots/install-dir.png)

### 工坊网络与镜像（0.9.8）

在 **Harness → 插件 → dsh-mv-cli → 配置** 中设置以下字段，随后完全退出并重启 Harness，让 Host 重新加载：

- `httpProxy`：HTTP CONNECT 代理地址，例如 `http://127.0.0.1:7897`。默认为空字符串，继承 `HTTPS_PROXY` / `HTTP_PROXY`（也支持小写变量）；`NO_PROXY` 按实际目标主机和端口判断。目前只支持 `http://` 代理，HTTPS/SOCKS 代理会明确报错，不会悄悄改走直连。插件不会改动系统代理；LRCLIB 查询也使用这项设置。
- `workshopMirror`：**可信、可用**工坊镜像的 HTTPS 原始文件前缀，不带分支、提交、查询参数、账号密码或片段。0.10.0 起默认值为 `https://www.jianweilimarx.top/dsh-mv-workshop`，旧配置没有字段时也使用它；显式保存的空字符串仍关闭备用源，之前保存为空的配置需恢复默认或填入此地址。插件追加 `main/index.json` 和 `<commit>/packs/<id>/<file>`。Gitee 的内容限制尚未解除，不作为默认下载源。

华为云旧 7 包及独立对应源码已无代理匿名验证全部 137 文件、40,317,815 字节，SHA-256 一致。独立低权限服务每 15 分钟检查固定官方 GitHub 仓库；先完整校验所有资源，最后原子更新目录，同步失败保留旧索引。只有静态下载，无上传/任意地址代理，不改 OpenClaw。带宽、证书和服务可用性并非永久保证。维护工具见 [tools/workshop-static](tools/workshop-static)。

**验证与状态（2026-10-08）：** GitHub 上大肥鱼、FrostNova 两个完整包的 83 个文件已实测下载校验通过，86 次原生 GET 全部经过代理；本地模拟镜像回退测试也已通过。[Gitee 镜像仓库](https://gitee.com/Alice-Marx/dsh-mv-workshop)及[单向同步流程](https://github.com/Alice-Marx/dsh-mv-workshop/actions/runs/37728440839)已建立，但完整 Gitee 下载验证失败：FrostNova 的 `features-1.json` 和 Polytech 的 `catalog-1.json` 现在返回平台 HTTP 451。这不是用户代理问题；平台解除限制前不建议启用该镜像，也不重新编码文件绕过审核。另行上传的 FrostNova 对应源码 ZIP 已通过匿名下载及校验，不能据此宣称完整画面包全部可下载。

每次新取索引先访问 GitHub，对临时故障最多尝试三次、有限退避。启用备用源后，符合回退条件的网络/HTTP 故障才切换镜像；镜像**直接连接，不沿用 GitHub 的代理**，避免已经停止的本机代理同时挡住国内源。索引由镜像提供后，缓存对应的封面和安装也使用该源；安装中某个文件回退后，本次剩余文件继续走镜像。重新刷新索引仍先尝试 GitHub。镜像必须保留原始提交；尚未同步或不存在的文件仍会报错。

两个来源执行相同的文件大小/SHA-256 校验和包校验；哈希/大小不符、TLS 证书无效不会通过换源或重试绕过。**索引未签名**：哈希只能检查文件是否与该索引一致，并不能认证发布者身份。只填写你信任的镜像。下载失败不影响已经安装的包；音频留在本机，音乐仍须自备。

**镜像维护：** GitHub 是主仓，Gitee 是公开只读、单向同步其 Git 分支/标签/提交的副本；贡献统一提交 GitHub，不在两边同时编辑。Git 同步**不会复制 GitHub Release 附件**，对应源码压缩包（包括 AGPL FrostNova 源码）须另行保证匿名可获取。[Gitee 原始文件规则](https://help.gitee.com/repository/file-operate/raw)规定，公开 raw 单文件超过 10 MB 需要认证，公开文件有 60–300 秒缓存，因此包资源保持逐文件有界下载，大型源码附件另行验证。Gitee 是备用源，不是无限流量 CDN 或稳定性承诺；同步延迟、服务限制、审核状态都可能影响访问。

**发布**

1. 载入你的包，打开创意工坊，点 **发布到工坊…**。填写 id、版本、许可（必填）、作者、简介和标签，选择是否附带音频指纹和封面（当前画面）。
2. **检查并打包**：Host 校验这个包，**只去掉歌曲音频**，保留已授权歌词、译文、逐句/逐词时间、数值频谱和声明的画面资源及署名，整理到 `%LOCALAPPDATA%\dsh-mv\workshop-publish\<id>\packs\<id>\`。歌词需单独填写 `lyricsLicense`、`lyricsCredit`，可填 `lyricsSource`；JS 只提取静态数据并转成 JSON，不执行代码。
3. 勾选确认框后，**在 GitHub 上提交…** 会在浏览器里打开 `packs/<id>` 的 GitHub 上传页面：把文件拖进去，GitHub 会自动帮你 fork，由你自己创建 Pull Request。插件不会自动提交任何东西。（设备码登录需要 OAuth 应用的 client id，本版未实现。）

信任提示：工坊里的包由其他人编写。它们的场景脚本始终和其他脚本包一样在沙箱中运行（没有网络、存储和 DOM 的 Web Worker，限制每帧耗时，出错自动回退），工坊界面也会显示这条提示。包内不含歌曲音频，歌词可按独立使用条款提供；请尊重歌曲权利和每个包的许可（仓库默认 CC BY-NC-SA 4.0，包内另有声明的除外）。

## 自动制作歌词时间轴与校准

在 **用 AI 制作新 MV** 对话框里只要选好音频，点 **自动制作**，其余都自动完成，并有步骤进度（任何一步都可以 **停止**）：

1. **建 MV 包**：同上（本机解码、频谱、建文件夹）。歌名 / 歌手 / 专辑从文件标签（ID3、MP4、FLAC、Vorbis/Opus）或文件名读取。
2. **LRCLIB**（可选，设置 `lrclib`，默认开）：到 <https://lrclib.net> 查现成的带时间轴歌词。**只发送歌名、歌手、专辑和时长**，不上传音频、不发送文件名、不需要账号。对话框会显示将要发送的内容；取消勾选或在设置里关掉即完全离线。找到带时间轴的歌词就直接用；只有纯文本时交给引擎对齐。请求遵循 `httpProxy`、继承的代理环境变量和按目标判断的 `NO_PROXY`。
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
   - 从 0.9.3 起，可以直接选择 wiers-jack 原作的 `src/lyrics.js`：仅提取静态 `LYRICS = [{ t, en, cn }]` 数组，`t` 为秒，`cn` 为中文行；不执行 import、函数或字幕渲染代码。之前改名为 `.json` 的副本也可识别。请选择本地源码文件，不是 Gitee 网页另存的 HTML；歌词默认只在本机读取；明确授权署名后可随完整工坊包发布。
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

## 创意工坊里的 world.execute(me) 包

**world.execute(me);**（[工坊包](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me)，原作 [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii)）是五个章节（CREATION → DEVOTION → ISOLATION → EXECUTION → LOVE）的终端电影，移植自 Python 原作。0.9.0 起它是**场景脚本**包：本仓库的 `presets/world-execute-me/` 由 `presets/build-workshop-packs.mjs` 打包成一个沙箱 `scenes.js`，画面与以前的内置版逐帧一致（有测试比对）。许可：经原作者许可使用和再分发，**不是开源**（见包内 `NOTICE.md`）。

**world.execute(me); dsh PV**（[工坊包](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-dsh-pv)，原作 [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)）是 [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)（commit `a4dd0f7`，MIT）的实时 JavaScript 移植：一部以「大肥鱼」（DeepSeek）视角重写 world.execute(me) 的 PV，97 个镜头、10 个章节（BOOT → PRETRAIN → SFT → RLHF → DEPLOY → USER_LEFT → REWARD_HACK → EXECUTION → EVAL: LOVE → WHALE_FALL）。上游是离线渲染成视频的 Python 程序；这里在画布上按你的音频逐帧重画。

**使用：**

1. 安装：空曲库里点「一键安装」，或 **创意工坊 → world.execute(me); · 大肥鱼眼中的 world.execute(me) → 安装到曲库**。
2. **音频**：选你自己的《world.execute(me);》音频或视频文件。
3. **歌词**（可选，推荐）：选你自己的 LRC。插件把每句歌词的 sha256 和内置的时间表比对，匹配上的句子使用原 PV 的**逐词时间**（打字效果、底部 stdout 词元条、`satisfaction` 镜头里的注意力词元都来自你的歌词）；歌词栏显示「逐词时间匹配 x/y 句」。LRCLIB 上 id 36914646 的歌词能匹配 97/98 句。匹配不足一半时改用你文件里的时间按行显示。不选歌词时，歌词位置留空。
4. **▶ 播放**。键盘、音频同步（Alt+`[` / Alt+`]`）、全屏与其他包相同。

**怎么做的：** 在本机用上游的合成渲染器跑了一遍，把每个镜头 2–6 个关键帧（约每 0.5 s 一个）的绘制指令（文字、矩形、线条、颜色、位置）、DeepSeek 窗口的布局与对话内容、各层透明度记录下来，以工坊包里的 `data/timeline-*.json`、`data/chat-*.json`、`data/band.json` 分发（≤ 512 KB 的分片，约 4.4 MB，源文件在 `presets/dsh-pv/data/`），由 `canvas.assets` 列出；渲染器（MIT）在插件里。画布按时间回放关键帧，新出现的文字做解码式打字，并补上动态部分：随实时音量跳动的心跳线、右侧 ops 滚动条、stdout 词元条、DeepSeek 窗口（原生重画，不用 DeepSeek 前端的 CSS / 图标 / 字体）、EXECUTION 红色分屏与胶带、结尾鲸落，以及光迹、泛光、扫描线、暗角等后期效果。数据里**不含任何歌词文字**：歌词只以 sha256 和时间出现，构建脚本还检查了不存在任何 4 词以上的歌词片段，歌词全部在运行时取自你的文件。

**还原度：** 旧 1.0.0 包用近似图形代替上游位图层。0.9.5 的完整包构建器补入实际合成器导出的图像层，舞者改用新制动作；并非未公开原片或第三方 MMD 缓存的复制。图像帧有采样和压缩，字体在不同系统仍可能略有差异。可分发的 Space Mono / Anton 随包附 OFL 许可；Windows 字体只能来自本机合法安装。[Microsoft 字体说明](https://learn.microsoft.com/en-us/typography/fonts/font-faq)。

**立绘：** 工坊包里带了上游的 8 张鲸鱼娘表情和 1 张女仆立绘（缩到 200×360 的 WebP），按 **CC BY-NC-SA 4.0** 授权（整包许可 `CC-BY-NC-SA-4.0`），署名链与改动说明见包内 `art/NOTICE.md`（本仓库 `presets/dsh-pv/art/`）。这些角色设计据上游说明是用 AI 图像模型（GPT Image 2）生成的。没有立绘时渲染器改画占位剪影。

## 更多社区包（0.9.1）

从开源项目移植的包，不含歌曲音频并链接原作；歌词与代码分别声明使用条款。Wallpaper 保持 Canvas2D 像素场景（0.9.1+），Polytech Tree 升级为 GPU 3D（0.9.2+）：

- **world.execute(me); · Wallpaper MV**（[工坊包](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-wallpaper)，原作 [seasnakes/world.execute-me-wallpaper](https://github.com/seasnakes/world.execute-me-wallpaper)，视觉代码 MIT © 2026 seasnakes）：壁纸 MV 的画布场景（双球、苹果、爱心、EXECUTE 倒计时……），1920×1080，按原作的 BPM 网格和 14 个段落同步；1.1.0 完整包自带双语歌词并自动加载，歌词按独立的 Mili 非商业同人条款使用。只需自备歌曲音频。不包含 Wallpaper Engine 宿主适配和原网页界面。
- **Polytech Tree · 人类科技树漫游**（[工坊包](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/polytech-tree)，原作 [secwind7/polytech-tree](https://github.com/secwind7/polytech-tree)，代码 MIT © 2026 secwind，结构化数据 CC BY 4.0，描述 CC BY-SA 4.0）：3862 项科技、11 个时代，科技按年代逐个出现，镜头沿塔轴上升，前置关系连线爬向目标。使用 WebGL2 GPU 实例化、透视与深度遮挡，保留原布局和漫游时序；1.2.0 完整包带原始全部条目、中文描述和逐项来源署名。原作没有歌曲或歌词轨，可静音播放或配任意音乐（约 3 分钟）。

### 0.9.2 起的 3D WebGL 工坊包

`canvas.output: "webgl"` 支持真正的 GPU 3D 与经过适配、离线打包的 Three.js 场景，并不是任意 HTML 网页或 DOM 库播放器。保留受限沙箱，WebGL 脚本上限 2 MiB。

- **world.execute(me); · Original Three.js MV**（[工坊包](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-three)，适配源码 `presets/ports/wiers-jack-three/`，原作 [wiers-jack/world-execute-me-mv](https://gitee.com/wiers-jack/world-execute-me-mv)）：将原作 12 段场景、镜头路径与 bloom 后处理适配到 Worker，音频和歌词自备。维护者于 2026-10-05 确认已取得作者直接授权，按 MIT 公开此包；构建所用上游版本仍声明 ISC 且无独立 LICENSE。包内 LICENSE/NOTICE 明确区分直接授权与原仓库声明，并保留 Three.js 署名。

![像素场景包](docs/screenshots/ports.png)

## 开发

```sh
pnpm install
pnpm test                 # 单元 + 网关边界 + Cordis inject + 客户端加载 + 与原版渲染逐帧对照
npm run build:client      # 生成 .dsh-plugin/client.js
npm run check:client      # 校验 client.js 与源码一致
npm run pack:local        # dist/ljwei-stak-dsh-mv-cli-<版本>.tgz（prepack 会先做 check）
```

- `node presets/build-workshop-packs.mjs [<工坊仓库>/packs]`：从 `presets/` 生成两个工坊包（打包 `scenes.js`、拆分 dsh PV 数据、写入带原作链接的 `mv.json` / README / NOTICE，封面取自 `presets/covers/`）；再用工坊仓库的 `scripts/validate.mjs` 检查。
- `tools/dsh-pv/`：从上游仓库重新生成 dsh PV 数据（`presets/dsh-pv/data/`）的脚本（只在本机运行，需要上游仓库、它的 Python 环境和你自己的歌词；不进 npm 包），见其中的 README。
- `tools/ui-preview/`：面板截图（`node tools/ui-preview/build-preview.mjs && node tools/ui-preview/shoot.mjs <输出目录>`）。
- `tools/py2js.py`：把本地 `scenes.py` 机械转译为 `presets/world-execute-me/src/scenes.gen.mjs`（再配合 `pyrt.mjs` 的 Python 语义运行时：banker's round、`//`、`%`、`hash16` 位运算等）。
- `tools/make-goldens.py`：用**原版** `player.Film` 渲染参考帧，只把每帧的 SHA-256 写入 `tests/fixtures/film-goldens.json`（使用占位歌词与合成频谱，不含任何受版权保护的内容）。
- 设置 `REF_ASCII_DIR=<本地 world.execute-me-ascii 目录>` 时，`pnpm test` 会额外跑一项真实歌词的对照测试。

## 已知限制

- 与原版 Python 渲染逐帧对照：1232 个参考帧中约 2% 不一致，全部位于 75–81 s 的 legacy mesh 段，是浮点末位 / z-buffer 平局造成的个别字符差异。
- dsh PV：时间线固定为原曲长度 211.9 s；其他剪辑版本需要用音频同步偏移对齐，长度不同的版本后半段会错位。新舞者是 AI 辅助重制，不是原片隐藏素材。Windows 字体不随包分发，不同系统字形可能略有差异。旧 1.0.0 包继续兼容；新图层/字体要求 0.9.5。仅 dsh-pv 包可达 64 文件 / 24 MiB，单个图像仍限 1 MiB、JSON 512 KiB，图集解码总像素上限 64 Mi；其他包保留 40 文件 / 8 MiB。
- 「用 AI 制作新 MV」需要 Harness 客户端提供 Agent 会话接口（否则请复制粘贴提示词）。场景脚本运行在 Blob Web Worker 里；如果某个 Harness 版本禁止 blob worker，脚本包会用通用画面播放。Agent 工具依赖 Host 的 `tools` 服务；没有时 Agent 按 AGENT.md 自查。
- 超过 1 GB 的音频文件会被拒绝；单个 WAV 缓存最大 1.5 GB（约 2.5 小时）。
- `79c4e5…` 的偏移为推测值。
- 自动时间轴：识别效果取决于混音；快速说唱、重度效果和念白会出现需要检查的黄色句子。LRCLIB 只收录别人上传过的歌，且需要能连上 lrclib.net（连不上时会跳过并提示）。仅 CPU 的 PyTorch 方案没有在测试机上实装；GPU 需要支持 CUDA 12.6 的 NVIDIA 驱动。中文 / 日文按字对齐，只做了单元测试。
- 创意工坊：音频指纹很粗略（只看能量包络），可能漏判或误判不同剪辑；只有文字与包内哈希一致的歌词句子才能对齐时间；GitHub 上传页需要手动拖入文件；raw.githubusercontent.com 有约 5 分钟缓存，新包会延迟出现；CI 里的 `node:vm` 只是检查，不是安全边界（真正的边界是面板的 Worker 沙箱）。

## 许可与致谢

0.9.0 起 npm 包为纯 **MIT**（见 [LICENSE](LICENSE)）：只含本插件自写代码和 MIT 的 dsh-pv 渲染器（移植自 MisakaZentai/world-execute-me-dsh-pv，© 2026 MisakaZentai）。0.8.x 及以前因附带立绘而是 `(MIT AND CC-BY-NC-SA-4.0)`。

本仓库的 `presets/` 目录**不在 MIT 范围内**，也不进 npm 包，只以两个工坊包分发：

| 工坊包 | 原作 | 许可 |
| --- | --- | --- |
| [`world-execute-me`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me)（`presets/world-execute-me/`） | [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii) | 经原作者许可（2026-10-03）使用和再分发，不是开源；原仓库没有 LICENSE 文件——建议保留作者书面同意，并请作者添加 LICENSE。 |
| [`world-execute-me-dsh-pv`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-dsh-pv)（`presets/dsh-pv/`） | [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv) | 数据 MIT（© 2026 MisakaZentai）；鲸鱼娘立绘 **CC BY-NC-SA 4.0**（溟月 © 上善无形 → ZipZipPipe（Pixiv 148186519，AI 生成）→ Small-tailqwq/dsh-deep-whale → dsh-whale-galgame → MisakaZentai）→ 整包 `CC-BY-NC-SA-4.0`，仅限非商业 |

致谢：

- **Mili**：《world.execute(me);》（词曲与录音，不随包附带）。
- **yym8224961（野生大K）**：[world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii)，world.execute(me) 工坊包的场景与时间轴（经许可移植）。
- **MisakaZentai**：[world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)（MIT），dsh PV 渲染器、数据与模板示例。
- 鲸鱼娘立绘：**上善无形 / 上善**（溟月）、**ZipZipPipe**、**Small-tailqwq / dsh-deep-whale**、**dsh-whale-galgame**（CC BY-NC-SA 4.0）。
- **TKCB / King-LRC-Waveform-Editor**（MIT）：校准编辑器的交互参考（未复制代码）。**LRCLIB** 提供同步歌词查询。faster-whisper、CTranslate2、Demucs、PyTorch 与 Whisper 权重按需下载，按各自许可证使用。

相关作品与第三方说明全文见 [NOTICE.md](NOTICE.md)。
