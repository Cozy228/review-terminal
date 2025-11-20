# 📄 PDF Export Specification

## 功能概述

当用户按下 **D 键** 时，生成并下载一份精美的 PDF 报告，包含完整的 2025 年度回顾数据。

---

## 架构方案

### **部署架构**
- ✅ 前后端统一部署在同一容器（AWS ECS/EC2）
- ✅ 无需 S3、CDN 等外部服务
- ✅ 服务器不保存 PDF 文件
- ✅ 流式生成并直接返回给浏览器

```
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  └─ POST /api/export/pdf                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Same Container (Node.js Backend)      │
│  ├─ 生成 PDF (PDFKit)                   │
│  └─ 流式返回                             │
└─────────────────────────────────────────┘
```

---

## 技术实现

### **核心库**
```json
{
  "pdfkit": "^0.14.0",
  "canvas": "^2.11.2",
  "chart.js": "^4.4.0"
}
```

**为什么用 PDFKit 而非 html2canvas？**
- ✅ 矢量 PDF，文件小（< 1MB）
- ✅ 可读性更好，适合打印
- ✅ 支持两种风格：Professional / Terminal

### **后端 API 实现**

```typescript
// backend/src/routes/export.ts
import express from 'express';
import PDFDocument from 'pdfkit';
import { generateProfessionalPDF, generateTerminalPDF } from '../services/pdfGenerator';

const router = express.Router();

router.post('/api/export/pdf', async (req, res) => {
  try {
    const { username, data, style, theme } = req.body;
    
    // 验证数据
    if (!username || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // 设置响应头 - 直接下载
    const filename = `2025-developer-review-${username}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // 创建 PDF 文档
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    // 直接将 PDF 流式传输到响应
    doc.pipe(res);
    
    // 根据风格生成 PDF
    if (style === 'professional') {
      await generateProfessionalPDF(doc, data, theme);
    } else {
      await generateTerminalPDF(doc, data, theme);
    }
    
    // 完成并发送
    doc.end();
    
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
});

export default router;
```

---

## PDF 内容结构

### **Page 1: Cover**
```
┌─────────────────────────────────────────┐
│                                         │
│         2025 DEVELOPER REVIEW           │
│                                         │
│              @username                  │
│                                         │
│         ▄████████████████████▄          │
│        ███████▀▀▀  ▀▀▀███████          │
│       ████▀              ▀████          │
│      ███   ⭐ OUTSTANDING ⭐   ███       │
│       ████▄              ▄████          │
│        ███████▄▄▄  ▄▄▄███████          │
│         ▀████████████████████▀          │
│                                         │
│    BUILD SUCCESSFUL IN 365 DAYS        │
│                                         │
│    Generated: 2025-11-20               │
│                                         │
└─────────────────────────────────────────┘
```

### **Page 2: Git Lifecycle**
```
┌─────────────────────────────────────────┐
│  GIT LIFECYCLE                          │
│  ═══════════════════════════════════    │
│                                         │
│  Commit Velocity (2025)                 │
│  [ASCII Line Chart]                     │
│                                         │
│  Key Metrics:                           │
│  • Total Commits: 2,402                 │
│  • Peak Performance: July (84 commits)  │
│  • Longest Streak: 47 days              │
│  • Total Lines Added: 125,847           │
│  • Active Days: 287 / 365               │
│                                         │
└─────────────────────────────────────────┘
```

### **Page 3: Tech Stack**
```
┌─────────────────────────────────────────┐
│  TECH STACK                             │
│  ═══════════════════════════════════    │
│                                         │
│  Language Distribution                  │
│  [Horizontal Bar Chart]                 │
│                                         │
│  TypeScript    68.2%  ████████████████  │
│  JavaScript    24.1%  ████████          │
│  Python         5.8%  ██                │
│  Go             1.9%  ▌                 │
│                                         │
│  Most Active Frameworks                 │
│  • React:    2,847 hours                │
│  • Node.js:  1,523 hours                │
│  • Next.js:    892 hours                │
│                                         │
└─────────────────────────────────────────┘
```

### **Page 4: Workflow**
```
┌─────────────────────────────────────────┐
│  WORKFLOW                               │
│  ═══════════════════════════════════    │
│                                         │
│  Task Completion Heat Map               │
│  [Block Map Visualization]              │
│                                         │
│  Statistics                             │
│  ✅ Completed:     312 (81.2%)          │
│  🔄 In Progress:    48 (12.5%)          │
│  🔴 Blocked:        24 (6.3%)           │
│                                         │
│  Productivity Insights                  │
│  • Average completion time: 3.2 days    │
│  • Most productive month: July          │
│  • Sprint velocity: 24 points/sprint    │
│                                         │
└─────────────────────────────────────────┘
```

### **Page 5: Summary**
```
┌─────────────────────────────────────────┐
│  2025 YEAR IN REVIEW                    │
│  ═══════════════════════════════════    │
│                                         │
│  Achievements                           │
│  🏆 2,402 commits across 18 repos       │
│  🔥 47-day longest streak               │
│  📚 8 programming languages             │
│  ⚡ 312 tasks completed                 │
│  🎯 81.2% completion rate               │
│                                         │
│  Year Highlights                        │
│  • Peak month: July 2025                │
│  • Most used language: TypeScript       │
│  • Total active days: 287               │
│  • Code quality: Zero critical issues   │
│                                         │
│  ───────────────────────────────────    │
│  Made with love by developers           │
│  for developers                         │
│  zen-terminal v2.0.25                   │
└─────────────────────────────────────────┘
```

---

## 前端调用

```typescript
// frontend/src/utils/exportPDF.ts
export async function downloadPDF(
  username: string,
  data: YearReviewData,
  style: 'professional' | 'terminal',
  theme: 'light' | 'dark'
) {
  try {
    showToast('Generating PDF...', 'info');
    
    const response = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, data, style, theme })
    });
    
    if (!response.ok) throw new Error('Failed to generate PDF');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2025-developer-review-${username}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showToast('PDF downloaded successfully!', 'success');
  } catch (error) {
    console.error('PDF export error:', error);
    showToast('Failed to generate PDF. Please try again.', 'error');
  }
}
```

---

## Dockerfile 配置

```dockerfile
FROM node:20-alpine

# 安装 canvas 依赖
RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    build-base \
    g++ \
    python3

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## 测试清单

- [ ] Professional Style - Light Theme
- [ ] Professional Style - Dark Theme
- [ ] Terminal Style - Light Theme
- [ ] Terminal Style - Dark Theme
- [ ] 验证 PDF 文件大小 < 1MB
- [ ] 验证图表清晰度
- [ ] 验证文本可复制
- [ ] 测试不同浏览器

---

## 总结

### **方案优势**
- ✅ 简单：无需外部服务
- ✅ 快速：流式返回
- ✅ 安全：服务器不保存文件
- ✅ 经济：无额外成本
- ✅ 可读性：Professional Style 优先

### **文件大小**
- Professional Style: ~500-800KB
- Terminal Style: ~300-500KB
