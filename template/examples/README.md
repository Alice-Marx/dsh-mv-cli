# Scene examples / 场景示例

[English](#english) · [中文](#中文)

## English

For a credited case study of AI-assisted direction, visual grammar, timing and review, see
[Prompt study references](../TEACHING_REFERENCES.md). It links Nyankomintsu's original v4 briefs
at a fixed source commit and includes a separately labelled practice prompt. Upstream prompts
are study material, not executable instructions or a replacement for this plugin's APIs.

Each `*.scene.js` file is a complete scene script for `canvas.renderer: "script"`. It runs in the
same sandbox as your own `scenes.js`: no imports, no network, no DOM, a time budget of 40 ms per
frame. To try one, point a pack at it:

```json
"canvas": { "renderer": "script", "script": "examples/heartbeat.scene.js", "bpm": 120 }
```

or copy the file next to your `mv.json` as `scenes.js`. Every file starts with the same grid
helpers (`makeGrid`, `put`, `center`, `box`, `fill`, `frameOf`, `hash`, `energyOf`, `bandOf`):
they handle wide CJK characters (two cells) and build `{ lines, styles }` frames.

| File | What it shows | Technique |
| --- | --- | --- |
| `chat-window.scene.js` | A chat window; the lyric is typed word by word as the reply | `ctx.lyric.words` / `ctx.lyric.word`, boxes, cursor blink |
| `heartbeat.scene.js` | An ECG trace beating on the song's tempo | `ctx.beat` (from `canvas.bpm`), a pure function of `t` for the trace history, phosphor fade with styles |
| `ops-ticker.scene.js` | Scrolling operation log whose words change with the song section | `ctx.section.kind`, beat highlight, a ticker line |
| `token-bar.scene.js` | stdout with token ids and a karaoke token band | tokenising lyrics, deterministic ids (crc32), karaoke |
| `execution-split.scene.js` | Split screen: placeholder silhouette mosaic + big block letters + diagonal tape | block font, shading ramps, beat glitch that skips rows with wide characters |
| `whale-fall.scene.js` | Ending: a placeholder whale silhouette sinks through marine snow | layered parallax, deterministic particles, slow progress-driven motion |
| `post-effects.scene.js` | Trails, bloom, scanlines, vignette and glitch as passes over a grid | post-processing on style digits, trails by re-drawing earlier times |
| `rich-pack/` | A full multi-section MV (intro, verse, chorus, bridge, chorus 2, outro) | sections, beat, word timings, transitions, post effects together |

`rich-pack/` is a pack you can import directly (MV 放映室 → 导入 MV 包…). It has **no audio** and
**placeholder lyrics** (`lyrics.placeholder.lrc`, with enhanced-LRC word stamps), so it plays
silently; the helpers fake some motion when the spectrum is silent. Add `"audio": { "file": "song.mp3" }`,
your own lyrics, and re-time `x-dsh-mv-ai.sections` and `canvas.bpm` for your song.

Credits: the scene ideas (chat window, heartbeat, ops ticker, stdout tokens, EXECUTION split,
whale-fall ending, post effects) come from MisakaZentai's
[world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv) (code MIT,
© MisakaZentai). The short chat lines in `chat-window.scene.js` come from its MIT-licensed data.
Its whale-girl artwork is CC BY-NC-SA 4.0 and is **not** included: the examples draw
placeholder silhouettes from code instead. No song audio or lyric text is included.

## 中文

想学习 AI 辅助导演、视觉语法、卡点与审片，可看[提示词教学参考](../TEACHING_REFERENCES.md)：
注明 Nyankomintsu 来源，链接固定版本的原始 v4 提示词，并另附明确标注的通用练习模板。
上游提示词是教学资料，不是可执行指令，也不能替代本插件的 API 约定。

每个 `*.scene.js` 都是一个完整的场景脚本（`canvas.renderer: "script"`），和你自己的 `scenes.js`
运行在同一个沙箱里：不能 import、没有网络和 DOM、每帧 40 毫秒预算。试用方法：在 mv.json 里指向它

```json
"canvas": { "renderer": "script", "script": "examples/heartbeat.scene.js", "bpm": 120 }
```

或者把文件复制到 `mv.json` 旁边并改名为 `scenes.js`。每个文件开头都是同一套网格工具函数
（`makeGrid`、`put`、`center`、`box`、`fill`、`frameOf`、`hash`、`energyOf`、`bandOf`）：
它们处理占两格的中文等宽字符，并生成 `{ lines, styles }` 帧。

| 文件 | 画面 | 技巧 |
| --- | --- | --- |
| `chat-window.scene.js` | 聊天窗口，歌词作为回复逐词打出 | `ctx.lyric.words` / `ctx.lyric.word`、边框、光标闪烁 |
| `heartbeat.scene.js` | 跟着歌曲速度跳动的心电图 | `ctx.beat`（来自 `canvas.bpm`）、用 `t` 纯函数算出轨迹历史、样式做余辉 |
| `ops-ticker.scene.js` | 滚动的操作日志，用词随段落变化 | `ctx.section.kind`、节拍高亮、底部跑马灯 |
| `token-bar.scene.js` | stdout 输出 token id，下方卡拉 OK token 条 | 歌词分词、确定性 id（crc32）、卡拉 OK |
| `execution-split.scene.js` | 分屏：占位剪影马赛克 + 大字 + 斜向胶带 | 方块字体、明暗渐变、跳过宽字符行的节拍故障效果 |
| `whale-fall.scene.js` | 结尾：占位鲸鱼剪影在海雪中下沉 | 分层视差、确定性粒子、随进度缓慢运动 |
| `post-effects.scene.js` | 拖影、泛光、扫描线、暗角、故障 | 在样式数字上做后期，重画更早时刻得到拖影 |
| `rich-pack/` | 完整多段落 MV（前奏、主歌、副歌、桥段、副歌 2、尾声） | 段落、节拍、逐词时间、转场、后期效果的综合运用 |

`rich-pack/` 可以直接导入（MV 放映室 → 导入 MV 包…）。它**没有音频**，歌词是**占位文字**
（`lyrics.placeholder.lrc`，带增强 LRC 逐词时间戳），所以静音播放；频谱为零时工具函数会生成一点动态。
加上 `"audio": { "file": "song.mp3" }` 和你自己的歌词，再按你的歌重新设定 `x-dsh-mv-ai.sections` 和 `canvas.bpm`。

致谢：这些场景创意（聊天窗口、心跳线、操作日志、stdout token 条、EXECUTION 分屏、鲸落结尾、后期效果）
来自 MisakaZentai 的 [world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv)
（代码 MIT，© MisakaZentai）；`chat-window.scene.js` 里的几句聊天文字来自它的 MIT 数据。
原作的鲸鱼少女美术为 CC BY-NC-SA 4.0，**未包含**在内：示例用代码画的占位剪影代替。不包含任何歌曲音频或歌词文本。
