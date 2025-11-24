# Dify Resume Web

基于 Next.js 和 Dify AI 的简历分析 Web 应用。

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
复制 `.env.local.example` 为 `.env.local` 并填入你的 Dify API 密钥：
```bash
cp .env.local.example .env.local
```

3. 运行开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_APP_ID`: 你的 Dify 应用 ID
   - `NEXT_PUBLIC_APP_KEY`: 你的 Dify 应用 Key
   - `NEXT_PUBLIC_API_URL`: 你的 Dify API 地址
4. 点击部署

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Dify AI API
