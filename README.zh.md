# dsh-mv-cli · world.execute(me); 放映室

[English](README.md) · 简体中文

DeepSeek Harness Desktop 插件（`@ljwei-stak/dsh-mv-cli`，profile 条目 id `dsh-mv`）。在工作台里放映 Mili《world.execute(me);》的**终端风格 MV**，两种模式：

| 模式 | 做什么 | 需要你提供 |
| --- | --- | --- |
| **画布 MV** | 在面板的 `<canvas>` 上逐帧渲染 ASCII MV（五个章节、全屏、终端配色），以 `<audio>.currentTime` 为主时钟，频谱来自 Web Audio AnalyserNode | 一个音频文件；可选的歌词（LRC / SRT，或你本地 world.execute-me-ascii 的 `lyrics.json`）和 `spectrum.json` |
| **MV 终端** | 在伪终端（ConPTY / node-pty）里运行你本机已有的终端播放器，用 xterm.js（WebGL，自动回退 DOM）显示 | world_execute_me 目录 + 它的 `python.exe`；或你自己下载的 world-execute-me-ascii-rust 可执行文件 |

> **非官方同人作品。** 插件**不附带**任何音频、视频、歌词文本、频谱数据或美术素材；歌曲与歌词的权利归 Mili。画面场景与时间轴移植自 [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii)（Bilibili「野生大K」），**经原作者许可**。详见 [NOTICE.md](NOTICE.md)。

## 安装（本地安装包，尚未发布到 npm）

1. 拿到 `ljwei-stak-dsh-mv-cli-0.1.0.tgz`，用 PowerShell 核对：
   `Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\Users\<你>\Downloads\ljwei-stak-dsh-mv-cli-0.1.0.tgz'`
2. **DeepSeek Harness Desktop → 插件 → 添加插件**，填该 `.tgz` 的绝对路径；安装并启用。
3. **完全退出 Harness（包括托盘图标）后重新打开**：Host 进程只有完全重启才会加载新的插件代码。界面顶部若出现「后台版本与界面不一致」，就是没有完全重启。
4. 侧边栏出现 **MV 放映室**；插件详情页也有「打开 MV 放映室」按钮。

MV 终端依赖可选依赖 `@lydell/node-pty`（含 Windows 预编译二进制）。若安装时它没装上，面板会提示「管道模式」，此时 tui_live.py 无法正常显示，画布 MV 不受影响。

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
- 尚未发布到 npm。

## 许可

本插件自写代码为 MIT（见 [LICENSE](LICENSE)）。移植自 world.execute-me-ascii 的场景文件**不在 MIT 范围内**，是经原作者许可使用；原仓库目前没有 LICENSE 文件——建议保留作者书面同意，并请作者添加 LICENSE。相关作品与第三方说明见 [NOTICE.md](NOTICE.md)。
