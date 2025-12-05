Project 8-BIT: 开发者年度回顾页面设计规范 (V3.1)

1. 核心设计理念 (Core Philosophy)

本项目旨在创建一个复古、硬核、具有街机游戏质感的年度数据回顾页面。
核心美学定义为 "High-Fidelity Fake Terminal" (高保真伪终端)。

1.1 硬性约束 (Hard Constraints)

平台 (Platform): 仅限桌面端 (Desktop Only)。视口宽度强制锁定为 1024px 或 1280px 居中。完全放弃移动端适配。

布局 (Layout): 必须使用 CSS 盒子模型 (Flex/Grid) 进行布局，严禁使用纯字符串拼接来排版（以防止字符对齐崩溃）。

内容 (Content): 所有的可视化图表（进度条、趋势图）必须由 Unicode 字符 组成（如 █, ░, ▄），严禁使用 SVG 或 Canvas 绘图。

渲染 (Rendering):

严禁抗锯齿: 字体和图形必须锋利。使用 font-smoothing: none。

严禁圆角: border-radius 必须永远为 0。

减少辉光: 摒弃过度的 CRT 模糊辉光，追求 DOS 时代的清晰锐利感。仅在极少数高亮状态使用实色阴影。

无障碍 (A11y): 忽略。

2. 视觉架构：混合模式 (The Hybrid Model)

为了在保持复古感的同时降低开发难度，采用 "CSS Skeleton + ASCII Flesh" (CSS 骨架 + 字符血肉) 模式。

2.1 CSS 骨架 (The Skeleton)

容器的外框使用 CSS border 实现，模拟 DOS 界面。

标准容器: 使用 border: 4px double #color 模拟双线字符框 (╔═╗)。

标题嵌入: 使用绝对定位 (absolute) + 背景色遮罩，将标题嵌入边框线条中。

2.2 字符血肉 (The Flesh)

内容区域的数据展示必须 "字符化"。

进度条: [████████░░] 80%

迷你图 (Sparkline):  ▂▃▅█▇▄

