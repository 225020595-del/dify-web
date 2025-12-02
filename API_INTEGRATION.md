# API 集成指南

本文档说明如何将 Mock API 替换为真实的 Dify Workflow API。

## 📋 待集成的 API

### 1. JD 解析器 API (`/api/jd/parse`)

**文件位置**: `pages/api/jd/parse.ts`

**需要替换的部分**:
```typescript
// TODO: 集成 Dify JD Breaker Workflow API
// 1. 调用 Dify API 上传文件（如果是文件）
// 2. 调用 JD Breaker Workflow
// 3. 解析返回结果并提取结构化数据
```

**集成步骤**:

1. **获取 Dify API 配置**
   - API URL: `https://api.dify.ai` 或你的私有部署地址
   - API Key: 从 Dify 控制台获取
   - Workflow ID: JD Breaker 的 workflow ID

2. **文件上传**（如果输入是文件）
   ```typescript
   const uploadFormData = new FormData()
   uploadFormData.append('file', file)
   uploadFormData.append('user', userId)

   const uploadResponse = await fetch(`${apiUrl}/files/upload`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${apiKey}`,
     },
     body: uploadFormData,
   })

   const uploadData = await uploadResponse.json()
   ```

3. **调用 Workflow**
   ```typescript
   const workflowResponse = await fetch(`${apiUrl}/workflows/run`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${apiKey}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       inputs: {
         jd_text: textInput || '',
         jd_file: fileInput ? {
           type: 'document',
           transfer_method: 'local_file',
           upload_file_id: uploadData.id,
         } : null,
       },
       response_mode: 'blocking', // 或 'streaming'
       user: userId,
     }),
   })
   ```

4. **解析返回结果**
   根据你的 Workflow 输出格式，提取以下字段：
   - `title`: 岗位名称
   - `company`: 公司名称
   - `location`: 工作地点
   - `salary`: 薪资范围
   - `experience`: 工作经验要求
   - `education`: 学历要求
   - `responsibilities`: 岗位职责（数组）
   - `requirements`: 任职要求（数组）
   - `tags`: 技能标签（数组）
   - `benefits`: 福利待遇（数组）

---

### 2. 招聘查询 Agent API (`/api/recruit/query`)

**文件位置**: `pages/api/recruit/query.ts`

**需要替换的部分**:
```typescript
// TODO: 实际实现
// 1. 调用 Dify RAG Workflow API
// 2. 传入用户查询和查询类型
// 3. 解析返回的 answer、jobs、sources
// 4. 可能需要调用飞书多维表格 API 获取最新数据
```

**集成步骤**:

1. **获取配置**
   - Dify API URL 和 Key
   - 招聘查询 Workflow ID
   - 飞书多维表格 API Token（如果需要）

2. **调用 RAG Workflow**
   ```typescript
   const response = await fetch(`${apiUrl}/workflows/run`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${apiKey}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       inputs: {
         query: query,
         query_type: type, // 'company' | 'industry' | 'auto'
         top_k: topK || 10,
       },
       response_mode: 'streaming', // 推荐使用 streaming
       user: userId,
     }),
   })
   ```

3. **处理流式响应**（如果使用 streaming）
   ```typescript
   const reader = response.body?.getReader()
   const decoder = new TextDecoder()
   let answer = ''
   let jobs = []
   
   if (reader) {
     while (true) {
       const { done, value } = await reader.read()
       if (done) break
       
       const chunk = decoder.decode(value)
       const lines = chunk.split('\n').filter(line => line.startsWith('data:'))
       
       for (const line of lines) {
         const data = JSON.parse(line.replace('data: ', ''))
         
         if (data.event === 'node_finished') {
           // 提取 LLM 输出的 answer
           if (data.data.outputs.text) answer = data.data.outputs.text
           
           // 提取工具调用返回的 jobs
           if (data.data.outputs.jobs) jobs = JSON.parse(data.data.outputs.jobs)
         }
       }
     }
   }
   ```

4. **返回格式**
   ```typescript
   res.status(200).json({
     answer: string,        // LLM 生成的回答
     jobs: Array<{          // 岗位列表
       id: string,
       title: string,
       company: string,
       location: string,
       type: string,
       applyUrl?: string,
       referralCode?: string,
       updateDate?: string,
     }>,
     sources: Array<{       // 检索到的知识片段
       docId: string,
       excerpt: string,
       score: number,
     }>,
   })
   ```

---

## 🔧 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

### JD 解析器
```
NEXT_PUBLIC_JD_BREAKER_API_URL=https://api.dify.ai
NEXT_PUBLIC_JD_BREAKER_API_KEY=app-xxxxxxxxxxxxx
```

### 招聘查询 Agent
```
NEXT_PUBLIC_RECRUIT_AGENT_API_URL=https://api.dify.ai
NEXT_PUBLIC_RECRUIT_AGENT_API_KEY=app-xxxxxxxxxxxxx
```

### 飞书多维表格（如果需要）
```
FEISHU_APP_ID=cli_xxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxx
FEISHU_APP_TOKEN=xxxxxxxxxxxxx
FEISHU_TABLE_ID=xxxxxxxxxxxxx
```

---

## 📝 Dify Workflow 输出格式建议

### JD Breaker Workflow

建议 Workflow 的最终输出节点返回 JSON 格式：

```json
{
  "title": "高级后端开发工程师",
  "company": "某科技公司",
  "location": "北京/上海",
  "salary": "25K-45K",
  "experience": "3-5年",
  "education": "本科及以上",
  "responsibilities": [
    "负责后端系统架构设计与开发",
    "..."
  ],
  "requirements": [
    "计算机相关专业本科及以上学历",
    "..."
  ],
  "tags": ["Java", "Go", "MySQL"],
  "benefits": ["五险一金", "带薪年假"]
}
```

### 招聘查询 Agent Workflow

建议包含以下节点输出：

1. **LLM 节点** - 输出 `answer`（文本回答）
2. **工具节点** - 调用飞书多维表格，返回 `jobs`（岗位列表 JSON）
3. **知识检索节点** - 返回 `sources`（检索片段）

---

## 🧪 测试建议

1. **本地测试**
   ```bash
   npm run dev
   ```
   访问:
   - http://localhost:3000/jd-breaker
   - http://localhost:3000/recruit-agent

2. **Mock 数据验证**
   - 当前已实现 Mock 数据，可以先测试前端交互流程
   - 确保 UI 展示正常

3. **API 替换后测试**
   - 逐个替换 API
   - 先测试简单场景（纯文本输入）
   - 再测试复杂场景（文件上传、流式响应）

4. **错误处理**
   - 测试 API 失败场景
   - 测试网络超时
   - 测试无效输入

---

## 🚀 部署到 Vercel

1. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加 JD 解析器和招聘查询 Agent 模块"
   git push origin main
   ```

2. **Vercel 自动部署**
   - 推送后 Vercel 会自动触发构建
   - 在 Vercel Dashboard 查看部署状态

3. **配置环境变量**
   - 在 Vercel 项目设置中添加上述环境变量
   - 重新部署以使环境变量生效

4. **验证部署**
   - 访问生产环境 URL
   - 测试所有功能

---

## 📞 后续对接

当你提供真实的 Dify API 信息后，我会：

1. 更新 `pages/api/jd/parse.ts` 和 `pages/api/recruit/query.ts`
2. 集成真实的 API 调用
3. 处理响应格式转换
4. 添加错误处理和重试逻辑
5. 优化性能（缓存、限流等）

请提供以下信息：
- [ ] Dify API URL
- [ ] JD Breaker Workflow 的 API Key 和 Workflow ID
- [ ] 招聘查询 Agent Workflow 的 API Key 和 Workflow ID
- [ ] Workflow 的输入输出格式示例
- [ ] 飞书多维表格 API Token（如果使用）
