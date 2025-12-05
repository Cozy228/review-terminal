# DataPage 复古游戏风格重设计方案

### 高清伪装（High-Fidelity Fake）总则
目标：用现代 CSS/Flex/Grid **伪装** 成字符终端，获得像素/终端视觉但保持排版稳固、高清锐利（无 CRT 模糊）。

#### 视觉约束 / 硬规则
- **块状度量衡**：所有 `margin/padding/width/height/gap` 必须是同一 Base Unit 的整数倍（建议 `--unit: 0.5rem` 或 `8px`）。禁止 3px 等非整倍数与 sub-pixel 值。
- **字体与抗锯齿**：使用点阵/等宽字体（如 `Press Start 2P`、`VT323`、`JetBrains Mono`），并强制 `-webkit-font-smoothing: none;`、`image-rendering: pixelated;`。保持锐利边缘。
- **边框伪字符化**：只用直角；禁用 `border-radius`。边框宽度 2–4px；优先 `border-style: double` 或 solid 粗线模拟 `╔═╗`/`█`/`║`，完全不用真正 ASCII 拼接。
- **动画顿挫感**：长度/颜色/位置动画一律用 `steps()`（例如 `steps(12)`），禁止默认 `ease`/`ease-in-out` 的平滑过渡。
- **纹理与配色一致性**：空槽/背景可用 `░` 纹理或重复像素背景；填充用 `█` 或重复块纹理。全局遵守 NES/终端色板，禁用模糊滤镜、禁用阴影柔化。

#### 动态表现
- **Decryption Effect（乱码解锁）**：核心大数字（commits、LOC 等）显示时，先用等长随机 hex/符号高速抖动，再从左到右逐位锁定真实值（< 0.6s 完成），只用于关键数据避免审美疲劳。
- **文本化图表**：图表全部由字符构成，禁止 Canvas/SVG 曲线饼图。Sparklines 用 `▂▃▄▅▆▇█`；热力图用 `· : + # @`；柱状/条形优先 ASCII 块（`█`/`░`）或纯字符串。
- **进度条纹理**：空槽用 `░░░░`，填充用 `████`，外框 2–4px 双线/粗线；填充动画用 `steps()` 阶梯式推进。
- **轻度 Glitch**：用于强调异常（如 Bugs Fixed），短时 `translate/skew` 抖动 + 闪红，高频率限制，避免影响可读性。
- **“不完美加载”**：在数据到达前展示原始/乱码占位，而非精美 spinner；完成后锁定真实值。

#### 技术落地与 Do/Don't
- **Do**：React + CSS/Flex/Grid + GSAP（仅用时间线与 `steps()`）；布局以 CSS 边框伪装 ASCII；字号/行高/间距全走 Base Unit；字符图表直接字符串或伪元素。
- **Don't**：不要 CRT/模糊滤镜；不要圆角；不要 sub-pixel/奇数像素微调；不要 Canvas/SVG 图表；不要平滑补间。

## 目标
将 DataPage 重塑为复古游戏视觉风格的年度回顾体验：
- 保留游戏美学（像素边框、进度条、成就解锁）
- 使用正常开发者术语（commits, PRs, reviews）
- 街机过场式动画 + 打字机效果

## 设计理念

### 视觉风格参考
- **FC/NES/SNES 游戏界面**: 状态栏、HP/MP条、得分板
- **经典 RPG**: 最终幻想风格的菜单、勇者斗恶龙的战斗结算
- **像素艺术边框**: box-drawing 字符创建游戏窗口
- **复古配色**: 限定调色板 (类似 NES 16色)
- **成就系统**: Steam/PlayStation 风格的解锁动画

---

## 页面结构设计

（开场动画已有实现，此处跳过）

### 1. 玩家状态卡
```
┌─────────────────────────────────────────┐
│  PLAYER STATUS                          │
├─────────────────────────────────────────┤
│                                         │
│    ████████                             │
│    ██    ██   @ziyu123213              │
│    ██ ▀▀ ██   LV.99 SENIOR DEVELOPER   │
│    ████████   ─────────────────────     │
│    ██    ██   TEAM: Platform           │
│    ██    ██   LOCATION: Earth          │
│                                         │
│  ═══════════════════════════════════    │
│  EXP  ████████████████████░░░░  92/100  │
│  ═══════════════════════════════════    │
└─────────────────────────────────────────┘
```

### 2. GIT 模块
```
╔═══════════════════════════════════════════════════════════════╗
║   ██████╗ ██╗████████╗                                        ║
║  ██╔════╝ ██║╚══██╔══╝                                        ║
║  ██║  ███╗██║   ██║                                           ║
║  ██║   ██║██║   ██║                                           ║
║  ╚██████╔╝██║   ██║                                           ║
║   ╚═════╝ ╚═╝   ╚═╝                                           ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  Total Commits      2,402      ← 绿色                   │  ║
║  │  Lines of Code      125,847    ← 蓝色                   │  ║
║  │  Longest Streak     47 days    ← 金色                   │  ║
║  │  Peak Month         July (84)  ← 绿色                   │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                               ║
║  ┌─────────────────── MONTHLY COMMITS ────────────────────┐   ║
║  │                                                        │   ║
║  │   84 ┤                   ▄█▄   ← 峰值月份高亮           │   ║
║  │      │              ▄█▄  ███  ▄█▄       ▄█▄            │   ║
║  │      │         ▄█▄  ███  ███  ███  ▄█▄  ███  ▄█▄       │   ║
║  │      │    ▄█▄  ███  ███  ███  ███  ███  ███  ███       │   ║
║  │   45 ┤▄█▄ ███  ███  ███  ███  ███  ███  ███  ███  ▄█▄  │   ║
║  │      └──────────────────────────────────────────────   │   ║
║  │       J   F   M   A   M   J   J   A   S   O   N   D    │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                               ║
║  ┌─────────────────── PULL REQUESTS ──────────────────────┐   ║
║  │                                                        │   ║
║  │  PRs Opened       156          ← 蓝色                   │   ║
║  │  PRs Merged       142 (91%)    ← 绿色                   │   ║
║  │  Reviews Given    287          ← 青色                   │   ║
║  │  Avg Review Time  4.2h         ← 灰色                   │   ║
║  │                                                        │   ║
║  │  MERGE RATE  ████████████████████░░  91%               │   ║
║  └────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════╝

实现说明：数字部分使用 CSS 颜色变量渲染，不是文字标注
```

