# Executive Dashboard: 设计方案

**面向:** CIO及其Direct Reports (Engineering Executives)
**目的:** 规定给Executives呈现什么数据，如何呈现，以及每部分数据的目的
**架构:** 三个维度 (Department / Vendor / Geographic)，每个维度4个类别 (Basics / Delivery / Quality & Risk / Cost-Efficiency)
**更新:** 2025年11月28日

## 📊 核心架构

### 三维度四类别矩阵

每个维度都展示相同的四个数据类别，形成对称的数据结构：

| 维度 | Basics | Delivery | Quality & Risk | Cost-Efficiency |
| :--- | :--- | :--- | :--- | :--- |
| **Department** | 规模、职位、地点、FTE占比 | Lead Time、Velocity、人均产出、部署频率 | Bus Factor、代码质量Grade、SLA达成率、PR成功率 | Employee vs Contractor性价比、AI采用度 |
| **Vendor** | 规模、岗位、部门、地点、集中度 | Lead Time、Velocity、人均产出、代码活动 | 代码质量Grade、Bus Factor、SLA达成率、MTTR | 人均产出排名、AI采用度对标 |
| **Geographic** | 规模、部门分布、供应商分布、时区 | Lead Time、Velocity、人均产出、时区延迟 | 代码质量Grade、Bus Factor、SLA达成率、PR质量 | Employee占比、AI采用度分布 |

-----

## 🏢 维度1: Department (按直属部门)

### 1.1 Basics - 人力规模与结构 (按Report To层级)

**呈现数据:**

  * 选定人物的直属团队总人数 | Employee占比 | Contractor占比
  * 职位分布 (VP/ AVP / Officer / SA 占比)
  * 地点分布

**如何呈现:**

  * 纵向层级结构（最高级管理者在顶部，向下展示直属报告）
  * 每个人物显示为一个卡片，包含其团队的数据
  * 只展开一层级的直属报告，避免卡片过多
  * 可选择不同的顶部人物，动态切换视图

**示例 ASCII 展示:**

```text
               SELECT: CTO (John Smith)
-----------------------------------------------------------------------------------------
|                                                                                       |
|   CTO: John Smith                                                                     |
|   Total Head: 95   |  Employee%: 75% (71 FTE)   |  Contractor: 25% (24 vendor)        |
|   Job Title: VP/AVP 15%(14)  Officer 35%(33)  SA 50%(48)                              |
|   Employee vs Contractor: [██████████] 75% (71) vs 25% (24)                           |
|                                                                                       |
-----------------------------------------------------------------------------------------
            |                       |                       |
            v                       v                       v
-------------------------   -------------------------   -------------------------
| VP Engineering:       |   | VP Product:           |   | VP Infra & DevOps:    |
| Alice Chen (45 people)|   | Bob Wilson (32 people)|   | Carol Martinez (18 ppl)|
|-----------------------|   |-----------------------|   |-----------------------|
| Total: 45             |   | Total: 32             |   | Total: 18             |
| Employee: 78% (35)    |   | Employee: 65% (21)    |   | Employee: 89% (16)    |
| Contractor: 22% (10)  |   | Contractor: 35% (11)  |   | Contractor: 11% (2)   |
|-----------------------|   |-----------------------|   |-----------------------|
| VP/AVP  ██ 15%(7)     |   | VP/AVP  █ 8%(3)       |   | VP/AVP  ██ 22%(4)     |
| Officer ████ 40%(18)  |   | Officer ███ 32%(10)   |   | Officer ████ 39%(7)   |
| SA      ████ 45%(20)  |   | SA      ██████ 60%(19)|   | SA      ████ 39%(7)   |
-------------------------   -------------------------   -------------------------
```

**优势:**

  * ✅ **避免卡片过多:** 只显示一级 Direct Reports，不展开全部层级
  * ✅ **灵活选择:** 可在输入框选择任意人物，动态展示其团队结构
  * ✅ **清晰层级:** 树状结构直观展示汇报关系
  * ✅ **数据完整:** 每个团队都有对应的规模、占比、职位分布数据

**目的:**

  * 快速了解部门规模和人力结构
  * 评估部门是否存在职位失衡
  * 识别跨地区部门分布

