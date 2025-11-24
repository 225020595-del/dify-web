import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  result?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { resume } = req.body

  if (!resume) {
    return res.status(400).json({ error: '请提供简历内容' })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const apiKey = process.env.NEXT_PUBLIC_APP_KEY

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: '服务器配置错误' })
  }

  try {
    const response = await fetch(`${apiUrl}/completion-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: { resume },
        response_mode: 'blocking',
        user: 'user-' + Date.now(),
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    const result = data.answer || data.result || '未获取到分析结果'

    res.status(200).json({ result })
  } catch (error) {
    console.error('Dify API Error:', error)
    res.status(500).json({ error: '调用 AI 服务失败' })
  }
}