### 3. SKILLS 模块 (原 STACK + LEARN 合并)
```
╔═══════════════════════════════════════════════════════════════╗
║  ███████╗██╗  ██╗██╗██╗     ██╗     ███████╗                  ║
║  ██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝                  ║
║  ███████╗█████╔╝ ██║██║     ██║     ███████╗                  ║
║  ╚════██║██╔═██╗ ██║██║     ██║     ╚════██║                  ║
║  ███████║██║  ██╗██║███████╗███████╗███████║                  ║
║  ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝                  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────── LANGUAGES ─────────────────────────┐    ║
║  │                                                       │    ║
║  │  TypeScript  ████████████████████████████░░░  68%     │    ║
║  │  JavaScript  ████████████░░░░░░░░░░░░░░░░░░░  24%     │    ║
║  │  Python      ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░   6%     │    ║
║  │  Go          █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   2%     │    ║
║  │                                                       │    ║
║  └───────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ┌─────────────────── FRAMEWORKS ────────────────────────┐    ║
║  │                                                       │    ║
║  │  React      ████████████████████  2,847h              │    ║
║  │  Node.js    ███████████░░░░░░░░░  1,523h              │    ║
║  │  Next.js    ██████░░░░░░░░░░░░░░    892h              │    ║
║  │                                                       │    ║
║  └───────────────────────────────────────────────────────┘    ║
║                                                               ║
║  ┌─────────────────── LEVELING UP ───────────────────────┐    ║
║  │                                                       │    ║
║  │  AWS            ████████████████████  EXPERT          │    ║
║  │  System Design  ████████████████░░░░  ADVANCED        │    ║
║  │  Kubernetes     ████████████████░░░░  ADVANCED        │    ║
║  │  GraphQL        ████████████░░░░░░░░  INTERMEDIATE    │    ║
║  │  Rust           ████░░░░░░░░░░░░░░░░  BEGINNER        │    ║
║  │                                                       │    ║
║  └───────────────────────────────────────────────────────┘    ║
║                                                               ║
║  247 packages  ·  18 projects  ·  7 courses  ·  2 certs       ║
╚═══════════════════════════════════════════════════════════════╝

颜色：语言使用官方颜色，技能等级使用渐变（EXPERT金色→BEGINNER灰色）
```

### 4. DELIVERY 模块 (原 FLOW)
```
╔═══════════════════════════════════════════════════════════════╗
║  ██████╗ ███████╗██╗     ██╗██╗   ██╗███████╗██████╗ ██╗   ██╗║
║  ██╔══██╗██╔════╝██║     ██║██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝║
║  ██║  ██║█████╗  ██║     ██║██║   ██║█████╗  ██████╔╝ ╚████╔╝ ║
║  ██║  ██║██╔══╝  ██║     ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗  ╚██╔╝  ║
║  ██████╔╝███████╗███████╗██║ ╚████╔╝ ███████╗██║  ██║   ██║   ║
║  ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  Stories Completed   156       ← 绿色                   │  ║
║  │  Bugs Fixed          87        ← 红色                   │  ║
║  │  In Progress         48        ← 金色                   │  ║
║  │  Avg Cycle Time      2.3 days  ← 灰色                   │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                               ║
║  ┌─────────────────── TOP PROJECTS ──────────────────────┐    ║
║  │                                                       │    ║
║  │  Platform Modernization   ████████████████████  100%  │    ║
║  │  API Gateway              ███████████████░░░░░   75%  │    ║
║  │  Dashboard v2             ██████████░░░░░░░░░░   50%  │    ║
║  │                                                       │    ║
║  └───────────────────────────────────────────────────────┘    ║
╚═══════════════════════════════════════════════════════════════╝
```