-----

### 1.2 Delivery - 部门交付效能与产出

**呈现数据:**

  * 平均Lead Time (天) | Min/Max/Median/Avg | 与全组织平均对比
  * 部署频率 (次/月) | 目标≥4次
  * 人均Velocity (SP/人/月) | Min/Max/Median/Avg | **关键对标指标**
  * 人均代码贡献 (Commits/人/月) | Min/Max/Median/Avg
  * 人均代码量 (LOC/人/月) | Min/Max/Median/Avg
  * 平均PR合并时间 (小时)

**如何呈现:**

  * 柱状图 (按部门并排对比，带Min/Max/Median/Avg误差条)
  * 参考线 (全组织平均值和中位数)
  * 可交互卡片 (展示具体数值和对标结果)
  * 色彩编码 (绿=超标，黄=达标，红=落后)

**Benchmark Decision Matrix (对标决策矩阵):**

| Metric | Green (🟢) | Yellow (🟡) | Red (🔴) |
| :--- | :--- | :--- | :--- |
| **Velocity** | ≥ Avg+25% | Avg ±15% | \< Avg-25% |
| **Lead Time** | ≤ Target | Target \~ Avg | \> Avg+15% |
| **Code Commits** | ≥ Avg+25% | Avg ±15% | \< Avg-25% |

**目的:**

  * **对标各部门人均产出能力** (核心指标)
  * 判断各部门交付速度是否达标
  * 识别产能领先/滞后的部门
  * 评估部门产能稳定性和均衡性

**Example ASCII Display - Lead Time Benchmark (by Direct Reports):**

```text
========================================================================================
||                    Lead Time Benchmark (days)                                      ||
||        Org Avg: 8.5d  |  Median: 7.8d  |  Target: ≤7d                          ||
========================================================================================

 CTO: John Smith (Total: 95 people)

 |  VP Eng                     |  VP Product                 |  VP Infra
 |  Days (8.2d avg) 🟡         |  Days (8.8d avg) 🟡         |  Days (6.5d avg) 🟢
 |                             |                             |
 |  Max:12.5d                  |  Max:14.2d                  |  Max:9.5d
 |     ^                       |     ^                       |     ^
 |     |                       |     |                       |     |
 |  10 -                       |  10 -                       |  10 -
 |     |                       |     |                       |     |
 |   8 -    ███    = Avg       |   8 -    ███    = Avg       |   8 -    ||
 |     |     ||    8.5d        |     |     ||    8.5d        |     |    || x Median
 |   6 -     ||                |   6 -     ||                |   6 -    || 6.1d
 |     |     || (Org Avg)      |     |     || (Org Avg)      |     |    ||
 |   4 -     ||                |   4 -     ||                |   4 -    ||
 |     |     || 7.8d Median    |     |     || 7.8d Median    |     |    ||
 |   2 -     || = (Org)        |   2 -     || = (Org)        |   2 -    || = Org Target
 |     |     L_                |     |     L_                |     |    L_
 |   0 -                       |   0 -                       |   0 -
 |      Min:4.2d               |      Min:5.1d               |      Min:2.8d
 |      Med:7.9d               |      Med:8.5d               |      Med:6.1d
 |      OK- (meets tolerance)  |      OK- (meets tolerance)  |      Excellent

----------------------------------------------------------------------------------------
 Benchmark Standard:
 🟢 Green: ≤7d     |    🟡 Yellow: 7~8.5d     |    🔴 Red: >8.5d
----------------------------------------------------------------------------------------
```

**Velocity Benchmark Analysis (SP/person/month):**

