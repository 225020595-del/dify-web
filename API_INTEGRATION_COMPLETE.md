# ✅ API 集成完成 - 测试指南

## 🎉 集成状态

已成功集成真实的 Dify Workflow API：

### ✅ JD 解析器
- **API URL**: `https://api.dify.ai/v1`
- **API Key**: `app-PKM5GNF2sDXi7LkQkU4oCTDg`
- **状态**: 已硬编码在 `pages/api/jd/parse.ts`
- **功能**: 调用 Dify JD Breaker Workflow 解析岗位描述

### ✅ 招聘查询 Agent
- **API URL**: `https://api.dify.ai/v1`
- **API Key**: `app-IdeSY4rrZeKmutu2w0ERHbD2`
- **状态**: 已硬编码在 `pages/api/recruit/query.ts`
- **功能**: 调用 Dify RAG Workflow 检索招聘信息

## 🧪 测试步骤

### 1. 本地测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问以下页面测试：

#### 测试 JD 解析器
1. 打开 http://localhost:3000/jd-breaker
2. 粘贴一段 JD 文本，例如：
   ```
   岗位：高级后端开发工程师
   公司：某科技公司
   地点：北京/上海/深圳
   薪资：25K-45K
   
   岗位职责：
   1. 负责后端系统架构设计与开发
   2. 参与核心业务模块的技术方案设计
   
   任职要求：
   1. 3年以上后端开发经验
   2. 熟悉 Java/Go/Python
   ```
3. 点击"开始解析"
4. 查看右侧是否显示解析结果

#### 测试招聘查询 Agent
1. 打开 http://localhost:3000/recruit-agent
2. 输入查询，例如：
   - "阿里巴巴有哪些实习岗位？"
   - "互联网行业的后端开发岗位"
   - "字节跳动的内推码"
3. 点击"搜索"
4. 查看是否返回：
   - AI 智能回答
   - 岗位列表
   - 数据来源

### 2. 部署到 Vercel

```bash
# 提交代码
git add .
git commit -m "feat: 集成 Dify API - JD 解析器和招聘查询 Agent"
git push origin main
```

Vercel 会自动部署。

### 3. 生产环境测试

部署完成后，访问你的 Vercel 域名：

- `https://your-project.vercel.app/jd-breaker`
- `https://your-project.vercel.app/recruit-agent`

重复上述测试步骤。

## 🔍 API 调用说明

### JD 解析器 Workflow

**输入参数**:
```json
{
  "inputs": {
    "jd_text": "用户输入的 JD 文本"
  },
  "response_mode": "blocking",
  "user": "user-xxx"
}
```

**期望输出**:
- Workflow 应返回包含 `text` 或 `result` 字段的 JSON
- 可以是结构化 JSON，也可以是纯文本
- 前端会自动解析并提取字段

**输出格式建议**（在 Dify Workflow 中配置）:
```json
{
  "title": "岗位名称",
  "company": "公司名称",
  "location": "工作地点",
  "salary": "薪资范围",
  "experience": "工作经验",
  "education": "学历要求",
  "responsibilities": ["职责1", "职责2"],
  "requirements": ["要求1", "要求2"],
  "tags": ["技能1", "技能2"],
  "benefits": ["福利1", "福利2"]
}
```

### 招聘查询 Agent Workflow

**输入参数**:
```json
{
  "inputs": {
    "query": "用户查询内容"
  },
  "response_mode": "streaming",
  "user": "user-xxx"
}
```

**期望输出**（流式响应）:
- **LLM 节点**: `outputs.text` - AI 生成的回答
- **工具节点**: `outputs.result` - 岗位数据（JSON 数组）
- **知识检索**: `outputs.result` - 检索到的文档片段

**岗位数据格式**:
```json
[
  {
    "岗位名称": "后端开发工程师",
    "公司": "某公司",
    "地点": "北京",
    "类型": "校招",
    "申请链接": "https://...",
    "内推码": "REF2024001",
    "更新时间": "2024-11-25"
  }
]
```

## 🐛 常见问题排查

### 问题 1: API 调用失败
**症状**: 前端显示"解析失败"或"查询失败"

**排查步骤**:
1. 检查 Dify Workflow 是否正常运行
2. 在浏览器开发者工具中查看网络请求
3. 查看 API 返回的错误信息
4. 确认 API Key 有效且有权限

**解决方法**:
```bash
# 在 Vercel 查看函数日志
# Dashboard > Functions > 查看实时日志
```

### 问题 2: 解析结果为空
**症状**: API 调用成功，但没有显示数据

**可能原因**:
- Workflow 输出格式与前端期望不符
- 输出字段名不匹配

**解决方法**:
1. 在 Dify 中测试 Workflow 并查看输出格式
2. 更新 `pages/api/jd/parse.ts` 或 `pages/api/recruit/query.ts` 中的字段映射逻辑

### 问题 3: 招聘查询返回数据但格式错误
**症状**: 岗位列表显示"未知岗位"、"未知公司"

**原因**: Workflow 返回的字段名与代码中的映射不匹配

**解决方法**:
编辑 `pages/api/recruit/query.ts` 中的字段映射：
```typescript
const formattedJobs = jobsData.map((job, idx) => ({
  id: job.id || `job_${idx}`,
  title: job['岗位名称'] || job.title || '未知岗位',  // 根据实际字段名调整
  company: job['公司'] || job.company || '未知公司',
  // ... 其他字段
}))
```

## 📊 监控和优化

### 查看 API 调用情况
1. 登录 Dify 控制台
2. 查看应用的调用日志和统计

### 性能优化建议
- 考虑添加缓存（Redis）避免重复查询
- 对用户输入做限流（防止滥用）
- 监控 API 费用

## 🎯 下一步

- [ ] 测试 JD 解析器功能
- [ ] 测试招聘查询功能
- [ ] 根据实际 Workflow 输出调整字段映射
- [ ] 添加更多错误处理
- [ ] 优化用户体验（加载动画、错误提示等）

---

**需要帮助？** 如果遇到问题，请查看：
- 浏览器控制台错误
- Vercel 函数日志
- Dify Workflow 运行日志
