这是一个忽略网络拓扑限制、专注于**交互体验**与**后端渲染能力**的最优化 End-to-End 设计方案。

该方案的核心在于采用 **"SSR 影子页 (Shadow Page)"** 策略，即在 Hono 后端专门提供一套面向“爬虫”和“重定向”的轻量级服务，与你的 React 前端 SPA 分离。

### 1. 总体架构逻辑

我们将在 Hono 后端建立两条专用通道，服务于分享流程：

1.  **通道 A (Image Generator)**: 实时渲染动态图片。
2.  **通道 B (Crawler Shell)**: 一个极简的 HTML 外壳，专门承载 Meta 标签，并负责将真人用户重定向回 React 前端应用。



---

### 2. 详细模块设计

#### 2.1 后端：动态图片生成服务 (Image Generator)

这是实现“千人千面”报告封面的核心。

* **路由定义**: `GET /api/og-image/:reportId.png`
* **技术栈**: `satori` (HTML/CSS -> SVG) + `@resvg/resvg-js` (SVG -> PNG)。这套组合在 Node.js 容器中性能极佳且渲染结果高度一致。
* **处理流程**:
    1.  **数据获取**: 根据 `reportId` 从数据库/缓存拉取该用户的年度核心数据（关键词、百分比、头像 URL）。
    2.  **JSX 模板渲染**: 定义一个 Hono 组件（类似 React 组件），将数据填入。设计上应包含醒目的标题、数据大字、品牌 Logo。
    3.  **栅格化**: 使用 `satori` 转 SVG，再用 `resvg` 转 PNG Buffer。
    4.  **缓存策略 (关键优化)**: 设置 HTTP 响应头 `Cache-Control: public, max-age=86400, immutable`。Viva Engage 的爬虫会缓存图片，避免用户每次浏览都重新消耗 ECS CPU 计算资源。

#### 2.2 后端：SSR 影子页 (Crawler Shell)

这是为了解决 SPA 无法被抓取以及分享链接美观性的问题。

* **路由定义**: `GET /share/card/:reportId`
* **功能职责**:
    1.  **针对爬虫 (User-Agent 检测)**: 返回包含丰富 Open Graph 标签的静态 HTML。
        * `<meta property="og:title" content="Alex 的 2024 年度报告" />`
        * `<meta property="og:image" content="https://api.yourdomain.com/api/og-image/123.png" />` (指向通道 A)
        * `<meta property="og:description" content="击败了 99% 的开发者，点击查看你的..." />`
    2.  **针对真人**: 在 HTML `<body>` 中包含一段立即执行的 JavaScript 重定向代码。
        * `window.location.replace("https://your-spa-domain.com/report/view/123");`
* **设计意图**: 用户在社交媒体上看到的是 `/share/card/123` 的链接预览（带图），点击后瞬间穿越到 `/report/view/123` 的真实前端应用中。

#### 2.3 前端：交互与剪贴板策略 (The Trigger)

前端不再直接分享当前页面 URL，而是分享“影子页”的 URL。

* **交互逻辑**:
    1.  用户点击“分享到 Viva Engage”。
    2.  **构造 Payload**:
        * **链接**: 指向 Hono 的影子页 `https://your-domain.com/share/card/{reportId}`。
        * **文案**: "查看我的年度报告... [链接]"。
    3.  **写入剪贴板**: 调用 `navigator.clipboard.writeText(fullText)`。
    4.  **开启新窗口**:
        * 目标 URL: `https://web.yammer.com/main/groups/{communityId}` (指定社区) 或 `https://web.yammer.com/main/feed` (动态流)。
    5.  **UI 反馈**: 显示 Toast "内容已复制，请在打开的页面中粘贴"。

---

### 3. 数据流转图 (Sequence)

1.  **User** -> 点击分享 -> **Frontend** (复制影子页 URL + 打开 Engage)。
2.  **User** -> 在 Engage 发帖框粘贴 -> **Engage Frontend** (解析 URL)。
3.  **Engage Bot** -> 请求 `GET /share/card/:id` -> **Hono Backend**。
4.  **Hono Backend** -> 返回带 OG Meta 的 HTML (指向动态图片 URL)。
5.  **Engage Bot** -> 解析 Meta，请求 `GET /api/og-image/:id.png` -> **Hono Backend**。
6.  **Hono Backend** -> 生成 PNG 并返回 -> **Engage UI** (展示大图卡片)。
7.  **Other User** -> 点击卡片 -> 访问 `GET /share/card/:id` -> 浏览器执行 JS 重定向 -> **Real Frontend App**。

---

### 4. 关键技术细节与配置

#### A. 字体加载 (Satori 痛点)
在 ECS 容器（通常是 Linux Alpine 或 Debian）中，`satori` 必须加载字体文件才能渲染文字。
* **方案**: 将所需的字体文件（如 .ttf/.woff）打包进 Docker 镜像的特定目录。在 Hono 启动时使用 `fs.readFileSync` 将字体读入内存，传给 `satori` 配置。不要依赖系统字体。

#### B. 容器资源限制
动态图片生成（尤其是 `resvg` 部分）是 CPU 密集型操作。
* **方案**: 确保 ECS Task 定义中分配了足够的 CPU 单元。如果并发很高，建议在 Hono 中加入简单的内存队列或限制并发数，防止将 ECS 实例卡死。

#### C. URL 拼接
* 确保 Hono 后端知道自己的“外部访问域名”（通过环境变量 `APP_BASE_URL` 注入）。因为生成的 `og:image` 必须是绝对路径（Absolute URL），爬虫不识别相对路径。

### 5. 最终体验描述

1.  用户按下按钮，浏览器提示“已复制”，随即 Viva Engage 页面弹出。
2.  用户 `Ctrl+V`，此时输入框出现链接。
3.  **（高光时刻）** 几秒钟内，链接下方自动展开一张精美的、带有用户名字和年度数据的**大尺寸卡片**。
4.  用户点击发布。
5.  围观群众看到图片，产生好奇，点击图片，浏览器打开并无缝跳转到你的应用内部，引导他们生成自己的报告。

这是一个兼顾了**传播性（带图）**、**易用性（自动跳转）**和**技术解耦（前后端分离）**的最优设计。