```text
========================================================================================
||         Velocity Benchmark Analysis (SP/person/month)                              ||
||              Org Avg: 52.0 SP  |  Median: 50.5 SP                                  ||
========================================================================================

 CTO: John Smith (Total: 95 people)
 |-- VP Eng (Alice Chen)       |-- VP Product (Bob Wilson)   |-- VP Infra (Carol Martinez)
 |   55.2 SP                   |   48.3 SP                   |   57.1 SP

 +-----------------------+     +-----------------------+     +-----------------------+
 | █████████████ 55.2    |     | ███████████   48.3    |     | ██████████████ 57.1   |
 | ^ 65.0 (Max)          |     | ^ 62.0 (Max)          |     | ^ 71.5 (Max)          |
 | x 53.5 (Median)       |     | x 47.0 (Median)       |     | x 55.2 (Median)       |
 | L 42.0 (Min)          |     | L 35.0 (Min)          |     | L 44.0 (Min)          |
 +-----------------------+     +-----------------------+     +-----------------------+
        🟢 +6%                        🟡 -7%                        🟢 +10%
     (vs Org Avg)                  (vs Org Avg)                  (vs Org Avg)

 -----+ Org Average: 52.0 SP -----------------------------------------------------------
 -----= Org Median : 50.5 SP -----------------------------------------------------------

 Detailed Data Cards:
 +---------------------------+ +---------------------------+ +---------------------------+
 | VP Engineering 🟢         | | VP Product 🟡             | | VP Infra 🟢               |
 |---------------------------| |---------------------------| |---------------------------|
 | Avg: 55.2 SP              | | Avg: 48.3 SP              | | Avg: 57.1 SP              |
 | Min: 42.0 SP              | | Min: 35.0 SP              | | Min: 44.0 SP              |
 | Max: 65.0 SP              | | Max: 62.0 SP              | | Max: 71.5 SP              |
 | Med: 53.5 SP              | | Med: 47.0 SP              | | Med: 55.2 SP              |
 |                           | |                           | |                           |
 | vs Org: +6%               | | vs Org: -7%               | | vs Org: +10%              |
 | Status: Exceeding         | | Status: Meeting           | | Status: Exceeding         |
 | Action: Maintain          | | Action: Optimize          | | Action: Benchmark         |
 +---------------------------+ +---------------------------+ +---------------------------+

 Legend: ██ = Avg | ^ = Max | L = Min | x = Median | = = Reference Line
 Status: 🟢 Green (≥+25%) | 🟡 Yellow (±15%) | 🔴 Red (<-25%)
```

-----

### 1.3 Quality & Risk - 部门质量与风险

**呈现数据:**

  * Bus Factor (%) | Min/Max/Median/Avg | 风险等级标记 (\>70%=低风险)
  * 代码质量Grade | Min/Max/Median/Avg | 与全组织平均对比 | A/B/C/D分布
  * SLA达成率 (%) | 是否达到95%目标 | 月度趋势
  * PR成功率 (%) | 是否≥95% | 与全组织对比

**How to Display:**

  * Bar chart (Bus Factor by direct reports, with risk levels)
  * Dashboard (Code Quality Grade display, A/B/C/D distribution)
  * Progress bar (SLA achievement, highlighting target attainment)

**Example ASCII Display - Quality & Risk by Direct Reports:**

**Bus Factor Risk Analysis (%)**
**What it means:** Bus Factor = % of key knowledge held by the top person(s) in a team.

  * 74% means: If the top expert leaves, we lose 74% of critical knowledge for that domain.
  * Higher % = Riskier (single-point dependency) | Lower % = More distributed knowledge.

```text
========================================================================================
||            Bus Factor: Key Knowledge Distribution Risk (%)                         ||
||            Org Avg: 62%  |  Healthy: <65%  |  High Risk: >75%                      ||
========================================================================================

 CTO: John Smith (Total: 95 people)

 |  VP Eng                     |  VP Product                 |  VP Infra
 |  74%                        |  58%                        |  68%
 |  (Key person: Alice)        |  (Distributed)              |  (Key person: Carol)
 |                             |                             |
 |  [████████████] 74%         |  [█████████   ] 58%         |  [███████████ ] 68%
 |  (At Risk)                  |  (Healthy)                  |  (Caution)
 |                             |                             |
 |-----------------------------|-----------------------------|---------------------------
 |  Min: 65%                   |  Min: 42%                   |  Min: 55%
 |  Max: 82%                   |  Max: 71%                   |  Max: 78%
 |  Med: 73%                   |  Med: 59%                   |  Med: 67%
 |  Avg: 74%                   |  Avg: 58%                   |  Avg: 68%
 |-----------------------------|-----------------------------|---------------------------

 Risk Levels: Healthy (<65%) ▒▒▒ | Caution (65-75%) ▓▓▓ | At Risk (>75%) ███
```