### 5. COPILOT 模块
```
╔═══════════════════════════════════════════════════════════════╗
║   ██████╗ ██████╗ ██████╗ ██╗██╗      ██████╗ ████████╗       ║
║  ██╔════╝██╔═══██╗██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝       ║
║  ██║     ██║   ██║██████╔╝██║██║     ██║   ██║   ██║          ║
║  ██║     ██║   ██║██╔═══╝ ██║██║     ██║   ██║   ██║          ║
║  ╚██████╗╚██████╔╝██║     ██║███████╗╚██████╔╝   ██║          ║
║   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝ ╚═════╝    ╚═╝          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │                                                         │  ║
║  │  Acceptance Rate     34.7%     ← 绿色                   │  ║
║  │  Suggestions Used    4,521     ← 蓝色                   │  ║
║  │  Time Saved          ~47h      ← 金色                   │  ║
║  │                                                         │  ║
║  │  ██████████████░░░░░░░░░░░░  34.7%                      │  ║
║  │                                                         │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

### 6. TEAM 模块
```
╔═══════════════════════════════════════════════════════════════╗
║  ████████╗███████╗ █████╗ ███╗   ███╗                         ║
║  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║                         ║
║     ██║   █████╗  ███████║██╔████╔██║                         ║
║     ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║                         ║
║     ██║   ███████╗██║  ██║██║ ╚═╝ ██║                         ║
║     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────── TOP COLLABORATORS ─────────────────┐    ║
║  │                                                       │    ║
║  │  @alex_dev    34 PRs  ·  67 reviews   ← 数字绿色      │    ║
║  │  @sarah_eng   28 PRs  ·  52 reviews                   │    ║
║  │  @mike_code   21 PRs  ·  43 reviews   ← 数字蓝色      │    ║
║  │  @emma_tech   18 PRs  ·  31 reviews                   │    ║
║  │  @john_dev    15 PRs  ·  24 reviews   ← 数字灰色      │    ║
║  │                                                       │    ║
║  └───────────────────────────────────────────────────────┘    ║
║                                                               ║
║  Total Reviews: 217  ·  Top 5% in code reviews                ║
╚═══════════════════════════════════════════════════════════════╝
```

### 7. COMMUNITY 模块
```
╔═══════════════════════════════════════════════════════════════╗
║   ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗   ██╗███╗   ██╗   ║
║  ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║   ██║████╗  ██║   ║
║  ██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║██╔██╗ ██║   ║
║  ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║██║╚██╗██║   ║
║  ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║   ║
║   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────── ACTIVITIES ────────────────────────┐    ║
║  │                                                       │    ║
║  │  2025-03-15  Tech Talk       ← 日期金色               │    ║
║  │  "React Server Components Deep Dive"                  │    ║
║  │                                                       │    ║
║  │  2025-06-20  Hackathon                                │    ║
║  │  "Internal Innovation Week"                           │    ║
║  │                                                       │    ║
║  │  2025-09-10  Workshop                                 │    ║
║  │  "TypeScript Best Practices"                          │    ║
║  │                                                       │    ║
║  │  2025-11-05  Tech Talk                                │    ║
║  │  "Building Scalable APIs"                             │    ║
║  │                                                       │    ║
║  └───────────────────────────────────────────────────────┘    ║
║                                                               ║
║  Bravos: 23 received  ·  31 given                            ║
╚═══════════════════════════════════════════════════════════════╝
```

### 8. SUMMARY 模块 + 成就解锁
```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        ██████╗  █████╗ ███╗   ███╗███████╗                    ║
║       ██╔════╝ ██╔══██╗████╗ ████║██╔════╝                    ║
║       ██║  ███╗███████║██╔████╔██║█████╗                      ║
║       ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝                      ║
║       ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗                    ║
║        ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝                    ║
║                                                               ║
║        ██████╗██╗     ███████╗ █████╗ ██████╗ ██╗             ║
║       ██╔════╝██║     ██╔════╝██╔══██╗██╔══██╗██║             ║
║       ██║     ██║     █████╗  ███████║██████╔╝██║             ║
║       ██║     ██║     ██╔══╝  ██╔══██║██╔══██╗╚═╝             ║
║       ╚██████╗███████╗███████╗██║  ██║██║  ██║██╗             ║
║        ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝             ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║                      ╭───────────────╮                        ║
║                      │               │                        ║
║                      │   ★  92  ★    │                        ║
║                      │    / 100      │                        ║
║                      │               │                        ║
║                      ╰───────────────╯                        ║
║                        FINAL SCORE                            ║
║                                                               ║
║  ════════════════════════════════════════════════════════     ║
║                  🎮  ACHIEVEMENTS UNLOCKED  🎮                 ║
║  ════════════════════════════════════════════════════════     ║
║                                                               ║
║   ╭─────────────╮  ╭─────────────╮  ╭─────────────╮           ║
║   │     🏆      │  │     ⚡      │  │     🤝      │           ║
║   │   COMMIT    │  │     PR      │  │    TEAM     │           ║
║   │  CHAMPION   │  │  VELOCITY   │  │   PLAYER    │           ║
║   │ [LEGENDARY] │  │   [EPIC]    │  │   [EPIC]    │           ║
║   ╰─────────────╯  ╰─────────────╯  ╰─────────────╯           ║
║                                                               ║
║   ╭─────────────╮  ╭─────────────╮  ╭─────────────╮           ║
║   │     🐛      │  │     🔥      │  │     🌅      │           ║
║   │     BUG     │  │   STREAK    │  │    EARLY    │           ║
║   │  SQUASHER   │  │   MASTER    │  │    BIRD     │           ║
║   │   [RARE]    │  │   [RARE]    │  │  [COMMON]   │           ║
║   ╰─────────────╯  ╰─────────────╯  ╰─────────────╯           ║
║                                                               ║
║  ════════════════════════════════════════════════════════     ║
║                                                               ║
║              ▲ +24% POWER GROWTH FROM LAST YEAR ▲             ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │     [R] REPLAY     [S] SHARE     [D] DOWNLOAD           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                               ║
║                    PRESS ANY KEY TO CONTINUE                  ║
║                           ▼ ▼ ▼                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### 成就解锁动画效果
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│      ╔═══════════════════════════════════════╗      │
│      ║                                       ║      │
│      ║    🏆  ACHIEVEMENT UNLOCKED!  🏆      ║      │
│      ║                                       ║      │
│      ║         COMMIT CHAMPION               ║      │
│      ║         ─────────────────             ║      │
│      ║         2000+ commits in a year       ║      │
│      ║                                       ║      │
│      ║              [LEGENDARY]              ║      │
│      ║                                       ║      │
│      ╚═══════════════════════════════════════╝      │
│                                                     │
└─────────────────────────────────────────────────────┘

动画序列:
1. 边框从中心扩展绘制 (0.3s)
2. 图标从上方弹入 (0.2s, ease-out-back)
3. 文字逐行打字机显示 (0.5s)
4. [LEGENDARY] 闪烁3次后固定 (0.6s)
5. 整体停留 1s 后淡出
6. 下一个成就弹出...
```

---

## 实现计划

### 第一阶段：基础设施

#### 1.1 新增 ASCII 艺术常量
**文件**: [src/constants/ascii-game.ts](src/constants/ascii-game.ts) (新建)

```typescript
// 模块标题 ASCII (ANSI Shadow 字体)
export const ASCII_SKILLS = `...`;      // 技能模块
export const ASCII_DELIVERY = `...`;    // 交付模块
export const ASCII_COPILOT = `...`;     // AI 伙伴
export const ASCII_TEAM = `...`;        // 团队协作
export const ASCII_COMMUNITY = `...`;   // 社区贡献
export const ASCII_GAME_CLEAR = `...`;  // 年度总结

// 边框字符集
export const GAME_BORDER = {
  TOP_LEFT: '╔', TOP_RIGHT: '╗',
  BOTTOM_LEFT: '╚', BOTTOM_RIGHT: '╝',
  HORIZONTAL: '═', VERTICAL: '║',
  // ... 更多
};
```

#### 1.2 添加游戏风格样式
**文件**: [src/styles/retro-game.css](src/styles/retro-game.css) (新建)

```css
/* 复古游戏调色板 */
:root {
  --retro-bg: #0f0f23;
  --retro-primary: #00ff41;
  --retro-gold: #ffcc00;
  --retro-legendary: #ff8c00;
  --retro-epic: #a855f7;
  --retro-rare: #3b82f6;
  --retro-common: #6b7280;
}

/* 游戏边框 */
.game-frame { ... }

