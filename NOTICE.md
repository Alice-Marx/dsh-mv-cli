# NOTICE / 声明

`@ljwei-stak/dsh-mv-cli`（dsh-mv）是**非官方的同人工具**，与 Mili、DeepSeek 及下列项目的作者均无隶属关系。
This is an **unofficial fan work**, not affiliated with Mili, DeepSeek, or the authors listed below.

## 0. 0.9.0 起：插件不再内置任何 MV / Since 0.9.0 the plugin bundles no MV

npm 包 `@ljwei-stak/dsh-mv-cli` 自 **0.9.0** 起只含 MIT 代码（许可字段 `MIT`）。以前内置的两个 world.execute(me) 预设
改为**创意工坊包**发布在 <https://github.com/Alice-Marx/dsh-mv-workshop>，各自按下面第 2、3 节的许可分发；
在面板里可一键安装。源文件留在本仓库的 `presets/`（不进 npm 包，见 LICENSE 末尾）。
Since 0.9.0 the npm package is MIT only. The two former built-in presets are workshop packs (sections 2 and 3);
0.9.1 adds two more workshop packs ported from MIT projects (table below; their port scripts live in `presets/ports/`, not in the npm package);
their sources stay in this repository under `presets/`, which is not part of the npm package.

| 工坊包 / pack | 原作 / original | 许可 / licence |
| --- | --- | --- |
| [`world-execute-me`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me) | [yym8224961/world.execute-me-ascii](https://github.com/yym8224961/world.execute-me-ascii) | 经原作者许可再分发，非开源 / redistributed with the author's permission, not open source |
| [`world-execute-me-dsh-pv`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-dsh-pv) | [MisakaZentai/world-execute-me-dsh-pv](https://github.com/MisakaZentai/world-execute-me-dsh-pv) | 数据 MIT + 立绘 CC BY-NC-SA 4.0 → 整包 `CC-BY-NC-SA-4.0` |
| [`world-execute-me-three`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-three) 1.1.0 | [wiers-jack/world-execute-me-mv](https://gitee.com/wiers-jack/world-execute-me-mv) | 作者确认的 MIT 视觉代码许可 + Mili 非商业同人歌词条款；音乐录音不包含 / author-confirmed MIT visual code + separate Mili non-commercial fan-caption terms; no recording |
| [`world-execute-me-wallpaper`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/world-execute-me-wallpaper) 1.1.0 | [seasnakes/world.execute-me-wallpaper](https://github.com/seasnakes/world.execute-me-wallpaper) | MIT © 2026 seasnakes + Mili 非商业同人歌词条款；音乐录音不包含 / MIT visual code + separate Mili non-commercial fan-caption terms; no recording |
| [`polytech-tree`](https://github.com/Alice-Marx/dsh-mv-workshop/tree/main/packs/polytech-tree) 1.2.0 | [secwind7/polytech-tree](https://github.com/secwind7/polytech-tree) | 代码 MIT + 结构化数据 CC BY 4.0 + 原始中文描述 CC BY-SA 4.0，含完整条目与来源署名 / code MIT + structured data CC BY 4.0 + full original descriptions CC BY-SA 4.0, with source credits |

## 1. 歌曲与歌词 / Song and lyrics

《world.execute(me);》的作曲、作词、录音及其歌词文本的一切权利归 **Mili** 及其权利人所有。
插件 npm 本体不含歌曲、真实歌词或音乐录音；用户自行提供音乐。自0.9.4起，工坊可分发明确授权并署名的歌词、译文、时间轴、频谱及画面资源，安装后自动加载。Mili 同人完整包的歌词使用依据为 https://projectmili.com/copyright-guidelines ，限非商业同人用途，并非代码 MIT 对歌词授予许可；具体资源分别按包内 NOTICE / LYRICS-NOTICE 与字段声明使用。

0.9.5 可加载工坊内独立声明的 OFL-1.1 字体与图像图集；npm 本体不含字体或舞者图像。新舞者基于用户提供的 DeepSeek1.png 重新制作，用户确认非商业同人公开，保留原角色署名并标注 AI 辅助；不是上游未公开舞者或第三方 MMD 素材。Windows 字体仅本机使用，不分发字体文件、转换字体或逐字符字模；依据 https://learn.microsoft.com/en-us/typography/fonts/font-faq 。

All rights in "world.execute(me);" (composition, lyrics, recordings) belong to Mili and the respective rights
holders. The npm plugin includes no song data. Workshop packs may include separately licensed and credited lyrics, translations and non-audio resources; music recordings remain user-provided. Mili caption terms for non-commercial fan MVs are independent from visual-code MIT and are recorded in each pack's LYRICS-NOTICE.

## 2. 场景与时间轴：world.execute-me-ascii（经作者许可移植）/ Scenes and timing (ported with permission)

- 原项目：<https://github.com/yym8224961/world.execute-me-ascii>，作者 **yym8224961**（Bilibili UP 主「野生大K」）。
- `presets/world-execute-me/src/` 里的 `scenes.gen.mjs`、`film.mjs`、`canvas.mjs`、`pyrt.mjs` 是该项目 `scenes.py` /
  `player.py`（`Film.render(t, w, h)`、Canvas、字体、章节与时间轴）的 JavaScript 移植（`scenes.gen.mjs` 由
  `tools/py2js.py` 从本机的 `scenes.py` 机械转译后再手工修正）。0.1–0.8 随 npm 包分发；**0.9.0 起**只以工坊包
  `world-execute-me` 的 `scenes.js`（由 `presets/build-workshop-packs.mjs` 打包成沙箱场景脚本）分发。
- **许可情况**：
  1. 作者在其 Bilibili 视频的置顶评论中表示该项目已开源、可以在各种终端中播放，并给出了上面的 GitHub 链接；
  2. 作者于 **2026-10-03** 直接向本插件作者 **Alice-Marx** 表示同意修改和使用该项目。
- **注意**：截至 2026-10-03，该仓库**没有 LICENSE 文件**。「开源」的口头表述和私下同意都不等同于明确的开源许可证。
  工坊包由同一作者（Alice-Marx）在她自己的公开仓库里再分发，与此前通过 npm 和本公开仓库分发相同；包内 `NOTICE.md`
  写明这是经许可的使用、**不授予**第三方任何许可。建议把作者的同意保存为书面记录，并请作者在原仓库添加 LICENSE。
- 如果作者撤回同意或提出其他要求，会按其要求修改或下架工坊包并移除 `presets/world-execute-me/`。
- 第三方如需复用这些文件，请先自行取得原作者许可；本仓库的 MIT 许可证**不覆盖**它们（见 LICENSE 末尾）。

The scene/timing code is a port of world.execute-me-ascii by yym8224961 (Bilibili: 野生大K), used with the author's
permission (2026-10-03), which is not an open-source licence. Since 0.9.0 it ships only as the `world-execute-me`
workshop pack (source in `presets/world-execute-me/`, excluded from the MIT licence).

## 3. dsh PV：world-execute-me-dsh-pv（MIT）与鲸鱼娘立绘（CC BY-NC-SA 4.0）/ dsh PV

- **渲染器（MIT，在 npm 包里）**：`.dsh-plugin/client/mv/dshpv/*.mjs` 是 **MisakaZentai / world-execute-me-dsh-pv**
  （<https://github.com/MisakaZentai/world-execute-me-dsh-pv>，commit `a4dd0f7`，MIT，Copyright (c) 2026 MisakaZentai）
  合成渲染器的 JavaScript 重写。0.9.0 起它从 MV 包的 `canvas.assets` 读取数据和立绘，自身不带任何数据。
- **数据（MIT，工坊包）**：`presets/dsh-pv/data/` 的 `timeline.json`、`chat.json`、`band.json` 是在本机运行上游渲染器后
  记录的绘制指令、对话窗口内容与时间表（MIT 全文见该目录 `NOTICE.md`）。歌词只以 sha256 和时间出现，不含歌词文字。
  工坊包里拆分成 ≤ 512 KB 的分片。
- **立绘（CC BY-NC-SA 4.0，工坊包）**：`presets/dsh-pv/art/` 的 8 张表情和 1 张女仆立绘（200×360 WebP）按
  **署名-非商业性使用-相同方式共享 4.0 国际** 授权，许可全文为该目录的 `LICENSE`，署名链与改动见其 `NOTICE.md`：
  溟月 © **上善无形** → 女仆版 **ZipZipPipe** → 立绘 **Small-tailqwq / dsh-deep-whale** → 表情 **dsh-whale-galgame**
  → 经 **MisakaZentai / world-execute-me-dsh-pv** 取得。**不得商用**；改编须按同一许可分享。
- 0.6.0–0.8.x 的 npm 包含有这些数据和立绘（许可 `(MIT AND CC-BY-NC-SA-4.0)`）；**0.9.0 起不再包含**，它们只在工坊包
  `world-execute-me-dsh-pv`（整包 `CC-BY-NC-SA-4.0`）里分发。
- The dsh PV renderer (MIT) stays in the package; its data (MIT) and the whale-girl art (CC BY-NC-SA 4.0) ship only
  in the `world-execute-me-dsh-pv` workshop pack since 0.9.0.
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

- **0.7.0 模板示例 / template examples**：模板 `examples/` 里的七个场景模块和 `rich-pack` 是对 world-execute-me-dsh-pv（MIT，Copyright (c) 2026 MisakaZentai）中聊天窗口、心跳线、运维滚动条、stdout token 条、EXECUTION 分屏、鲸落结尾和后期效果的简化改编，随附该 MIT 许可文本（`examples/NOTICE.md`）。**不含**立绘（鲸鱼剪影由代码绘制）、歌曲音频或歌词文字（示例歌词为占位文字）。Simplified adaptations of the dsh PV scenes (MIT, © 2026 MisakaZentai), shipped with the MIT notice; no artwork, audio or lyric text.
- **创意工坊 / workshop**：工坊中的包由各自作者按包内声明的许可发布（仓库默认 CC BY-NC-SA 4.0），不属于本 npm 包；本插件只按用户操作下载。Workshop packs are licensed by their authors and are not part of this package.

## 5. 歌词引擎与在线服务（不随包分发）/ Lyrics engine and online service (not bundled)

用户确认后，插件用 uv 把下列软件和模型下载到 `%LOCALAPPDATA%\dsh-mv\engine`，它们按各自许可证使用，不随本包分发：
PyTorch（BSD-3-Clause）、faster-whisper（MIT，SYSTRAN）、CTranslate2（MIT）、Demucs / htdemucs（MIT，Meta）、
julius（MIT）、PyAV（BSD-3-Clause，FFmpeg 为 LGPL）、Hugging Face Hub 客户端（Apache-2.0）、
OpenAI Whisper 模型权重（MIT，经 Systran 转换为 CTranslate2 格式）。
**LRCLIB**（<https://lrclib.net>）是社区维护的免费歌词库；查询只发送歌名、歌手、专辑和时长，歌词内容的权利归原权利人所有，
可以在设置 `lrclib` 中关闭。