热力图: 使用密度字符 (., :, +, #, @)。

3. 趣味性内容策略 (Narrative & Fun)

拒绝冰冷的数据罗列，数据必须具有 RPG 游戏 或 极客伙伴 的叙事口吻。

3.1 模块设计详解

A. 玩家状态卡 (Player Status)

视觉: 经典的 RPG 角色面板。

趣味文案:

Level: 根据代码行数计算 (e.g., LV.42 ARCH-MAGE).

Status: 随机显示 (e.g., Compiling..., Caffeinated, Debugging Production).

HP/MP: HP 对应 "剩余假期天数" 或 "距 Deadline 天数"；MP 对应 "本周 Coffee 摄入量"。

B. 代码贡献 (Git Battle Log)

数据: Commits, PRs, Lines.

趣味文案:

如果提交多: "KEYBOARD ON FIRE! You typed enough to write Shakespeare twice."

如果提交少: "TACTICAL PRECISION. Quality over quantity, right?"

Glitch: 数字在加载时应显示为乱码 0xFA3... 然后解密。

C. 团队羁绊 (Co-op Mode)

核心创意: 找出互动最多的同事。

趣味文案:

"WOW! @sarah_dev is your CODE BUDDY! She reviewed 30 of your PRs."

"Support Class: You saved @mike_junior 15 times in Code Reviews."

展示一个简单的 ASCII 握手图标或连线图。

D. 技能树 (Skill Matrix)

数据: 语言与框架分布。

趣味文案:

"TypeScript [S-TIER]: You dream in strict types."

"Rust [LOADING...]: Borrow checker still fighting you?"

升级建议: "SYSTEM ADVICE: Equip [WebGPU] to gain +10 INT."

E. 交付 (Quest Log)

数据: Jira/Linear 完成数。

趣味文案:

"BUGS SQUASHED: 87. It's a massacre."

"CRITICAL HIT: Deployed to Prod on Friday with 0 downtime."

4. 技术实现规范 (Implementation Specs)

4.1 字体与渲染

强制使用像素字体，关闭平滑。

/* global.css */
body {
  font-family: "JetBrains Mono", "Press Start 2P", monospace;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  image-rendering: pixelated; /* 针对图片资源 */
  background-color: #0f0f23;
  color: #e2e8f0;
}

/* 禁止任何 transition 的默认平滑，强制使用 step */
.step-animation {
  transition-timing-function: steps(5, end);
}


4.2 核心组件代码 (React)

RetroCard (骨架):

const RetroCard = ({ title, children, color = "border-green-500" }) => (
  <div className={`relative border-4 border-double ${color} p-6 my-8 bg-[#0f0f23]`}>
    {/* 标题遮罩技术 */}
    <div className="absolute -top-3 left-6 px-2 bg-[#0f0f23] text-sm font-bold tracking-widest uppercase text-gray-400">
      [{title}]
    </div>
    {children}
  </div>
);


ASCII Utils (血肉):

// 进度条生成器
export const generateProgressBar = (percent: number, width: number = 20): string => {
  const fill = Math.floor((percent / 100) * width);
  const empty = width - fill;
  return '█'.repeat(fill) + '░'.repeat(empty);
};

// Sparkline 生成器
export const generateSparkline = (data: number[]): string => {
  const CHARS = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const max = Math.max(...data);
  return data.map(n => CHARS[Math.floor((n / max) * 7)]).join('');
};


5. 动画编排 (Animation Orchestration)

使用 GSAP Timeline 进行精准的过场控制。动画风格必须是 "机械的"、"顿挫的"。

5.1 动画阶段 (Phases)

Phase 0: Boot (0s - 1s)

屏幕全黑，只有左上角光标闪烁。

显示 INITIALIZING BIOS... OK。

Phase 1: Terminal Input (Per Module)

使用打字机效果输入命令：> getdata --user @ziyu。

光标 _ 快速闪烁。

关键: 必须有打字声效 (可选) 或极快的字符输入感 (Duration: 0.05s/char)。

Phase 2: Decryption (Data Reveal)

模块框架 RetroCard 瞬间出现 (Opacity 0 -> 1，无 Fade 效果)。

Glitch Effect: 关键数据（如 Commit 数）最初显示为乱码，在 1.5s 内逐个字符变成了真实数字。

Phase 3: Filling (Bars & Charts)

Step Easing: 进度条不是平滑增长，而是像格子一样一格格跳动。

ease: "steps(10)"。

5.2 GSAP 代码范例

import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

// 数字解密动画 Hook
const useDecryption = (targetRef, finalValue) => {
  useEffect(() => {
    const chars = "X#@!&%01";
    gsap.to(targetRef.current, {
      duration: 1.5,
      text: {
        value: finalValue,
        delimiter: "", 
        padSpace: true // 保持宽度一致
      },
      onUpdate: function() {
        // 在到达最终值之前，随机替换部分字符制造 Glitch 感
        if (this.progress() < 1) {
           // ... 随机替换逻辑
        }
      },
      ease: "power2.inOut"
    });
  }, [finalValue]);
};

// 进度条阶梯动画
const animateBar = (percent) => {
  gsap.to(barObj, {
    val: percent,
    duration: 1.2,
    ease: "steps(12)", // 核心：阶梯式动画
    onUpdate: () => setDisplayPercent(barObj.val)
  });
};
6. 资产与配色参考 (Assets)
6.1 配色表 (Palette)

使用高对比度的 CGA/EGA 风格配色。

用途	色值 (Hex)	Tailwind Class	说明
Background	#0f0f23	bg-[#0f0f23]	深空蓝黑，比纯黑更有质感
Primary	#00ff41	text-green-500	经典的终端绿
Secondary	#facc15	text-yellow-400	警告/高亮/Legendary
Accent	#3b82f6	text-blue-500	链接/信息/Rare
Danger	#ef4444	text-red-500	错误/Bug/Critical
Dim	#4b5563	text-gray-600	未激活/边框
6.2 字体堆栈

'JetBrains Mono' (首选，开发者最熟悉)

'Press Start 2P' (备选，仅用于大标题，正文使用会导致可读性下降)

monospace (系统回退)

7. 总结 (Summary)
本项目不是在做一个网页，而是在模拟一个 80 年代的终端程序。

不要 平滑的过渡。

不要 模糊的阴影。

不要 响应式布局。

要 乱码、光标、双线框、以及像 "Your code is compiling..." 这样充满极客味的文案。

# DataPage 复古游戏年度回顾设计稿（Markdown 版）

本稿将现有方案整理为清晰的 Markdown 结构，融合 `GAMEBOY.md` 里的关键内容（数据源、样式、成就、GSAP/ScrollTrigger、卡片式数字等），便于落地与评审。整体保持「High-Fidelity Fake Terminal」：高清伪装字符终端 + 像素块感 + 街机节奏。

## 1. 目标与硬约束
- 主题：桌面端固定宽度 1024/1280 居中，复古终端 + 像素/街机混合。
- 字符图优先：进度条/图表只能用字符（█ ░ ▂▃▄▅▆▇），禁用 Canvas/SVG 曲线/饼图。
- 渲染：无圆角（border-radius=0），无抗锯齿（font-smoothing none），禁用模糊阴影。
- 尺寸：所有间距/宽高/字号使用统一 Base Unit 的整数倍（如 8px/0.5rem），禁止亚像素。
- 动效：全部阶梯感（`steps()`），动画顿挫，不要默认平滑缓动。

## 2. 数据源与适配器
| 模块 | 数据来源 | 适配器/职责 |
| --- | --- | --- |
| Player | 本地配置/汇总数据 |（无专用适配器，直接 props） |
| Git | GitHub stats (commits/PRs/lines/月度) | `GitAdapter` -> `toStatsBox`、`toPullRequestStats`、`toMonthlyChart` |
| Team | GitHub/内部协作统计 | `TeamAdapter` -> `toCollaboratorsList` |
| Skills | 语言/框架/学习进度 | `SkillsAdapter` -> `toLanguageBars`、`toFrameworkStats`、`toLevelingUp` |
| Delivery | Jira/Linear stories、bugs、projects |（可复用 Skills 适配结构或新增 DeliveryAdapter） |
| Copilot | Copilot suggestions/acceptance/time saved | `CopilotAdapter` -> `toCompanionStats` |
| Community | 活动、Bravos | `CommunityAdapter` -> `toActivitiesList` |
| Summary/Achievements | 汇总得分 + 成就队列 | 数据整合层生成分数与成就列表 |

数据流：API/文件 → 适配器归一化 → UI 组件（DataCard/DataCardGroup/Charts/Achievements）。

## 3. 视觉系统（Style）
- 字体：`JetBrains Mono` / `Press Start 2P` / monospace；`-webkit-font-smoothing: none; image-rendering: pixelated;`
- 调色：`retro-game.css` 变量 `--retro-bg` `--retro-primary` `--retro-gold` `--retro-legendary/epic/rare/common`，数据高亮用绿/金/蓝/红。
- 布局：CSS Skeleton + ASCII Flesh。边框用 2–4px double/solid 直角线模拟 `╔═╗`，标题嵌入边框；容器用 Flex/Grid，不拼字符串排版。
- 纹理：空槽 `░`、填充 `█`；禁用圆角/阴影柔化。
- 组件基线：`DataCard`/`DataCardGroup`（灰边+彩色数字+叙事打字机），MonthlyChart/进度条用字符。

## 4. 组件与版式
- **DataCard**：大数字卡片，彩色数值 (`.green/.gold/.blue/.red`)，可选 narrative（Typewriter）。
- **DataCardGroup**：次要三栏/多栏小数据组，居中对齐。
- **TerminalCommand**：模块前缀命令打字机（替代全屏 Loading），完成后显示数据。
- **TypewriterText**：GSAP TextPlugin，命令与叙事文本复用。
- **AchievementUnlock**：弹窗队列，稀有度配色/闪烁。
- **LoadingTransition**（可选）：仅用于章节过场的像素加载条。

## 5. 交互/信息流（命令式入口）
| 模块 | 命令示例 |
| --- | --- |
| GIT | `> getdata --github --commits --prs` |
| TEAM | `> getdata --collaborators` |
| SKILLS | `> analyze --languages --frameworks` |
| DELIVERY | `> getdata --jira --stories --bugs` |
| COPILOT | `> getdata --copilot --suggestions` |
| COMMUNITY | `> getdata --community --events` |
| SUMMARY | `> compute --score --achievements` |

命令打完后：卡片淡入 → 数字计数/解密 → 叙事打字机 → 图表/进度条填充。

## 6. 动画策略（GSAP 优先，ScrollTrigger 仅备选）
- 推荐：**街机式 GSAP Timeline** 串联章节，沉浸自动播放；可选跳过键。ScrollTrigger 仅作为回看补充，不作为主节奏驱动。
- Timeline 分章：Player → (过场) → Git + Team → (过场) → Skills + Delivery + Copilot → (过场) → Community → Flash → Summary + Achievements → Menu。
- 核心效果：
  - 命令打字：TextPlugin，30–40ms/字。
  - 数字解密：随机字符抖动到真实值 < 0.6s。
  - 进度/柱状：`steps()` 阶梯填充/升起。
  - 成就：边框绘制 → 图标弹入 → 文案打字 → 稀有度闪烁 → 队列播放。

## 7. Summary & 成就
- Summary 面板：最终得分卡 + Power Growth 提示 + Replay/Share/Download/Back 菜单。
- 成就卡栅格：Legendary/Epic/Rare/Common 配色；图标 + 名称 + 稀有度。
- 成就弹窗动画（队列）：边框扩散 → 图标弹入 → 打字机 → 稀有度闪烁 → 停留 → 下一个。

## 8. 样式落地要点（retro-game.css）
- 变量：背景、主色、金色、稀有度色、HP/MP/EXP 颜色。
- 卡片：灰色边框 + 深色背景；标题大写灰字；数字用等宽大号；叙事斜体。
- 数据组：单线灰框 + 等宽数字；间距/gap 使用 Base Unit。
- 禁用旧的大彩色 GameFrame/ASCII 边框，统一灰框卡片式数字。

## 9. 开发阶段（对接现有文件）
1) 组件：`DataCard`/`DataCardGroup`/`TypewriterText`/`AchievementUnlock`/`TerminalCommand`。
2) 样式：新增 `src/styles/retro-game.css`，在 `src/index.css` 引入；落实变量、卡片、进度条、成就弹窗。
3) 数据：按模块完成适配器输出，确保字段齐备（commits/lines/streak/PR/Reviews/月度、skills bars、projects、copilot stats、community events、achievements）。
4) 页面：重写 `DataPage.tsx` 使用新组件，去除 GameFrame/ASCIIStatsBox/StatsRow；MonthlyChart 字符化。
5) 动画：`App.tsx` 统一 `animateDataCards`/`animateSkillBars`/`achievementUnlockSequence` 等；主 timeline 串联章节；ScrollTrigger 非必需。
6) 菜单：`showMenu` 控制 `opacity/visibility`，置于 summary 内，淡入。
7) 测试：色板/间距整倍数，动画节奏可读，命令前缀 & 打字机无跳帧，成就队列按顺序播放。

## 10. 快速复用片段（摘自 GAMEBOY）
- GSAP Timeline 串联示例：章节化 `.add(...)`，LoadingTransition 仅章节间；AchievementSequence 末尾播放。
- LoadingTransition 伪代码：显示 overlay → message 打字 → progress `steps()` 分段 → 停留 → 淡出。
- DataCard 样式：灰边框、等宽大号数字、彩色值、叙事斜体。
- Skill Bars：`ease: steps(20+)`，徽章 `back.out` 弹入。
- 命令型入口：每模块开头打字命令，完成后显示卡片/图表。

> 交付标准：文件 <500 行；英文代码/注释，英文文案 OK；保持整倍数尺寸、无圆角/模糊、字符化图表、GSAP 阶梯动画、成就弹窗与数据卡片并行可复用。