/* 像素进度条 */
.pixel-bar { ... }
.pixel-bar-fill { ... }

/* 成就卡片 */
.achievement-card { ... }
.achievement-card.legendary { ... }
.achievement-card.epic { ... }

/* 闪烁动画 */
@keyframes blink { ... }
.blink { animation: blink 1s infinite; }

/* 成就解锁弹窗 */
@keyframes achievement-unlock { ... }
.achievement-popup { ... }
```

### 第二阶段：适配器重构

#### 2.1 GitAdapter 增强
**文件**: [src/adapters/GitAdapter.ts](src/adapters/GitAdapter.ts)

新增方法：
- `toStatsBox()` - 统计数据框 (commits, lines, streak)
- `toPullRequestStats()` - PR 统计框
- `toMonthlyChart()` - 像素柱状图

#### 2.2 新增适配器
**文件**: [src/adapters/CopilotAdapter.ts](src/adapters/CopilotAdapter.ts) (新建)
- `toCompanionStats()` - AI 伙伴统计卡片

**文件**: [src/adapters/TeamAdapter.ts](src/adapters/TeamAdapter.ts) (新建)
- `toCollaboratorsList()` - 协作者列表 (PRs, reviews)

**文件**: [src/adapters/SkillsAdapter.ts](src/adapters/SkillsAdapter.ts) (新建)
- `toLanguageBars()` - 语言进度条
- `toFrameworkStats()` - 框架使用时长
- `toLevelingUp()` - 技能提升进度

**文件**: [src/adapters/CommunityAdapter.ts](src/adapters/CommunityAdapter.ts) (新建)
- `toActivitiesList()` - 活动列表

### 第三阶段：页面重构

#### 3.1 DataPage 完全重写
**文件**: [src/pages/DataPage.tsx](src/pages/DataPage.tsx)

新模块结构（8个模块，调整顺序）：
```
1. PlayerCard       - 玩家状态卡
2. GitModule        - 代码贡献 (commits, PRs, reviews)
3. TeamModule       - 协作者 (紧跟代码贡献，展示协作)
4. SkillsModule     - 技能 (languages, frameworks, leveling up)
5. DeliveryModule   - 交付 (stories, bugs, projects)
6. CopilotModule    - AI 伙伴统计
7. CommunityModule  - 社区贡献
8. SummaryModule    - 年度总结 + 成就解锁动画
```

#### 3.2 成就解锁组件
**文件**: [src/components/AchievementUnlock.tsx](src/components/AchievementUnlock.tsx) (新建)

- 弹窗式成就解锁动画
- 支持队列播放多个成就
- 不同稀有度不同特效

### 第四阶段：动画系统

#### 4.1 App.tsx 动画序列更新
**文件**: [src/App.tsx](src/App.tsx)

```typescript
const runArcadeAnimation = useCallback(() => {
  const tl = gsap.timeline();

  // ═══════════════════════════════════════════════════════════
  // 过场策略：只在"章节转换"时添加过场，而非每个模块
  // 章节1: 个人信息 (Player)
  // 章节2: 代码贡献 (Git + Team) - 相关模块连续播放
  // 章节3: 技术能力 (Skills + Delivery + Copilot) - 相关模块连续播放
  // 章节4: 社区影响 (Community)
  // 章节5: 年度总结 (Summary + Achievements)
  // ═══════════════════════════════════════════════════════════

  // ─── 章节1: 个人信息 ───
  tl.add(playerCardAnimation(), 'player')

  // ─── 过场: Loading Bar 动画 ───
    .add(loadingTransition('Loading code stats...'), 'transition1')

  // ─── 章节2: 代码贡献 ───
    .add(gitModuleAnimation(), 'git')
    .add(teamModuleAnimation(), 'team')  // 无过场，直接跟随

  // ─── 过场: Loading Bar 动画 ───
    .add(loadingTransition('Analyzing tech stack...'), 'transition2')

  // ─── 章节3: 技术能力 ───
    .add(skillsModuleAnimation(), 'skills')
    .add(deliveryModuleAnimation(), 'delivery')  // 无过场
    .add(copilotModuleAnimation(), 'copilot')    // 无过场

  // ─── 过场: Loading Bar 动画 ───
    .add(loadingTransition('Gathering community data...'), 'transition3')

  // ─── 章节4: 社区影响 ───
    .add(communityModuleAnimation(), 'community')

  // ─── 特殊过场: 屏幕闪烁 ───
    .add(transitionFlash(), 'flash')

  // ─── 章节5: 年度总结 ───
    .add(summaryAnimation(), 'summary')
    .add(achievementUnlockSequence(), 'achievements')
    .add(() => setShowMenu(true));

  tl.play();
}, []);
```

### 第五阶段：类型更新

**文件**: [src/types/index.ts](src/types/index.ts)

新增类型：
```typescript
// 成就稀有度
export type AchievementRarity = 'legendary' | 'epic' | 'rare' | 'common';

// 动画阶段
export type AnimationPhase =
  | 'player' | 'git' | 'skills' | 'delivery'
  | 'copilot' | 'team' | 'community' | 'summary' | 'achievements';
