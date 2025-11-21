### 核心思路：Micro-Arcade（仅保留街机相关）

目标：街机点缀不喧宾，与数据同屏。保留 1 个 Pac-Man（Loading，可往返循环，出现在 Phase 2 原 redirect 卡片位置）；Mario 仅在主舞台（Phase 3 起）出现并扛住全局跑酷与 Git 叙事。Tech Stack 与 Flow 不做独立 Arcade 模块，如需数据只保留摘要行。

- 单色优先：主题强调色（Dark: `#3fb950` / `#d2a8ff`，Light: `#1a7f37`），禁止彩色乱入；Pac-Man Loading 单例可例外使用提供的彩色 SVG（相同卡片位置渲染，非全屏 overlay）。
- 动画节制：单段 2-4s 内收束；仅 Loading 允许轻循环。
- 数据为主：街机动作旁必须有 ASCII/图表文本。

---

### Phase 编排（与 Mario 同步）

**Phase 2: BUILD START (Loading, GitHub OAuth Returned)**  
- Action: Enter 后进入加载；完成 GitHub OAuth 返回后才出现 Pac-Man 动画。  
- Main: `Loading Assets...` + Pac-Man 迷你迷宫行，可往返循环直到进入 Build。  
  ```text
  FETCHING DATA:
  ╔════════════════╗
  ║ ᗧ · · · · · ᗣ ║   // 6 点位，Pac-Man 来回吃完
  ╚════════════════╝
  ```
  - 帧例：`ᗧ·····ᗣ` → … → `     ᗧᗣ    `，`yoyo: true, repeat: -1`，数据就绪后手动 set 到最后一帧停住。
-  彩色 Pac-Man 动画（新窗口授权成功返回时开启，和 redirect 卡片为 if/else 同位置展示）：  
  - 资源：使用你提供的 SVG（pacman + pellet/ghost），尺寸 96-144px，保持色块清晰。  
  - 触发：监听 `ghe-auth-complete` postMessage/BroadcastChannel 事件；收到成功后淡出 “Redirecting to GitHub…” 卡片，原地切换成 Pac-Man Loading 卡片，并行触发数据加载。失败/超时则保留 redirect 或提示重试。  
  - 交互：Pac-Man 在水平轨道左右往返（2-3s loop）；数据加载完成后淡出 Pac-Man 卡片，进入 Phase 3。  
  - 结构：`authStage === 'redirecting' ? <RedirectCard/> : <PacmanCard/>`，卡片高度/边距一致以避免跳动。  
  - CSS 动画（示意）：  
    ```css
    .auth-pacman-runner { width: 120px; animation: pac-walk 2.4s ease-in-out infinite; }
    @keyframes pac-walk { 0% { transform: translateX(-40px); } 50% { transform: translateX(40px); } 50.001% { transform: translateX(40px) scaleX(-1); } 100% { transform: translateX(-40px) scaleX(-1); } }
    ```

**Phase 3: THE RUN（数据流 + 跑酷，Mario 上场，替代纵向 ASCII 滚动条）**  
GSAP 主叙事，Mario 与滚动同步；Checkpoint 用模块 onEnter 驱动 anchor（示例：git 0.3，stack 0.55，flow 0.75，finale 0.95）。
```typescript
masterTl.to(window, { scrollTo: { y: 'max', autoKill: false }, duration: 8, ease: 'none' });
masterTl.eventCallback('onUpdate', () => {
  const p = masterTl.progress();
  const speed = p < 0.3 ? 'jog' : p < 0.8 ? 'run' : 'sprint';
  gsap.set('.mario', { left: `${p * 100}%`, attr: { 'data-speed': speed } });
});
```

- **Git Checkpoint（主戏，含蘑菇 + 双砖 + 填格）**  
  1) Mario 跳起顶小砖 `?`（scale 0.9 状态）→ 砖空，蘑菇露出。  
  2) 蘑菇滑出落地 0.4s，Mario 触发。  
  3) 变大闪烁：闪 3-4 帧（80-120ms/帧），放大到约 2.0x，颜色/描边轻闪。  
  4) Mario 保持大号再跳，顶更大的 `?` → 变 `G`，砖碎成 12-20 片。  
  5) 碎片上抛：沿抛物线飞向采样的活跃格子（按 commit 密度抽样），0.8-1.2s，落定脉冲 0.4s。  
  6) 显全网格：碎片落定后渐显完整 52×7 网格（基底已按数据填好，其余格子瞬时显现）。  
  7) 缩回：Mario 缩回正常尺寸（scale 1.0）继续跑。

- **Stack 摘要 Checkpoint（可选提示，不是模块）**  
  - 仅一行/两行水平条形摘要：  
    ```
    TypeScript [████████████████████] 68%
    Rust       [█████░░░░░░░░░░░░░░] 12%
    ```
  - Mario 顶第二个砖 `?` → `S` → “Stack Stats Updated” 文案淡出 1s。

- **Workflow 提示 Checkpoint（可选提示，不是模块）**  
  - 一行状态：`Tickets: ✅ 312 | 🔄 48 | 🔴 24`。  
  - Mario 轻跳过 ASCII 坑 `__`（标记 `BUG`，闪一帧后静止）。

**Phase 4: FINALE (Course Clear)**  
- Main: `BUILD SUCCESSFUL`。  
- Bottom: Mario 到 ~0.95，抓旗→滑下→走入 ASCII 城堡，旗帜显示 `2025`。  
- Timeline 结束后 Mario 静止，保持单色。

---

### 视觉与动画约束
- 单色：街机角色/碎片/蘑菇/砖块只用主题强调色，透明度 ≤ 0.9。  
- 短动效：单段 2-4s，模块间留 `'+=1'` 呼吸。  
- 字符/像素：Pac-Man 用 ASCII；Mario 用像素化 SVG (`shape-rendering: crisp-edges`)；砖/碎片可用简字符方块。  
- 背景轻量化：主舞台叠一层低对比度 ASCII 网格（.`/`░`等），平时静止；模块过渡时平移 5-8px 或 1.2x→1.0 缩放，300-500ms。

---

### 技术实现要点
- Pac-Man Loading：TextPlugin 帧动画，`repeat: -1, yoyo: true`，数据就绪后 set 最后一帧。  
- Mario Anchor：模块 onEnter 用 `call(() => moveMarioTo(anchor.git))`，缺模块时跳到下一个 anchor。  
- Git 填格：按上文 7 步执行；碎片 12-20 个，落定即与格子最终色一致，剩余格子一次显现。  
- 文字/图表：Git 保留 asciichart；Stack/Flow 仅用摘要行，避免新增 Arcade 场景。

---

### 剂量检查清单
- [ ] Loading：Pac-Man 迷你迷宫可往返循环，单色。  
- [ ] Git：蘑菇→放大→双砖→碎片上抛→全网格→缩回，单次 2-4s。  
- [ ] Stack/Flow：仅摘要行，触发对应 anchor 动作，不引入新 Arcade 元素。  
- [ ] 节奏：段内收束，段间留 1s 呼吸，背景轻量化微动。  
- [ ] 数据可读性：街机旁必有可读文本/图表。

---

### 总结
街机元素收敛为：迷你迷宫式 Pac-Man Loading；Mario 全程跑酷并用“蘑菇→双砖→碎片上抛”点亮 Git 网格；Stack/Flow 只做摘要提示；终章滑旗收束。全程单色、短动效，保证数据可读。 
