# 🚀 快速部署指南

本指南帮助你快速将应用部署到 Vercel。

## 📋 前置准备

- ✅ GitHub 账号
- ✅ Vercel 账号（可用 GitHub 登录）
- ✅ Dify API Key（用于简历分析功能）

## 🎯 部署步骤

### 步骤 1: 提交代码到 GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 添加 JD 解析器和招聘查询 Agent 模块"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/dify-resume-web.git

# 推送到 GitHub
git push -u origin main
```

### 步骤 2: 在 Vercel 导入项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择你的 `dify-resume-web` 仓库
5. 点击 "Import"

### 步骤 3: 配置环境变量

在 Vercel 项目配置页面，添加以下环境变量：

#### 必需配置（简历分析功能）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_URL` | Dify API 地址 | `https://api.dify.ai` |
| `NEXT_PUBLIC_APP_KEY` | Dify 应用 API Key | `app-xxxxxxxxxxxxx` |

#### 可选配置（JD 解析器和招聘查询）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_JD_BREAKER_API_URL` | JD 解析器 API 地址 | 使用 Mock 数据 |
| `NEXT_PUBLIC_JD_BREAKER_API_KEY` | JD 解析器 API Key | 使用 Mock 数据 |
| `NEXT_PUBLIC_RECRUIT_AGENT_API_URL` | 招聘查询 API 地址 | 使用 Mock 数据 |
| `NEXT_PUBLIC_RECRUIT_AGENT_API_KEY` | 招聘查询 API Key | 使用 Mock 数据 |

**注意**: 
- JD 解析器和招聘查询模块当前使用 Mock 数据，无需配置即可使用
- 如需集成真实 API，请参考 [API_INTEGRATION.md](./API_INTEGRATION.md)

### 步骤 4: 部署

1. 确认配置无误
2. 点击 "Deploy"
3. 等待构建完成（约 1-2 分钟）
4. 部署成功后，Vercel 会提供一个访问链接

### 步骤 5: 验证部署

访问 Vercel 提供的链接，测试以下功能：

- ✅ 首页简历分析功能
- ✅ JD 解析器页面（使用 Mock 数据）
- ✅ 招聘查询页面（使用 Mock 数据）
- ✅ 页面间导航

## 🔄 后续更新

每次推送到 GitHub main 分支，Vercel 会自动重新部署：

```bash
git add .
git commit -m "更新说明"
git push origin main
```

## 🛠️ 自定义域名（可选）

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录
4. 等待 SSL 证书自动配置完成

## ⚡ 性能优化建议

- ✅ 启用 Vercel Analytics（免费）
- ✅ 启用 Edge Functions（自动优化）
- ✅ 配置 CDN 缓存策略
- ✅ 监控 API 调用次数和费用

## 🐛 常见问题

### 部署失败：构建错误

**原因**: TypeScript 类型错误或缺少依赖

**解决**:
```bash
# 本地先测试构建
npm run build

# 修复错误后再推送
git add .
git commit -m "fix: 修复构建错误"
git push
```

### 环境变量不生效

**原因**: 环境变量配置错误或未重新部署

**解决**:
1. 检查环境变量名称是否正确
2. 确保以 `NEXT_PUBLIC_` 开头（客户端使用）
3. 在 Vercel Dashboard 重新部署

### API 调用失败

**原因**: API Key 无效或 CORS 问题

**解决**:
1. 检查 Dify API Key 是否有效
2. 确认 API URL 正确
3. 查看浏览器控制台错误信息

### Mock 数据想替换为真实 API

**解决**: 参考 [API_INTEGRATION.md](./API_INTEGRATION.md)

## 📊 监控和分析

### Vercel Analytics

1. 在项目设置中启用 Analytics
2. 查看访问量、性能指标等

### 日志查看

1. 访问 Vercel Dashboard
2. 点击项目 > Functions
3. 查看实时日志和错误

## 🔒 安全建议

- ✅ 不要在前端代码中硬编码 API Key
- ✅ 使用环境变量管理敏感信息
- ✅ 定期更新依赖包
- ✅ 启用 Vercel 的安全功能

## 📞 获取帮助

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Dify 文档](https://docs.dify.ai)

## ✅ 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] 部署成功
- [ ] 简历分析功能测试通过
- [ ] JD 解析器测试通过（Mock）
- [ ] 招聘查询测试通过（Mock）
- [ ] 所有页面导航正常
- [ ] 移动端适配正常

---

**恭喜！🎉** 你的应用已成功部署到 Vercel！

分享链接给朋友试用吧 👉 `https://你的项目名.vercel.app`