**Code Quality Grade Dashboard:**

```text
========================================================================================
||              Code Quality Grade Distribution (A/B/C/D)                             ||
||                   Org Avg: B  |  Full Year 2025                                    ||
========================================================================================

 VP Engineering (Alice Chen)    VP Product (Bob Wilson)        VP Infra (Carol Martinez)
 45 people                      32 people                      18 people

 +---------------------------+  +---------------------------+  +---------------------------+
 | A  ██████ 55% (25)        |  | A  ███ 25% (8)            |  | A  ████████ 67% (12)      |
 | B  ████ 35% (16)          |  | B  ██████ 50% (16)        |  | B  ███ 28% (5)            |
 | C  █ 8% (4)               |  | C  ██ 20% (6)             |  | C  | 5% (1)               |
 | D  - 2% (0)               |  | D  | 5% (2)               |  | D  - 0% (0)               |
 +---------------------------+  +---------------------------+  +---------------------------+
      A+B: 90%                       A+B: 75%                       A+B: 95%
```

### SLA Achievement Rate (%)

```text
========================================================================================
||            SLA Achievement Rate (%)  -  Full Year 2025                             ||
||            Target: ≥95%   |   Org Avg: 93.5%                                       ||
========================================================================================

 VP Engineering             VP Product                 VP Infra & DevOps          Org Average
 96%                        91%                        94%                        93.5%

 [████████████] 96%         [██████████  ] 91%         [███████████ ] 94%         [███████████ ] 93.5%
 (Target: PASS)             (Target: MISS)             (Target: NEAR)             (Target: MISS)

 +-----------------------+  +-----------------------+  +-----------------------+  +-----------------------+
 | VP Engineering        |  | VP Product            |  | VP Infra              |  | Organization          |
 |-----------------------|  |-----------------------|  |-----------------------|  |-----------------------|
 | Rate: 96%             |  | Rate: 91%             |  | Rate: 94%             |  | Rate: 93.5%           |
 | vs Target: +1%        |  | vs Target: -4%        |  | vs Target: -1%        |  | vs Target: -1.5%      |
 | vs Org: +2.5%         |  | vs Org: -2.5%         |  | vs Org: +0.5%         |  | Baseline              |
 +-----------------------+  +-----------------------+  +-----------------------+  +-----------------------+
```

### PR Success Rate (%)

```text
========================================================================================
||                  Pull Request Success Rate (%)                                     ||
||    Target: ≥95%   |   Success = Merged in <24h without rework                      ||
========================================================================================

 VP Engineering             VP Product                 VP Infra & DevOps          Org Average
 97% (EXCELLENT)            89% (NEEDS WORK)           93% (ACCEPTABLE)           92.8%

 [████████████] 97%         [██████████  ] 89%         [███████████ ] 93%         [███████████ ] 92.8%

 +-----------------------+  +-----------------------+  +-----------------------+  +-----------------------+
 | VP Engineering        |  | VP Product            |  | VP Infra              |  | Organization          |
 |-----------------------|  |-----------------------|  |-----------------------|  |-----------------------|
 | Success: 97%          |  | Success: 89%          |  | Success: 93%          |  | Success: 92.8%        |
 | Rework Rate: 2%       |  | Rework Rate: 8%       |  | Rework Rate: 5%       |  | Rework Rate: 5%       |
 | Avg Cycle: 18h        |  | Avg Cycle: 32h        |  | Avg Cycle: 24h        |  | Avg Cycle: 25h        |
 | vs Org: +4%           |  | vs Org: -4%           |  | vs Org: +0%           |  | Baseline              |
 | Status: Passing       |  | Status: Below         |  | Status: Meeting       |  | Status: Close         |
 | Action: Share         |  | Action: Support       |  | Action: Monitor       |  | Action: Improve       |
 |         Best          |  |         Training      |  |                       |  |         Review        |
 |         Practice      |  |                       |  |                       |  |         Process       |
 +-----------------------+  +-----------------------+  +-----------------------+  +-----------------------+
```

### Benchmark Decision Matrix for Quality & Risk:

