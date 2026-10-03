# 02 分段分镜

**输入**：`notes/brief.md`、段落表（`x-dsh-mv-ai.sections`）、歌词时间轴。
**输出**：`notes/storyboard.md`，每个段落一张“分镜卡”，然后据此写 `scenes.js`。

每个段落写一张卡（照抄下面的格式）：

```
## <段落 kind> <start>–<end>s  （情绪 x/10）
画面：主体是什么、放在屏幕哪里、占多大（按 cols×rows 的比例写，例如“居中，宽 60%”）
母题：本段出现 / 变化的母题
歌词：显示方式与位置；当前词如何强调（ctx.lyric.word / ctx.lyric.words）
音乐：哪些元素跟 bands / bass / beat 走（如 每拍闪一次、低频推动半径）
运动：随 section.progress 的变化（开头 → 结尾），保证同一时刻画面固定
转场：进入和离开本段的方式（淡入淡出、擦除、故障、切黑），约 0.5–1 秒
性能：本段最重的计算是什么，估计每帧多少格
```

要求：

- 相邻段落要有明显区别（构图或主色），同类段落（两次副歌）要有递进：第二次更强或有新元素。
- 没有歌词的前奏 / 间奏 / 尾声也要有完整画面，不要只留空白。
- 段落表缺失时，按时长和能量自己划分，并写进 mv.json 的 `x-dsh-mv-ai.sections`（`[{kind,label,start,end}]`），
  脚本通过 `ctx.section` 读取。
- 每张卡都要能在 `scenes.js` 里对应到一个函数（如 `intro(g, t, ctx)`、`chorus(g, t, ctx)`）。
