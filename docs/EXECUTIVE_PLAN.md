# ExecutiveDataPage 实现计划

面向需求：基于 `docs/EXECUTIVE.md`，新增 ExecutiveDataPage，沿用终端/ASCII 风格，图表使用 Recharts（静态展示），接入 GSAP 时间线，数据使用 mock。

## 目标与范围
- 新建 `src/pages/ExecutiveDataPage.tsx`，风格与 `DataPage` 一致（终端/ASCII），图表无需交互。
- 展示 3 维度 × 4 类别：Department / Vendor / Geographic × Basics / Delivery / Quality & Risk / Cost-Efficiency。
- `App.tsx` 通过模式开关（if/else）决定渲染 `DataPage` 或 `ExecutiveDataPage`，并把新模块纳入 GSAP 时间线和 auto-scroll。

## 数据与常量
- 新建 `src/constants/ascii-executive.ts`：定义模块 ASCII 标题/分隔符（Basics/Delivery/Quality/Cost/Overview）。
- 新建 `src/data/executiveMock.ts`：结构建议
  - `dimensions[]`: `id` ('department'|'vendor'|'geo'), `label`, `headcount`, `employeePct`, `contractorPct`, `categories`.
  - `categories.basics`: `headcount`, `employeePct`, `contractorPct`, `rolesBreakdown` (VP/AVP/Officer/SA), `locations[]`, `reports[]`（Direct Reports）。
  - `categories.delivery`: 指标数组（leadTime/velocity/commits/loc/deployFreq/prMergeTime），含 `avg/min/max/median`, `orgAvg`, `orgMedian`, `target`, `status`。
  - `categories.quality`: `busFactor` (avg/min/max/med/status), `codeQualityDist` (A/B/C/D count & pct), `sla`, `prSuccess`.
  - `categories.cost`: `employeeVsContractor` (per team & org summary), `aiAdoption` (monthly activeUsers/activeDays/loc/velocity/qualityGrade), `aiTargets`.
- 数值取自 `docs/EXECUTIVE.md` 示例，按维度微调保证差异。

## 组件拆分
- `ExecutiveDataPage` (forwardRef)
  - Props: `dimension`, `onDimensionChange`, `showMenu`, `onReplay`。
  - 包含模块 class：`.exec-header`, `.exec-basics`, `.exec-delivery`, `.exec-quality`, `.exec-cost`, `.exec-summary`（供 GSAP）。
- 子组件（可放 `src/components/exec/`）
  - `BasicsSection`: ASCII 头；Direct Reports 卡片（纯 CSS 条形）；职位/地点分布条。
  - `DeliverySection`: `ComposedChart` (Bar + ErrorBar/Customized min-max + ReferenceLine org avg/median/target)；stepAfter 折线表示 org baseline；颜色绿/黄/红。
  - `QualitySection`: Bus Factor 水平条 (BarChart + ReferenceLine 65/75 风险带)；Code Quality 堆叠条 (A/B/C/D)；SLA/PR 进度条（纯 CSS 或 RadialBar 简化为水平条）。
  - `CostSection`: Employee vs Contractor 分组条/表格；AI Adoption stepAfter 多指标折线（activeUsers/activeDays/loc/velocity/qualityGrade）+ 目标线；月度 snapshot ASCII 表格。
  - 公共小件：`ExecCard`（虚线框+像素阴影）、`ExecLegend`、`ExecTooltip`（终端样式）。
- 维度切换 Tabs：顶部按钮 `Department | Vendor | Geographic`，无复杂动画，切换数据。

## 样式主题
- 复用 `index.css` 变量；新增 `.exec-module` 虚线边框、像素阴影 `var(--shadow-glow)`、窄行高；Tooltip 终端黑/绿皮肤。
- 保留 ASCII 分隔线 `pre`，背景贴近终端；字体继续 `JetBrains Mono`。

## Recharts 配置（静态）
- 统一用 `ResponsiveContainer`。
- Delivery：`ComposedChart` `dataKey="team"`；`Bar dataKey="avg"`，`ErrorBar` 用 min/max；`ReferenceLine` orgAvg/orgMedian/target；`Line type="stepAfter"` org baseline。
- Quality：BusFactor `BarChart` + `ReferenceLine` 65/75；Code Quality `BarChart` stack A/B/C/D；SLA/PR 进度条可纯 CSS，减少图表复杂度。
- Cost：分组条显示 Employee% vs Contractor%；AI Adoption `LineChart` stepAfter，多 y 轴或归一化百分比，`ReferenceLine` target；点形状用小方块模拟像素。

## GSAP 时间线接入
- 在 `App.tsx` timeline 中新增模块序列（仿 `DataPage`）：
  - 显示 `.exec-header`（set visible → from opacity 0）。
  - 依次 `.exec-basics` → `.exec-delivery` → `.exec-quality` → `.exec-cost` → `.exec-summary`，每段 0.5–1s。
  - timeline `onUpdate` 继续绑定 `smoothAutoScroll`；模块 class 纳入查询列表。
  - Summary 结束时 `setShowMenu(true)`，复用 `[R]eplay` 控件。
- 模式开关：在 timeline 开头隐藏 Idle/Auth，`set`/`to` 显示 ExecutiveDataPage 容器；或沿用现有 auth 动画后进入 exec。

## 集成步骤
1. 新建 `src/constants/ascii-executive.ts`（ASCII banner）。
2. 新建 `src/data/executiveMock.ts`（mock 数据结构与示例）。
3. 新建 `src/pages/ExecutiveDataPage.tsx` 与子组件目录 `src/components/exec/`。
4. 添加 exec 样式（全局或局部 CSS）。
5. 修改 `App.tsx`：模式状态切换，接入 GSAP 时间线，auto-scroll 支持新模块 class。
6. 确认 Recharts 引入与静态渲染无交互依赖。
7. 本地 `pnpm dev` 手动验视，检查颜色编码/参考线/ASCII 对齐感。

## 验证要点
- 三维度切换正常，图表与数值同步。
- 颜色与风险带符合基线（绿/黄/红；65/75 BusFactor 等）。
- GSAP 序列无断点，auto-scroll 正常，菜单显示正常。
- 纯 mock 数据即可渲染，无外部依赖。
