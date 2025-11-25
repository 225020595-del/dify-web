# 部署指南

## ✅ 已修复的问题

1. **文件上传功能** - 现在直接调用 Dify Files API
2. **文件删除按钮** - 点击 X 图标可删除已选文件
3. **拖拽上传** - 支持拖放文件到上传区域
4. **可视化仪表盘** - LinkedIn 风格的分析结果展示

## 📝 环境配置

### 本地开发

1. 创建 `.env.local` 文件（已创建，包含你的 API Key）:
```bash
NEXT_PUBLIC_APP_KEY=app-FtqRmpeXKRkCK6SJ9WS9VUJu
NEXT_PUBLIC_API_URL=https://api.dify.ai/v1
```

2. 启动开发服务器:
```bash
npm run dev
```

### Vercel 部署配置

登录 Vercel 后台，进入项目设置：

1. **Settings → Environment Variables**
2. 添加以下变量:
   - `NEXT_PUBLIC_APP_KEY` = `app-FtqRmpeXKRkCK6SJ9WS9VUJu`
   - `NEXT_PUBLIC_API_URL` = `https://api.dify.ai/v1`
3. 点击 **Save**
4. 重新部署项目（Deployments → Redeploy）

## 🎨 功能说明

### 上传区域
- **拖拽上传**: 拖动文件到虚线框内
- **点击上传**: 点击区域选择文件
- **删除文件**: 点击文件名右侧的 X 按钮
- **支持格式**: PDF, DOCX, TXT

### 可视化仪表盘
- **环形进度条**: 显示总分 (0-10分)
- **优势卡片**: 硬技能匹配度
- **差距卡片**: 需要改进的领域
- **分析卡片**: 经验教育匹配度
- **潜力卡片**: 成长潜力评估
- **详细分析**: 展开式卡片显示完整建议

## 🔧 技术架构

```
前端 (Next.js)
    ↓
直接调用 Dify API
    ├── POST /v1/files/upload (文件上传)
    └── POST /v1/workflows/run (流式分析)
```

**无需后端服务器** - 所有 API 调用都在浏览器端完成

## 📊 数据流程

1. 用户选择岗位 + 上传简历
2. 前端直接上传文件到 Dify
3. 获取 file_id 后调用 Workflow API
4. 流式接收 AI 分析结果
5. 实时解析并更新 UI 组件

## ⚠️ 注意事项

- `.env.local` 文件不会被 Git 跟踪（已在 .gitignore）
- API Key 必须在 Vercel 环境变量中配置
- 环境变量必须以 `NEXT_PUBLIC_` 开头才能在浏览器端使用
- 每次修改环境变量后需要重新部署

## 🚀 部署状态

- **GitHub**: ✅ 代码已推送
- **Vercel**: ⏳ 等待自动部署（约 1-2 分钟）
- **URL**: https://dify-web-225020595-dels-projects.vercel.app
