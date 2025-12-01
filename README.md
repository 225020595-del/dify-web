# Dify Resume Web

基于 Next.js 和 Dify AI 的智能简历分析与招聘查询 Web 应用。

## ✨ 功能模块

### 1. 简历分析助手
- 📄 支持多种文件格式上传（PDF、Word、Markdown 等）
- 🎯 51 种岗位类型智能匹配
- 📊 可视化评分与数据展示
- 💡 AI 生成详细改进建议

### 2. JD 解析器 🆕
- 📝 智能解析岗位描述（JD）
- 🏢 自动提取结构化信息（公司、薪资、要求等）
- 🏷️ 技能标签与福利待遇识别
- 💾 支持导出为 JSON 格式

### 3. 招聘查询 Agent 🆕
- 🔍 基于 RAG 的智能招聘信息检索
- 🏢 按公司/行业/岗位查询
- 📋 岗位列表与内推信息
- 🎯 AI 智能回答与推荐

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 配置环境变量
创建 `.env.local` 文件并填入配置：

```bash
# 简历分析 API
NEXT_PUBLIC_API_URL=https://api.dify.ai
NEXT_PUBLIC_APP_KEY=app-xxxxxxxxxxxxx

# JD 解析器 API（可选，默认使用 Mock）
NEXT_PUBLIC_JD_BREAKER_API_URL=https://api.dify.ai
NEXT_PUBLIC_JD_BREAKER_API_KEY=app-xxxxxxxxxxxxx

# 招聘查询 Agent API（可选，默认使用 Mock）
NEXT_PUBLIC_RECRUIT_AGENT_API_URL=https://api.dify.ai
NEXT_PUBLIC_RECRUIT_AGENT_API_KEY=app-xxxxxxxxxxxxx
```

### 运行开发服务器
```bash
npm run dev
```

打开浏览器访问：
- 首页（简历分析）: http://localhost:3000
- JD 解析器: http://localhost:3000/jd-breaker
- 招聘查询: http://localhost:3000/recruit-agent

### 构建生产版本
```bash
npm run build
npm start
```

## 📦 部署到 Vercel

### 方法 1：通过 Git 自动部署

1. 推送代码到 GitHub：
```bash
git add .
git commit -m "feat: 添加 JD 解析器和招聘查询模块"
git push origin main
```

2. 在 [Vercel](https://vercel.com) 导入项目

3. 配置环境变量（在 Vercel Dashboard）：
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_APP_KEY`
   - `NEXT_PUBLIC_JD_BREAKER_API_KEY`（可选）
   - `NEXT_PUBLIC_RECRUIT_AGENT_API_KEY`（可选）

4. 点击部署，Vercel 会自动构建和发布

### 方法 2：手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 🔧 API 集成

当前 JD 解析器和招聘查询模块使用 **Mock 数据**，可以正常运行和测试 UI。

如需集成真实的 Dify Workflow API，请参考 [API_INTEGRATION.md](./API_INTEGRATION.md) 文档。

### 集成步骤概览：

1. 在 Dify 中创建对应的 Workflow
2. 获取 API Key 和 Workflow ID
3. 更新 `pages/api/jd/parse.ts` 和 `pages/api/recruit/query.ts`
4. 配置环境变量
5. 重新部署

## 🛠️ 技术栈

- **框架**: Next.js 14
- **UI**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **AI**: Dify AI API
- **部署**: Vercel

## 📂 项目结构

```
dify-resume-web/
├── pages/
│   ├── index.tsx              # 简历分析主页
│   ├── jd-breaker.tsx         # JD 解析器页面
│   ├── recruit-agent.tsx      # 招聘查询页面
│   └── api/
│       ├── jd/
│       │   └── parse.ts       # JD 解析 API
│       └── recruit/
│           └── query.ts       # 招聘查询 API
├── styles/
│   └── globals.css            # 全局样式
├── public/                    # 静态资源
├── API_INTEGRATION.md         # API 集成指南
└── README.md                  # 本文档
```

## 🎨 页面预览

### 简历分析助手
- 拖拽上传简历文件
- 选择目标岗位类型
- AI 智能评分与建议
- 可视化数据展示

### JD 解析器
- 粘贴或上传 JD 文本
- 自动提取结构化信息
- 展示岗位职责、要求、标签
- 导出 JSON 格式

### 招聘查询 Agent
- 智能搜索框（支持公司/行业查询）
- AI 生成回答
- 岗位列表展示
- 内推码复制功能

## 📝 开发说明

### 添加新页面
1. 在 `pages/` 下创建新的 `.tsx` 文件
2. 使用现有样式和组件保持一致性
3. 更新导航链接

### 自定义样式
所有样式使用 Tailwind CSS，配置文件：`tailwind.config.ts`

### API 开发
API 路由在 `pages/api/` 下，遵循 Next.js API Routes 规范。

## 🐛 常见问题

### Q: Mock 数据何时会被替换？
A: 提供 Dify API 信息后即可替换，参考 `API_INTEGRATION.md`。

### Q: 如何修改 Mock 返回的数据？
A: 编辑 `pages/api/jd/parse.ts` 和 `pages/api/recruit/query.ts` 中的 `mockParsedJD` 和 `mockResult` 对象。

### Q: 部署后环境变量不生效？
A: 确保在 Vercel Dashboard 配置了环境变量，并重新部署项目。

### Q: 如何本地测试真实 API？
A: 配置 `.env.local` 文件，然后运行 `npm run dev`。

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
