// Fictional sample data for the redesign mockups (no real lyrics or audio).
export const LIBRARY = [
  { id: 'wem', title: 'world.execute(me);', artist: 'Mili', kind: '内置预设', dur: 212, scene: 'examples/execution-split.scene.js', t: 44.2 },
  { id: 'dshpv', title: 'world.execute(me); dsh PV', artist: 'MisakaZentai', kind: '画布预设', dur: 212, scene: 'examples/chat-window.scene.js', t: 25 },
  { id: 'neon', title: 'Neon Terminal', artist: 'dsh-mv', kind: '创意工坊', dur: 120, cover: 'covers/neon-terminal-example.png', scene: 'examples/rich-pack/scenes.js', t: 44 },
  { id: 'starlight', title: 'Starlight Run', artist: 'Alice', kind: 'AI 制作', dur: 118, scene: 'examples/heartbeat.scene.js', t: 66 },
  { id: 'token', title: 'Token Rain', artist: 'Null Pointer', kind: '创意工坊', dur: 176, cover: 'covers/token-rain.png', scene: 'examples/token-bar.scene.js', t: 21 },
  { id: 'ghost', title: 'Ghost Rule', artist: 'DECO*27', kind: 'MV 包', dur: 205, scene: 'examples/ops-ticker.scene.js', t: 50 },
  { id: 'midnight', title: '午夜回路', artist: '未署名', kind: 'MV 包', dur: 241, scene: 'examples/post-effects.scene.js', t: 52 },
  { id: 'paper', title: 'Paper Planes', artist: 'Kana', kind: 'AI 制作', dur: 189, scene: 'examples/whale-fall.scene.js', t: 104 },
]
export const WORKSHOP = [
  { id: 'neon-terminal-example', title: 'Neon Terminal (example)', artist: 'dsh-mv', author: 'Alice-Marx', license: 'MIT', dur: 120, version: '1.1.0', installed: '1.0.0', cover: 'covers/neon-terminal-example.png', tags: ['cyberpunk', 'karaoke', 'spectrum'], renderer: 'script', size: 35544, desc: '六段式示例：开机、聊天窗、频谱环、心跳、红色 EXECUTE 故障与鲸落结尾。', sections: 6, fp: true },
  { id: 'heartbeat-exe', title: 'heartbeat.exe', artist: 'Lumen Fold', author: 'pixelmoth', license: 'CC-BY-NC-SA-4.0', dur: 198, version: '0.3.0', cover: 'covers/heartbeat-exe.png', tags: ['minimal', 'heartbeat'], renderer: 'script', size: 18200, desc: '只用一条心跳线讲完整首歌：副歌时心电图跟随低频跳动。', sections: 5, fp: true },
  { id: 'whale-fall-protocol', title: 'Whale Fall Protocol', artist: 'Deep Sea Choir', author: 'tidepool', license: 'CC-BY-NC-SA-4.0', dur: 245, version: '1.0.2', installed: '1.0.2', cover: 'covers/whale-fall-protocol.png', tags: ['ocean', 'slow'], renderer: 'script', size: 26400, desc: '鲸落主题：粒子雪与缓慢下沉的剪影，结尾逐字消散。', sections: 7, fp: false },
  { id: 'token-rain', title: 'Token Rain', artist: 'Null Pointer', author: 'kana-dev', license: 'CC-BY-4.0', dur: 176, version: '2.0.0', cover: 'covers/token-rain.png', tags: ['code-rain', 'fast'], renderer: 'script', size: 21900, desc: 'stdout token 条和代码雨，逐词时间驱动打字效果。', sections: 6, fp: true },
  { id: 'execute-split', title: 'EXECUTE//SPLIT', artist: 'Glitch Atelier', author: 'mono-k', license: 'CC-BY-NC-4.0', dur: 212, version: '1.4.0', cover: 'covers/execute-split.png', tags: ['glitch', 'red'], renderer: 'script', size: 30100, desc: '分屏 EXECUTION，副歌每拍一次红色故障。', sections: 8, fp: true },
  { id: 'ops-ticker-blues', title: 'Ops Ticker Blues', artist: 'Server Room Band', author: 'oncall', license: 'MIT', dur: 164, version: '0.9.1', cover: 'covers/ops-ticker-blues.png', tags: ['ops', 'ticker'], renderer: 'script', size: 15800, desc: '运维滚动条与告警面板，适合节奏稳定的歌。', sections: 4, fp: false },
  { id: 'rainy-kernel', title: 'Rainy Kernel', artist: 'Moss Cache', author: 'hikari', license: 'CC-BY-NC-SA-4.0', dur: 230, version: '0.1.0', tags: ['rain', 'lofi'], renderer: 'generic', size: 6400, desc: '通用渲染 + 自定义调色板，雨夜 lo-fi。', sections: 3, fp: false },
  { id: '404-sakura', title: '404 Sakura', artist: 'Petal Overflow', author: 'yuzu', license: 'CC-BY-4.0', dur: 201, version: '1.0.0', tags: ['sakura', 'pastel'], renderer: 'script', size: 19700, desc: '樱花粒子与 404 页面，桥段整屏花瓣。', sections: 6, fp: true },
]
export const LICENSES = ['全部许可', 'MIT', 'CC-BY-4.0', 'CC-BY-NC-4.0', 'CC-BY-NC-SA-4.0']
export const AI_STEPS = [
  { id: 'pack', title: '建立 MV 包', detail: '复制音频、计算 48 段频谱（20 fps）', state: 'done', took: '3.1 s' },
  { id: 'tags', title: '读取标签', detail: 'ID3：Starlight Run · Alice · 1:58', state: 'done', took: '0.1 s' },
  { id: 'lrclib', title: 'LRCLIB 查询', detail: '找到同步歌词 · 21 行', state: 'done', took: '0.8 s' },
  { id: 'engine', title: '歌词引擎识别', detail: 'Demucs 分离人声 → faster-whisper large-v3（GPU）', state: 'running', progress: 0.62 },
  { id: 'align', title: '逐词对齐', detail: '按字 / 词对齐并给出每句置信度', state: 'pending' },
  { id: 'sections', title: '段落检测', detail: '主歌 / 副歌 / 桥段 / 间奏', state: 'pending' },
  { id: 'save', title: '保存并交给 AI', detail: 'lyrics.lrc · timing.json · sections.json · mv.json', state: 'pending' },
]
export const FILES = [['mv.json', 2140], ['scenes.js', 24810], ['cover.png', 7650], ['lyrics.timing.json', 1890], ['README.md', 1220]]
export const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
export const kb = n => n > 1024 * 1024 ? `${(n / 1048576).toFixed(1)} MB` : `${(n / 1024).toFixed(1)} KB`
export function hash(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619); return h >>> 0 }
export function fakeSha(str) { let out = '', h = hash(str); for (let i = 0; i < 8; i++) { h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0; out += h.toString(16).padStart(8, '0') } return out }
