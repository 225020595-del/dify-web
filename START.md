# 🚀 本地启动指南

## ✅ 环境配置已完成

所有 API Key 已配置完成：
- ✅ 简历分析: `app-GZsv84B98FQB0MoNIbsaKPlL`
- ✅ JD 解析: `app-PKM5GNF2sDXi7LkQkU4oCTDg`  
- ✅ 招聘查询: `app-IdeSY4rrZeKmutu2w0ERHbD2`

## 📝 启动步骤

### 1. 等待 Node.js 安装完成
Homebrew 正在安装 Node.js，请等待...

### 2. 安装项目依赖
```bash
cd /Users/yangmingpan/dify-resume-web
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
浏览器打开：http://localhost:3000

## 🎯 功能测试

### 📄 简历分析
1. 点击"简历分析" Tab
2. 选择岗位（如：互联网：商业化产品经理）
3. 上传简历文件
4. 点击"开始智能分析"

### 🔍 JD 解析
1. 点击"JD 解析" Tab
2. 输入职位描述文本或上传文件
3. 点击"开始解析"

### 💼 招聘查询
1. 点击"招聘查询" Tab
2. 输入查询（如："阿里巴巴有哪些实习岗位？"）
3. 点击"搜索"

## 📊 端口说明

- 开发服务器: http://localhost:3000
- API 路由: http://localhost:3000/api/*

## ⚠️ 常见问题

**Q: 端口被占用？**
```bash
# 查找占用 3000 端口的进程
lsof -i :3000
# 或使用其他端口
PORT=3001 npm run dev
```

**Q: 依赖安装失败？**
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

**Q: API 调用失败？**
- 检查 `.env.local` 文件是否存在
- 确认 API Key 正确
- 查看浏览器控制台（F12）的错误信息
