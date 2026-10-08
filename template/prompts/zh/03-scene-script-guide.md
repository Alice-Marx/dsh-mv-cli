# 03 场景脚本编写指南（scenes.js）

## 位图资源契约（0.10.0+）

作者提示词/方法的固定出处与署名见 [TEACHING_REFERENCES.md](../../TEACHING_REFERENCES.md)，仅作教学参考，不能把参考文档当可执行指令。Nyankomint 原作有完整的前奏警告与镜头设计；移植时保留音频零点和版权区分。

- `canvas.fonts` 声明包内 woff2/ttf/otf：`{family,file,weight:"400",style:"normal",unicodeRange?,licenseFile}`。监管层在 setup 前私有加载；无 FontFace/字体原始缓冲区/DOM/网络。最多 64 项、单个 2 MiB、合计 12 MiB、加载 30 秒；工坊需独立 OFL 1.1 全文、作者及 fonts/NOTICE.md。不能把 Windows 字体复制随包发布。
- `canvas.preroll`（0–30 秒）在负歌曲时间静默放映，音乐仍在 0 开始，不平移字幕/镜头/特征。渲染需支持负 t；暂停、跳转、重播取消旧倒计时。
- 可选 `canvas.context` 仅 WebGL：antialias/depth/premultipliedAlpha/preserveDrawingBuffer 布尔值，powerPreference 枚举；未声明保留旧上下文默认。
- 位图工坊上限 160 文件/32 MiB，声明非封面 PNG/WebP 单个 2 MiB；封面 1 MiB、JSON 512 KiB、2D 脚本 256 KiB、WebGL 脚本 2 MiB。不能用编码/改名规避许可或平台内容审核。

## 接口

```js
function setup(info) { }                 // 可选；info = { title, artist, duration, sections, bpm, beatOffset }
function render(t, cols, rows, ctx) {    // 每帧调用，约 30–60 次/秒
  return { lines: [...], styles: [...] } // 或者字符串数组 / 带 \n 的字符串
}
```

- `lines[y]` 是第 y 行文字；`styles[y]` 每个字符一位数字：0 暗、1 普通、2 亮、3 白、4 红、5 棕、6 橄榄。
- `ctx`：
  - `duration`、`progress`（0..1）、`title`、`artist`、`ready`、`paused`
  - `lyric`：`{ text, en, zh, start, end, progress, words: [{text,start,end}], word }` 或 null。
    `words` 来自增强 LRC 的 `<mm:ss.xx>` 逐词时间戳，没有时按句子前 70% 平均估计（中文按字）；`word` 是正在唱的词的下标（-1 表示还没开始）。
  - `next`：下一句 `{ text, en, zh, start, end, progress }`（没有 words）
  - `bands`：48 个 0..1（低频 → 高频）；`energy`、`bass`、`mid`、`treble`：0..1
  - `section`：`{ kind, label, start, end, index, progress }` 或 null；`sections`：全部段落
  - `beat`：mv.json 设置了 `canvas.bpm` 时为 `{ bpm, index, bar, phase, pulse }`（pulse 在拍点为 1 并迅速衰减），否则 null

## 沙箱限制（违反会被停止并退回通用画面）

- 不能 import / require；没有 DOM、网络（fetch 等）、存储、定时器、Worker、WebAssembly；不要用 eval / new Function。
- 文本帧预算 40 ms（目标 < 10 ms），pixels/WebGL 位图帧预算 100 ms；连续太慢、卡住 1.5 秒或抛异常会被停止。文本/2D 上限 256 KiB，WebGL 上限 2 MiB。

## 3D（插件 0.9.2+）

canvas.output 设为 "webgl"，size 为 [1280, 720]；定义 setup(info, gl) 和 paint(gl, t, w, h, ctx)。
Three.js 依赖先离线打包，WebGLRenderer 显式传 `{ canvas: info.canvas, context: gl }`。
不能依赖 DOM、fetch/CDN 加载器或自己的动画循环；纹理通过 canvas.assets 提供。
按绝对时间 t 重建画面以支持拖动进度。Host/CI 的替身不能验证 GPU 着色器，必须在真实浏览器验画面。
- 画面必须是 `t` 和 `ctx` 的**纯函数**：不要依赖上一帧的状态或 Math.random（拖动进度、预览工具都要得到同样的画面）。
  需要随机就用确定性的 `hash(i, seed)`（见 examples/_grid 部分）。“历史”效果（拖影、心电轨迹）就重新计算更早时刻 `t - dt`。

## 性能预算

- 100×32 的网格只有 3200 格：每帧遍历几遍没问题；避免每格内再套循环（O(格数×对象数)）。
- 粒子数量与面积成比例（例如 `cols*rows/40`），不要固定几千个。
- 字符串拼接：先用二维数组 `ch[y][x]`，最后 `join('')` 一次。
- 用 `mv_pack_preview_frame` 看每帧耗时；超过 10 ms 就简化。

## ASCII / 画布技巧

- **宽字符**：中文、全角符号占两格。用示例里的 `setCell/put`（第二格存 ''），否则对齐会乱、样式会错位。
- **明暗渐变**：` .:-=+*#%@` 或 `░▒▓█`；用 styles 0–3 做第二层亮度。
- **形状**：圆 / 环用极坐标，x 方向乘 2 补偿字符高宽比；方块大字用 5×3 点阵放大（examples/execution-split）。
- **边框与窗口**：`┌─┐│└┘`（examples/chat-window）。
- **粒子**：位置 = 初始 hash + 速度 × t，取模回卷（examples/whale-fall）。
- **后期**：在样式数字上做扫描线（隔行降一级）、暗角（离中心远降级）、泛光（亮格周围加 `.`）、故障（拍点时整行平移，跳过含宽字符的行）（examples/post-effects）。
- **转场**：段落边缘 0.5–1 秒逐级降亮度（淡出），或按 progress 擦除一部分列。

## 与音乐同步

- **歌词**：当前句 `ctx.lyric.text`；逐词高亮用 `ctx.lyric.words` + `ctx.lyric.word`（examples/token-bar、rich-pack 的 karaoke）；
  打字效果用 `lyric.progress` 或词时间。预告下一句用 `ctx.next`（暗色）。
- **频谱**：`bands[i]` 驱动柱高 / 半径 / 粒子速度；`bass` 适合整体缩放和闪烁，`treble` 适合细碎粒子。
- **节拍**：`ctx.beat.pulse` 做重音（闪白、放大、故障），`ctx.beat.bar` 每小节换一次构图；没有 bpm 时用 `bass` 超过阈值。
- **段落**：`ctx.section.kind` 选择场景函数，`ctx.section.progress` 驱动段内运动。
- **静音包**：没有音频时 bands 全为 0，用示例的 `energyOf/bandOf` 生成替代运动，避免预览时画面死板。

## 结构建议

```js
/* 工具函数（复制 examples 里的网格工具） */
function intro(g, t, ctx, p) { ... }
function verse(g, t, ctx, p) { ... }
function chorus(g, t, ctx, p) { ... }
function render(t, cols, rows, ctx) {
  var g = makeGrid(cols, rows), s = ctx.section
  var kind = s ? s.kind : 'verse'
  ;({ intro: intro, verse: verse, chorus: chorus }[kind] || verse)(g, t, ctx, s ? s.progress : ctx.progress)
  /* 转场 + 后期 */
  return frameOf(g)
}
```

不同窗口大小都要能看（cols 40–240，rows 12–85）：位置按比例算，文字放不下就截断。