```

---

## 文件变更清单

| 操作 | 文件路径 |
|------|----------|
| 新建 | `src/constants/ascii-game.ts` |
| 新建 | `src/styles/retro-game.css` |
| 新建 | `src/adapters/CopilotAdapter.ts` |
| 新建 | `src/adapters/TeamAdapter.ts` |
| 新建 | `src/adapters/SkillsAdapter.ts` |
| 新建 | `src/adapters/CommunityAdapter.ts` |
| 新建 | `src/components/AchievementUnlock.tsx` |
| 修改 | `src/pages/DataPage.tsx` |
| 修改 | `src/adapters/GitAdapter.ts` |
| 修改 | `src/App.tsx` |
| 修改 | `src/types/index.ts` |
| 修改 | `src/index.css` (导入新样式) |

---

## 动画方案分析

### 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **ScrollTrigger** | 用户控制节奏，可回看 | 需要滚动操作，不够沉浸 |
| **街机过场式** | 沉浸感强，像看电影 | 用户被动，无法控制 |
| **混合式** | 兼顾两者优点 | 实现复杂度高 |

### 推荐：街机过场式 + 可选跳过

类似经典街机游戏的过场动画体验：
- 自动播放，用户沉浸观看
- 可按任意键跳过当前模块
- 播放完成后可回看（滚动浏览）

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ╔═══════════════════════════════════════════════════╗     │
│   ║  模块从右侧滑入 ──────────────────────────────→  ║     │
│   ║                                                   ║     │
│   ║  ┌─────────────────────────────────────────────┐ ║     │
│   ║  │                                             │ ║     │
│   ║  │   内容逐行打字机显示                        │ ║     │
│   ║  │   数字滚动计数                              │ ║     │
│   ║  │   进度条填充                                │ ║     │
│   ║  │                                             │ ║     │
│   ║  └─────────────────────────────────────────────┘ ║     │
│   ║                                                   ║     │
│   ╚═══════════════════════════════════════════════════╝     │
│                                                             │
│   ────────────────── LOADING NEXT... ──────────────────     │
│   ██████████████████░░░░░░░░░░░░░░░░  50%                   │
│                                                             │
│                    [SPACE] Skip  [ESC] Skip All             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 实现方式

使用 **GSAP Timeline** 串联所有动画（不用 ScrollTrigger）：

```typescript
const runArcadeAnimation = () => {
  const master = gsap.timeline();

  // 每个模块是一个子 timeline
  master
    .add(playerCardScene())      // 场景1: 玩家卡片
    .add(transitionWipe())       // 过场: 擦除效果
    .add(gitModuleScene())       // 场景2: GIT
    .add(transitionWipe())
    .add(skillsModuleScene())    // 场景3: SKILLS
    // ...
    .add(achievementSequence()); // 最终: 成就解锁

  return master;
};

// 过场效果示例
const transitionWipe = () => {
  return gsap.timeline()
    .to('.current-module', { x: '-100%', duration: 0.3 })
    .set('.next-module', { x: '100%' })
    .to('.next-module', { x: 0, duration: 0.3 });
};
```

### 动画时间轴（优化后）

```
═══════════════════════════════════════════════════════════════
                    章节1: 个人信息
═══════════════════════════════════════════════════════════════
0s ─────── 玩家卡片 (2s)
           │ 卡片淡入 + EXP 填充
           ▼
═══════════════════════════════════════════════════════════════
              Loading Bar 过场 (2.4s)
              "Loading code stats..."
              ████████████████████████████████████  100%
═══════════════════════════════════════════════════════════════
                    章节2: 代码贡献
═══════════════════════════════════════════════════════════════
4.4s ───── GIT 模块 (3s)
           │ ASCII 打字机
           │ 数字滚动
           │ 柱状图升起
           ▼
7.4s ───── TEAM 模块 (2s)        ← 无过场，直接跟随
           │ 协作者列表渐入
           ▼
═══════════════════════════════════════════════════════════════
              Loading Bar 过场 (2.4s)
              "Analyzing tech stack..."
═══════════════════════════════════════════════════════════════
                    章节3: 技术能力
═══════════════════════════════════════════════════════════════
11.8s ──── SKILLS 模块 (2.5s)
           │ 语言进度条填充
           │ 框架使用时长
           │ 技能等级
           ▼
14.3s ──── DELIVERY 模块 (2s)    ← 无过场
           │ 项目进度
           ▼
16.3s ──── COPILOT 模块 (1.5s)   ← 无过场
           │ AI 伙伴统计
           ▼
═══════════════════════════════════════════════════════════════
              Loading Bar 过场 (2.4s)
              "Gathering community data..."
═══════════════════════════════════════════════════════════════
                    章节4: 社区影响
═══════════════════════════════════════════════════════════════
20.2s ──── COMMUNITY 模块 (2s)
           │ 活动列表
           │ Bravos 统计
           ▼
═══════════════════════════════════════════════════════════════
              屏幕闪烁过场 (0.5s)
              ████████████████████████████████████████
═══════════════════════════════════════════════════════════════
                    章节5: 年度总结
═══════════════════════════════════════════════════════════════
22.7s ──── SUMMARY (3s)
           │ GAME CLEAR 标题
           │ 分数跳动
           ▼
25.7s ──── 成就解锁序列 (6个 x 1.5s = 9s)
           │ 弹窗逐个出现
           │ 不同稀有度颜色/动画
           ▼
34.7s ──── 菜单显示
           │ 动画完成，可滚动回看
           完成!

═══════════════════════════════════════════════════════════════
总时长: ~35s
过场次数: 3次 Loading Bar + 1次 Flash = 4次过场
═══════════════════════════════════════════════════════════════
```

### 过场效果类型

只保留两种过场效果，合理分配：

1. **Loading Bar 过场** - 章节间转换使用（共3次）
2. **闪烁 (Flash)** - 仅在进入最终总结时使用（1次）

### Loading Bar 过场动画详解

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│         ──────── Loading code stats... ────────             │
│                                                             │
│         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░             │
│                          ↓                                  │
│         ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  25%        │
│                          ↓                                  │
│         ████████████████░░░░░░░░░░░░░░░░░░░░░░░  50%        │
│                          ↓                                  │
│         ████████████████████████░░░░░░░░░░░░░░░  75%        │
│                          ↓                                  │
│         ███████████████████████████████████████  100%       │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**实现代码**:
```typescript
// Loading Bar 过场组件
const LoadingTransition: React.FC<{ message: string; progress: number }> = ({ message, progress }) => {
  const barWidth = 40; // 总共40个字符宽度
  const filled = Math.floor((progress / 100) * barWidth);
  const empty = barWidth - filled;

  return (
    <div className="loading-transition">
      <div className="loading-message">{message}</div>
      <div className="loading-bar">
        <span className="filled">{'█'.repeat(filled)}</span>
        <span className="empty">{'░'.repeat(empty)}</span>
        <span className="percentage">{progress}%</span>
      </div>
    </div>
  );
};