| Metric | LOW RISK (Good) | MEDIUM RISK (Caution) | HIGH RISK (Action Needed) |
| :--- | :--- | :--- | :--- |
| **Bus Factor** | \>70% | 50-70% | \<50% |
| **Code Quality** | A/B 80%+ | A/B 65-80% | A/B \<65% |
| **SLA Achievement** | ≥95% | 90-95% | \<90% |
| **PR Success** | ≥95% | 90-95% | \<90% |

**目的:**

  * 识别关键人员依赖风险 (Bus Factor)
  * 评估部门的代码质量水平
  * 识别SLA承诺缺陷/可靠性问题的部门
  * 判断部门是否需要质量改进支持

-----

## 1.4 Cost-Efficiency - 部门成本效益与AI采用

**呈现数据:**

  * **Employee vs Contractor 性价比对标**
      * Employee平均Velocity/人/月 vs Contractor
      * Employee代码质量Grade vs Contractor
      * 人数占比分布 (Employee% vs Contractor%)
  * **Copilot AI采用情况**
      * 活跃度 (%) | 与全组织平均对比 | 目标≥80%
      * AI建议采纳率 (%) | 目标60-75%
      * 月度采用趋势

**How to Display:**

  * Comparison cards (Employee vs Contractor side-by-side by direct reports)
  * Progress bars (AI adoption activation rate)
  * Summary table (key metrics overview)

**Example ASCII Display - Cost-Efficiency by Direct Reports:**

**Employee vs Contractor Summary**

| Team | Total | Employee | Contractor | Employee% |
| :--- | :--- | :--- | :--- | :--- |
| VP Engineering | 45 | 35 | 10 | 78% |
| VP Product | 32 | 21 | 11 | 65% |
| VP Infra | 18 | 16 | 2 | 89% |
| **Organization** | **95** | **72** | **23** | **76%** |

-----

### AI Adoption (Copilot) - Full Year 2025: Monthly Trends

**Organization Level - Full Year Trends (all 5 metrics, Jan-Dec)**

```text
========================================================================================
||      Copilot AI Adoption - Organization 2025 (Org Avg: 77 users, 81.7% active)     ||
========================================================================================

 Active Users    45 -|         __--__
 (target: 77)    35 -|      __-      -__
                 25 -|   __-            -__
                 15 -|__-                  -__
                     L________________________
                      Jan-Feb-Mar-Apr-May-Jun-Jul-Aug-Sep-Oct-Nov-Dec

 Active Days     26 -|            _______
 (per month)     20 -|        ___-       -___
                 14 -|    ___-               -___
                  8 -|___-                       -___
                     L_______________________________
                      Jan-Feb-Mar-Apr-May-Jun-Jul-Aug-Sep-Oct-Nov-Dec

 Code Lines    1350 -|              _______
 per user      1000 -|          ___-       -___
                650 -|      ___-               -___
                300 -|_____-                       -___
                     L_________________________________
                      Jan-Feb-Mar-Apr-May-Jun-Jul-Aug-Sep-Oct-Nov-Dec

 Velocity        62 -|              _____
 (SP/month)      52 -|          ___-     -___
                 42 -|      ___-             -___
                 32 -|_____-                     -___
                     L_______________________________
                      Jan-Feb-Mar-Apr-May-Jun-Jul-Aug-Sep-Oct-Nov-Dec

 Quality          A -|              _____
 Grade            B -|          ___-     -___
                 B- -|      ___-             -___
                  C -|_____-                     -___
                     L_______________________________
                      Jan-Feb-Mar-Apr-May-Jun-Jul-Aug-Sep-Oct-Nov-Dec
```

**Analysis:** Jan-Mar slow ramp-up (onboarding phase) -\> Apr-Jun acceleration (adoption tipping) -\> Jul-Sep peak adoption & productivity gains -\> Oct-Dec sustained with seasonal stability

-----

### VP Comparison Charts - 5 Key Metrics (3 Teams vs Org Average)

