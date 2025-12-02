import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs/promises'

const DIFY_API_URL = 'https://api.dify.ai/v1'
const DIFY_API_KEY = 'app-Vv1qwBMeU0dn9Tf5e37sGYLq'

// 禁用 Next.js 默认的 body parser，以便 formidable 可以处理请求
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    })
    
    const [fields, files] = await form.parse(req)
    
    console.log('Parsed fields:', JSON.stringify(fields))
    console.log('Parsed files:', JSON.stringify(Object.keys(files)))

    let jdText = ''
    const textFields = fields.text
    const fileFields = files.file

    // 处理文本输入
    if (textFields && textFields.length > 0 && textFields[0] && textFields[0].trim()) {
      jdText = textFields[0].trim()
      console.log('Using text input, length:', jdText.length)
    } 
    // 处理文件上传
    else if (fileFields && fileFields.length > 0 && fileFields[0]) {
      const file = fileFields[0]
      console.log('Using file input:', file.originalFilename, file.mimetype)
      try {
        jdText = await fs.readFile(file.filepath, 'utf-8')
        jdText = jdText.trim()
        console.log('File content length:', jdText.length)
      } catch (readError) {
        console.error('Error reading file:', readError)
        return res.status(400).json({ error: '无法读取上传的文件' })
      }
    }

    if (!jdText) {
      console.log('No JD text found in request')
      return res.status(400).json({ 
        error: '请提供 JD 文本或上传 JD 文件',
        debug: { fields: Object.keys(fields), files: Object.keys(files) }
      })
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // 调用 Dify JD Breaker Workflow
    const workflowResponse = await fetch(`${DIFY_API_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          JD: jdText,  // Dify Workflow 的输入参数名是 JD
        },
        response_mode: 'blocking',
        user: userId,
      }),
    })

    if (!workflowResponse.ok) {
      const errorData = await workflowResponse.json().catch(() => ({ message: 'API 调用失败' }))
      throw new Error(errorData.message || `API 调用失败 (${workflowResponse.status})`)
    }

    const workflowData = await workflowResponse.json()
    
    // 打印完整的 API 返回数据，便于调试
    console.log('Dify API Response:', JSON.stringify(workflowData, null, 2))
    
    // 根据 JD_breaker.yml DSL，输出字段是：Advise, score, reason
    const outputs = workflowData.data?.outputs || {}
    
    // 提取 Workflow 输出
    const result = {
      advise: outputs.Advise || '',           // 准备建议（文本）
      score: outputs.score || 0,              // 评分（0-1）
      reason: outputs.reason || '',           // 评分原因
      raw: jdText,                            // 原始 JD 文本
    }
    
    console.log('Extracted result:', result)

    res.status(200).json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Parse error:', error)
    const errorMessage = (error as Error).message
    res.status(500).json({ 
      error: 'JD 解析失败',
      message: errorMessage,
    })
  }
}
