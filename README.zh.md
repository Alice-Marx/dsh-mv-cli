# dsh-mv-cli · world.execute(me); 放映室

[English](README.md) · 简体中文

DeepSeek Harness Desktop 插件（`@ljwei-stak/dsh-mv-cli`，profile 条目 id `dsh-mv`）。在工作台里放映**终端风格 MV**：内置 Mili《world.execute(me);》场景；其他任何歌曲用 [MV 包](#mv-包播放任意歌曲)（`mv.json`），由通用的频谱 + 歌词渲染器或外部 TUI 程序来画。两种模式：

| 模式 | 做什么 | 需要你提供 |
| --- | --- | --- |
| **画布 MV** | 在面板的 `<canvas>` 上逐帧渲染 ASCII MV（五个章节、全屏、终端配色），以 `<audio>.currentTime` 为主时钟，频谱来自 Web Audio AnalyserNode | 一个音频文件；可选的歌词（LRC / SRT，或你本地 world.execute-me-ascii 的 `lyrics.json`）和 `spectrum.json` |
| **MV 终端** | 在伪终端（ConPTY / node-pty）里运行你本机已有的终端播放器，用 xterm.js（WebGL，自动回退 DOM）显示 | world_execute_me 目录 + 它的 `python.exe`；或你自己下载的 world-execute-me-ascii-rust 可执行文件 |

> **非官方同人作品。** 插件**不附带**任何音频、视频、歌词文本、频谱数据或美术素材；歌曲与歌词的权利归 Mili。画面场景与时间轴移植自 [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii)（Bilibili「野生大K」），**经原作者许可**。详见 [NOTICE.md](NOTICE.md)。

## 安装

**从 npm 安装（推荐）：** **DeepSeek Harness Desktop → 插件 → 添加插件**，填 `@ljwei-stak/dsh-mv-cli@0.2.0`（或直接填 `@ljwei-stak/dsh-mv-cli` 安装最新版），安装并启用。

**用本地安装包：** 从 GitHub Release 下载 `ljwei-stak-dsh-mv-cli-0.2.0.tgz` 和对应的 `.sha256`，用 PowerShell 核对：
`Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\Users\<你>\Downloads\ljwei-stak-dsh-mv-cli-0.2.0.tgz'`，
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
- 并且/或者用一个 **外部 TUI 程序**（可执行文件或解释器 + 脚本 + 参数模板）。

内置的 world.execute(me) 预设仍是列表里的默认项。

在面板的 **MV 包** 栏里：

1. **下载模板…**：选一个文件夹，插件在其中新建 `dsh-mv-pack-template`（不会覆盖已有文件）。里面有：
   - `mv.json`；
   - `mv.schema.json`（VS Code 补全与校验）；
   - 中英文 README；
   - 占位的 `lyrics.example.lrc`；
   - `examples/`（Python 播放器示例，以及用 MV 包写法表示的 world.execute(me)）。

   **或下载 zip** 得到同样的文件。
2. 把你自己的 `song.mp3` 和歌词放进去，编辑 `mv.json`。
3. **导入 MV 包…** → **选择文件夹…**，或粘贴文件夹 / `mv.json` 的路径。导入只读取清单。
   - 最近用过的包（最多 8 个）记在本机，出现在下拉列表里。
   - 下次打开会恢复上次的包。
4. **画布 MV** 播放该包：音频由 Host 分块读取，歌词和频谱一起载入。包里有 `terminal` 时，**MV 终端** 的播放器列表会多出 **MV 包：…**。

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
- 可选：`artist`、`album`、`credits[]`、`notice`、`duration`、`audio {file, offset}`、`lyrics {file, offset}`（LRC/SRT/VTT/lyrics.json）、`spectrum {file}`、`canvas {renderer: generic | world-execute-me, fontSize}`、`terminal`。
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

## 画布 MV

1. 点 **选择音频…**，选你自己的歌曲文件（mp3 / m4a / aac / mp4 均可，交给 Chromium 解码）。插件在本机计算 sha256，**下次打开自动恢复**（文件保存在 Harness 的 IndexedDB 里，不上传）。
2. 点 **选择歌词…**：
   - LRC：同一时间戳写两行（英文一行、中文一行），或一行写 `English / 中文`；支持 `[offset:]`。
   - SRT / VTT：每个字幕块两行文本。
   - 或直接选你本地 world.execute-me-ascii 目录下的 `lyrics.json`（`[{time,end,en,zh}]`）。
3. 可选：选该目录下的 `spectrum.json`，画面就和原版终端播放器的频谱逐帧一致；不选则用实时 AnalyserNode。
4. 点画面获得焦点后用键盘：

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

1. 切到 **MV 终端** 标签，选择播放器：
   - **world_execute_me（tui_live.py）**：填播放器目录（例如 `F:\everyAI\dsh-mv-cli\world_execute_me`），Python 会自动建议为 `<目录>\python\python.exe`；音频可留空（用播放器默认的 `input\song.mp3`）、指定文件，或勾选「不播放声音」。
   - **world-execute-me-ascii-rust**：填你从 [其 Release](https://github.com/bilixxb/world-execute-me-ascii-rust/releases) 自行下载解压的 `world-execute-me-rust.exe`。它只能解码 **MP3**，不填音频时播放其内嵌音乐。
2. **检查路径**：Host 在磁盘上核对每个路径（解释器、`_tools\tui_live.py`、音频文件）。
3. **启动…** 会显示**将要执行的完整命令**和工作目录，确认后才运行。面板只能启动这两个固定的播放器，不能传任意命令或参数。
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
- MV 终端的画面有长轮询延迟（见上）；Windows 上 tui_live.py 需要 PTY（ConPTY）。tui_live.py 用 Windows MCI 播放音频，能否播放扩展名不符的 AAC 文件取决于系统解码器。
- `79c4e5…` 的偏移为推测值。

## 许可

本插件自写代码为 MIT（见 [LICENSE](LICENSE)）。移植自 world.execute-me-ascii 的场景文件**不在 MIT 范围内**，是经原作者许可使用；原仓库目前没有 LICENSE 文件——建议保留作者书面同意，并请作者添加 LICENSE。相关作品与第三方说明见 [NOTICE.md](NOTICE.md)。