```text
========================================================================================
||               Active Users Adoption - Monthly Progression                          ||
========================================================================================
       37 -|      /---------------\
 (target) 30 -|     /  VP Engineering  \----------\
       24 -|   /--\                    \__        |  Org Avg |
       16 -|  /    \  VP Product          \----|  | (25.7)   |
      ... -|/ \  /                        /    |  |          |
        8 -|---+ - - -                   / - - - VP Infra (best adoption)
           L________________________________________________
             Jan—Feb—Mar—Apr—May—Jun—Jul—Aug—Sep—Oct—Nov—Dec

 Peak Values (Dec): VP Eng 37/45 (82%) | VP Product 24/32 (75%) | VP Infra 16/18 (89%)

========================================================================================
||               Active Days Utilization - Monthly Progression                        ||
========================================================================================
       30 -|             /------------------------\
           | - - - - - Org Avg                     \
       24 -|   /----\  / (23.0 days)       |  |     \ VP Infra (highest engagement)
           |  /     \-/                    |  |      /
       18 -| / VP Product                  /  /
           |/--/--------------------------/
       12 -|/     |  VP Engineering

========================================================================================
||               Code Lines Contribution - Monthly Progression                        ||
========================================================================================
      1600 -|             /--\
            | - - - - - -/- - \---------- VP Infra (highest productivity)
            |           /      Org Avg(1187)
      1200 -|      /---/---------\
            |   --/ / | | \       \------- VP Engineering (1245)
       800 -|  /   /  | |  \               VP Product (892, slower ramp)
            | /   /   |/    \_________/
       400 -|/___/___/
            L_______________________________________________
             Jan—Feb—Mar—Apr—May—Jun—Jul—Aug—Sep—Oct—Nov—Dec

 Dec Values: VP Infra 1524 LOC | VP Eng 1245 LOC | VP Product 892 LOC (all >70% above baseline)

========================================================================================
||               Velocity Impact - Monthly Progression                                ||
========================================================================================
       70 -|               /-----\
           | - - - - - - -/- - - -\ - - - - - - - - VP Infra leads
           |             /         Org Avg(54.0 SP)
       60 -|      /-----/------\
           |     / | | | |      \------ VP Engineering (steady growth)
       50 -|   / VP Product      \    |
           |  / -/ - - -/--       \-- (but lagging peers)
       40 -|//   |     /
           L________________________________________________
             Jan—Feb—Mar—Apr—May—Jun—Jul—Aug—Sep—Oct—Nov—Dec

 Dec Impact: VP Infra 58.5 SP (+8.4% vs Org Avg) | VP Eng 56.2 SP (+4.1%) | VP Product 48.5 SP (-10.3%)
```

-----

### Simplified Month-End Data Table (Jan / Jun / Dec Snapshots)

| Team | Metric | Jan | Jun | Dec | Progress |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VP Engineering** (45) | Active Users | 8 (18%) | 28 (62%) | 37 (82%) | ⬆ +360% |
| | Active Days | 8.5 | 18.2 | 24.6 | ⬆ +189% |
| | Code Lines/user | 420 | 820 | 1245 | ⬆ +196% |
| | Velocity (SP/mo) | 38.0 | 50.2 | 56.2 | ⬆ +48% |
| | Quality Grade | B- | A- | A- | ⬆ Stable Strong |
| **VP Product** (32) | Active Users | 5 (16%) | 18 (56%) | 24 (75%) | ⬆ +380% |
| | Active Days | 7.2 | 16.5 | 22.5 | ⬆ +212% |
| | Code Lines/user | 290 | 620 | 892 | ⬆ +208% |
| | Velocity (SP/mo) | 35.2 | 44.8 | 48.5 | ⬆ +38% |
| | Quality Grade | C | B | B | ⬆ +1 grade |
| **VP Infra** (18) | Active Users | 4 (22%) | 14 (78%) | 16 (89%) | ⬆ +300% |
| | Active Days | 9.2 | 22.5 | 24.6 | ⬆ +167% |
| | Code Lines/user | 540 | 1180 | 1524 | ⬆ +182% |
| | Velocity (SP/mo) | 42.5 | 56.2 | 58.5 | ⬆ +38% |
| | Quality Grade | B | A | A | ⬆ Excellent |
| **Organization** (95) | Active Users | 17 (18%) | 60 (63%) | 77 (81.7%) | ⬆ +353% |
| | Active Days | 8.3 | 18.9 | 23.9 | ⬆ +188% |
| | Code Lines/user | 420 | 873 | 1187 | ⬆ +183% |