// GSAP 动画函数
const loadingTransition = (message: string) => {
  const tl = gsap.timeline();

  // 1. 显示 loading 容器
  tl.set('.loading-overlay', { display: 'flex', opacity: 0 })
    .to('.loading-overlay', { opacity: 1, duration: 0.2 })

  // 2. 打字机效果显示文字
    .fromTo('.loading-message',
      { text: '' },
      { text: message, duration: 0.5, ease: 'none' }
    )

  // 3. 进度条动画 - 分段填充模拟加载
    .to('.loading-progress', {
      '--progress': '25%',
      duration: 0.3,
      ease: 'steps(10)'  // 阶梯式填充，模拟像素感
    })
    .to('.loading-progress', {
      '--progress': '60%',
      duration: 0.4,
      ease: 'steps(14)'
    })
    .to('.loading-progress', {
      '--progress': '85%',
      duration: 0.3,
      ease: 'steps(10)'
    })
    .to('.loading-progress', {
      '--progress': '100%',
      duration: 0.2,
      ease: 'steps(6)'
    })

  // 4. 短暂停留后淡出
    .to({}, { duration: 0.3 })  // 停留
    .to('.loading-overlay', { opacity: 0, duration: 0.2 })
    .set('.loading-overlay', { display: 'none' });

  return tl;
};
```

**CSS 样式**:
```css
.loading-overlay {
  position: fixed;
  inset: 0;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--retro-bg);
  z-index: 100;
}

.loading-message {
  font-family: 'JetBrains Mono', monospace;
  color: var(--retro-primary);
  font-size: 1rem;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
}

.loading-bar {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
}

.loading-bar .filled {
  color: var(--retro-primary);  /* 绿色填充 */
}

.loading-bar .empty {
  color: var(--text-dim);  /* 灰色空白 */
}

.loading-bar .percentage {
  color: var(--retro-gold);
  margin-left: 1rem;
}

/* 像素风进度条替代方案（CSS 实现） */
.loading-progress {
  --progress: 0%;
  width: 300px;
  height: 20px;
  background:
    repeating-linear-gradient(
      90deg,
      var(--retro-primary) 0px,
      var(--retro-primary) 6px,
      transparent 6px,
      transparent 8px
    );
  background-size: var(--progress) 100%;
  background-repeat: no-repeat;
  border: 2px solid var(--retro-primary);
  position: relative;
}

.loading-progress::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      var(--text-dim) 0px,
      var(--text-dim) 6px,
      transparent 6px,
      transparent 8px
    );
  opacity: 0.3;
}
```

**动画时间轴**:
```
0.0s ─── 容器淡入
0.2s ─── 文字打字机开始
0.7s ─── 文字完成，进度条开始
0.7s ─── ░░░░░░░░░░░░░░░░░░░░  0%
1.0s ─── ██████░░░░░░░░░░░░░░  25%
1.4s ─── ████████████░░░░░░░░  60%
1.7s ─── █████████████████░░░  85%
1.9s ─── ████████████████████  100%
2.2s ─── 停留完成，开始淡出
2.4s ─── 过场结束，下一章节开始
```

### 键盘控制

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      // 跳过当前模块，快进到下一个
      timeline.current?.tweenTo(nextLabel);
    }
    if (e.code === 'Escape') {
      // 跳过所有动画，直接显示结果
      timeline.current?.progress(1);
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 配色方案

```css
/* 复古游戏调色板 */
--retro-bg: #0f0f23;        /* 深蓝黑背景 */
--retro-primary: #00ff41;   /* 经典绿 */
--retro-gold: #ffcc00;      /* 金色 */
--retro-legendary: #ff8c00; /* 橙色 - 传说 */
--retro-epic: #a855f7;      /* 紫色 - 史诗 */
--retro-rare: #3b82f6;      /* 蓝色 - 稀有 */
--retro-common: #9ca3af;    /* 灰色 - 普通 */
--retro-hp: #ef4444;        /* 红色 - HP */
--retro-mp: #3b82f6;        /* 蓝色 - MP */
--retro-exp: #22c55e;       /* 绿色 - EXP */
```



DataPage 终端+像素风格 V3 重构方案
设计理念
融合三种风格：
🖥️ 终端风: 命令行输入、打字机效果、命令前缀 >
🎮 像素风: 像素进度条、块状字符、等宽字体
🕹️ 街机风: 仅在关键位置（Skills动画、成就解锁）
确认的设计决策
✅ 删除 Loading 过场动画 - 改为终端命令风格
✅ 命令行前缀: 每个数据块前用 > getdata --github 等命令
✅ 去掉模块大边框: 简洁终端风
✅ 边框灰色，数据彩色
✅ Narrative: 打字机逐字显示
✅ Monthly Chart: 需要加入 GIT 模块
✅ Skills 进度条: 动画填充效果（街机风）
***重构方案
1. 终端命令前缀（替代 Loading 过场）
删除: Loading 全屏过场动画
新增: 每个模块前显示终端命令
> getdata --github█                    ← 打字机敲入
> getdata --github                     ← 完成
┌─────────────────────────────────────┐
│  TOTAL COMMITS                      │
│        2,402                        │
│  You're a machine! █                │
└─────────────────────────────────────┘
命令列表:
| 模块 | 命令 |
|------|------|
| GIT | > getdata --github --commits --prs |
| TEAM | > getdata --collaborators |
| SKILLS | > analyze --languages --frameworks |
| DELIVERY | > getdata --jira --stories --bugs |
| COPILOT | > getdata --copilot --suggestions |
| COMMUNITY | > getdata --community --events |
| SUMMARY | > compute --score --achievements |
实现:
const TerminalCommand: React.FC<{
  command: string;
  onComplete: () => void;
}> = ({ command, onComplete }) => {
  // 打字机效果显示命令
  // 完成后调用 onComplete 触发数据显示
};
2. 简化模块结构（无大边框）
GIT 模块示例:
> getdata --github --commits --prs
                                              ← 命令完成后出现数据
┌─────────────────┐  ┌─────────────────┐
│ TOTAL COMMITS   │  │ LINES OF CODE   │     ← 灰色边框
│     2,402       │  │    125,847      │     ← 彩色数字
│ A machine! █    │  │ A library! █    │     ← 打字机 narrative
└─────────────────┘  └─────────────────┘
┌───────────────────────────────────────────┐
│ STREAK    │  PEAK MONTH  │  TOP REPO      │
│ 47 days   │  July (84)   │  platform-api  │
└───────────────────────────────────────────┘
  84 ┤                   ▄█▄                 ← Monthly Chart (ASCII柱状图)
     │              ▄█▄  ███  ▄█▄
     │         ▄█▄  ███  ███  ███  ▄█▄
     │    ▄█▄  ███  ███  ███  ███  ███  ▄█▄
  45 ┤▄█▄ ███  ███  ███  ███  ███  ███  ███
     └──────────────────────────────────────
      J   F   M   A   M   J   J   A   S   O   N   D
3. Skills 模块 - 街机风进度条动画
这是关键的街机风格体现点:
> analyze --languages --frameworks
LANGUAGES
────────────────────────────────────────
TypeScript   ████████████████████████░░░░  68%
             ↑ 动画从左到右填充，像素块逐个出现
JavaScript   ████████████░░░░░░░░░░░░░░░░  24%
Python       ███░░░░░░░░░░░░░░░░░░░░░░░░░   6%
FRAMEWORKS
────────────────────────────────────────
React        ████████████████████  2,847h
             ↑ 彩色（React蓝）
Node.js      ███████████░░░░░░░░░  1,523h
             ↑ 彩色（Node绿）
LEVELING UP 🎮
────────────────────────────────────────
AWS           ████████████████████  [EXPERT]     ← 金色徽章
System Design ████████████████░░░░  [ADVANCED]   ← 紫色徽章
Kubernetes    ████████████████░░░░  [ADVANCED]
GraphQL       ████████████░░░░░░░░  [INTERMEDIATE]
Rust          ████░░░░░░░░░░░░░░░░  [BEGINNER]   ← 灰色徽章
动画实现:
// Skills 模块动画
const animateSkillBars = (tl: gsap.core.Timeline) => {
  // 每个进度条从 0% 填充到目标值
  tl.from('.skill-bar-fill', {
    width: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'steps(20)'  // 像素感的阶梯式填充
  });
  // 徽章弹入
  tl.from('.skill-badge', {
    scale: 0,
    opacity: 0,
    duration: 0.3,
    stagger: 0.1,
    ease: 'back.out(2)'
  }, '-=0.5');
};
4. 打字机组件（GSAP 集成）
使用 GSAP TextPlugin 而非 React state:
// 命令行打字机
const typeCommand = (selector: string, text: string, tl: gsap.core.Timeline) => {
  tl.to(selector, {
    text: text,
    duration: text.length * 0.03,  // 每个字符 30ms
    ease: 'none'
  });
};
// Narrative 打字机
const typeNarrative = (selector: string, text: string, tl: gsap.core.Timeline) => {
  tl.to(selector, {
    text: text,
    duration: text.length * 0.04,  // 每个字符 40ms
    ease: 'none'
  });
};
5. 动画时间线（新版）
const runAnimation = () => {
  const tl = gsap.timeline();
  // ═══ PLAYER CARD ═══
  tl.add(() => setPhase('player'))
    .from('.player-card', { opacity: 0, y: 20, duration: 0.5 })
    .to({}, { duration: 2 });
  // ═══ GIT MODULE ═══
  tl.add(() => scrollToModule('.git-module'))
    .add(() => setPhase('git'))
    // 1. 打字机敲命令
    .call(() => {
      gsap.to('.git-command', {
        text: '> getdata --github --commits --prs',
        duration: 1.2,
        ease: 'none'
      });
    })
    .to({}, { duration: 1.5 })
    // 2. 数据卡片入场
    .from('.git-module .data-card', {
      opacity: 0, y: 30, duration: 0.5, stagger: 0.3
    })
    // 3. 数字计数
    .from('.git-module .data-card-value', {
      textContent: 0, duration: 1, snap: { textContent: 1 }, stagger: 0.2
    }, '-=0.5')
    // 4. Monthly Chart 柱状图升起
    .from('.git-module .chart-bar', {
      height: 0, duration: 0.5, stagger: 0.05
    })
    // 5. 停留
    .to({}, { duration: 3 });
  // ═══ TEAM MODULE ═══
  // ... 同样模式 ...
  // ═══ SKILLS MODULE (街机风) ═══
  tl.add(() => scrollToModule('.skills-module'))
    .add(() => setPhase('skills'))
    .call(() => {
      gsap.to('.skills-command', {
        text: '> analyze --languages --frameworks',
        duration: 1,
        ease: 'none'
      });
    })
    .to({}, { duration: 1.2 })
    // 语言条 - 像素填充动画
    .from('.language-bar-fill', {
      width: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'steps(25)'  // 街机风阶梯填充
    })
    // 框架条
    .from('.framework-bar-fill', {
      width: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'steps(20)'
    })
    // 技能徽章弹入
    .from('.skill-badge', {
      scale: 0,
      rotation: -15,
      duration: 0.4,
      stagger: 0.1,
      ease: 'back.out(2)'
    })
    .to({}, { duration: 3 });
  // ═══ SUMMARY + ACHIEVEMENTS ═══
  // ... 成就解锁保留街机弹窗风格 ...
  return tl;
};
***文件修改清单
| 文件 | 修改内容 |
|------|----------|
| src/pages/DataPage.tsx | 重构组件结构，移除GameFrame，新增DataCard组件 |
| src/styles/retro-game.css | 新的卡片样式，边框改灰色，数据加颜色 |
| src/App.tsx | 动画序列重构，卡片逐个入场，打字机效果 |
| src/components/TypewriterText.tsx | 新增：打字机文字组件 |
| src/components/DataCard.tsx | 新增：数据卡片组件 |
***实现步骤
Step 1: 创建新组件 (src/components/DataCard.tsx)
// 大数字卡片 - 用于重要数据
export const DataCard: React.FC<{
  title: string;
  value: string | number;
  color?: 'green' | 'gold' | 'blue' | 'red';
  narrative?: string;
  className?: string;
}> = ({ title, value, color = 'green', narrative, className }) => (
  <div className={`data-card ${className || ''}`}>
    <div className="data-card-title">{title}</div>
    <div className={`data-card-value ${color}`}>{value}</div>
    {narrative && (
      <TypewriterText text={narrative} className="data-card-narrative" />
    )}
  </div>
);
// 小数据组 - 用于次要数据
export const DataCardGroup: React.FC<{
  items: Array<{ label: string; value: string; color?: string }>;
}> = ({ items }) => (
  <div className="data-card-group">
    {items.map((item, i) => (
      <div key={i} className="data-card-group-item">
        <span className="item-label">{item.label}</span>
        <span className={`item-value ${item.color || ''}`}>{item.value}</span>
      </div>
    ))}
  </div>
);
Step 2: 更新 CSS (src/styles/retro-game.css)
/* 移除模块彩色边框 */
.game-module .ascii-border,
.game-module .ascii-border-side {
  display: none;  /* 或直接删除 GameFrame 组件 */
}
/* 新的数据卡片样式 */
.data-card {
  border: 1px solid var(--text-dim);
  border-radius: 2px;
  padding: 1rem 1.5rem;
  margin: 0.75rem 0;
  background: var(--retro-bg-secondary);
}
.data-card-title {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}
.data-card-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1.2;
}
.data-card-value.green { color: var(--retro-primary); }
.data-card-value.gold { color: var(--retro-gold); }
.data-card-value.blue { color: var(--retro-cyan); }
.data-card-value.red { color: var(--retro-hp); }
.data-card-narrative {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.75rem;
  font-style: italic;
}
/* 数据组样式 */
.data-card-group {
  display: flex;
  gap: 1rem;
  border: 1px solid var(--text-dim);
  padding: 0.75rem 1rem;
  margin: 0.75rem 0;
}
.data-card-group-item {
  flex: 1;
  text-align: center;
}
.item-label {
  display: block;
  font-size: 0.625rem;
  color: var(--text-dim);
  text-transform: uppercase;
}
.item-value {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-primary);
}
Step 3: 重构 DataPage.tsx
移除:
GameFrame 组件
ASCIIStatsBox 组件
StatsRow 组件
新增:
DataCard 组件
DataCardGroup 组件
TypewriterText 组件
Git模块示例:
<div className="git-module game-module">
  <pre className="module-title">{ASCII_GIT_GAME}</pre>
  <div className="data-cards-row">
    <DataCard
      title="TOTAL COMMITS"
      value={git.totalCommits.toLocaleString()}
      color="green"
      narrative={generateCommitNarrative(git.totalCommits)}
    />
    <DataCard
      title="LINES OF CODE"
      value={git.totalLines.toLocaleString()}
      color="blue"
      narrative={generateLinesNarrative(git.totalLines)}
    />
  </div>
  <DataCardGroup items={[
    { label: 'Streak', value: `${git.longestStreak}d`, color: 'gold' },
    { label: 'Peak', value: git.peakMonth, color: 'green' },
    { label: 'Top Repo', value: git.topRepos[0], color: 'blue' },
  ]} />
  <MonthlyChart data={monthlyChartData} maxValue={maxCommitValue} />
</div>
Step 4: 重构动画序列 (App.tsx)
// 新的模块动画函数
const animateDataCards = (moduleSelector: string, tl: gsap.core.Timeline) => {
  // 1. 标题入场
  tl.from(`${moduleSelector} .module-title`, {
    opacity: 0,
    y: -20,
    duration: 0.5
  });
  // 2. 卡片逐个入场
  tl.from(`${moduleSelector} .data-card`, {
    opacity: 0,
    y: 30,
    scale: 0.95,
    duration: 0.5,
    stagger: 0.3,  // 每个卡片间隔 0.3s
    ease: 'back.out(1.2)'
  });
  // 3. 数字计数动画
  tl.from(`${moduleSelector} .data-card-value`, {
    textContent: 0,
    duration: 1.2,
    snap: { textContent: 1 },
    stagger: 0.2,
    ease: 'power2.out'
  }, '-=0.8');
  // 4. 数据组入场
  tl.from(`${moduleSelector} .data-card-group`, {
    opacity: 0,
    y: 20,
    duration: 0.4
  }, '-=0.5');
  // 5. 停留阅读
  tl.to({}, { duration: 3 });
};
// 在主 timeline 中使用
replayTl
  .add(() => scrollToModule('.git-module'))
  .add(() => animateDataCards('.git-module', replayTl))
  // ... 其他模块
Step 5: 修复 MENU 显示
检查点:
showMenu 状态是否正确更新
CSS visibility 和 opacity 是否正确
菜单位置是否在可视区域内
修复:
// 确保 menu 在 summary-module 内部，且有正确的样式
<div className="game-menu" style={{
  opacity: showMenu ? 1 : 0,
  visibility: showMenu ? 'visible' : 'hidden',
  transition: 'opacity 0.5s ease',
  marginTop: '2rem',
  textAlign: 'center'
}}>
  <MenuItem hotkey="R" label="REPLAY" onClick={onReplay} />
  <MenuItem hotkey="S" label="SHARE" onClick={onShare} />
  <MenuItem hotkey="D" label="DOWNLOAD" onClick={onDownload} />
  <MenuItem hotkey="B" label="BACK" onClick={onBack} />
</div>
***预期效果
动画流程
Player Card (2s) - 淡入
GIT (5s)
命令打字: > getdata --github --commits --prs (1.2s)
COMMITS 卡片入场 + 数字计数 (1.5s)
LINES 卡片入场 + 数字计数 (1.5s)
Narrative 打字机 (各 1s)
次要数据组入场 (0.5s)
Monthly Chart 柱状图升起 (0.5s)
停留 (2s)
TEAM (4s) - 命令打字 + 卡片逐个入场
SKILLS (5s) - 命令打字 + 进度条街机动画填充 + 徽章弹入
DELIVERY (4s) - 命令打字 + 卡片入场
COPILOT (4s) - 命令打字 + 卡片入场
COMMUNITY (4s) - 命令打字 + 卡片入场
Summary (5s) - > compute --score --achievements + GAME CLEAR + 成就弹窗
Menu - 淡入显示
视觉效果
边框：统一灰色 var(--text-dim)
数据：彩色高亮 (绿/金/蓝/红)
标题：灰色小字
Narrative：斜体 + 打字机光标
***实现顺序
Phase 1: 创建新组件 (DataCard, TypewriterText)
Phase 2: 更新 CSS (移除彩色边框，新增卡片样式)
Phase 3: 重构 DataPage (使用新组件)
Phase 4: 更新动画序列 (卡片逐个入场)
Phase 5: 修复 Menu 显示
Phase 6: 测试和调优
