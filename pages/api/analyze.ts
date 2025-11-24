import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import FormData from 'form-data'

type Data = {
  result?: string
  error?: string
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const apiKey = process.env.NEXT_PUBLIC_APP_KEY

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: '服务器配置错误' })
  }

  try {
    // 解析上传的文件
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    })

    const [fields, files] = await form.parse(req)
    const file = files.file?.[0]

    if (!file) {
      return res.status(400).json({ error: '请上传文件' })
    }

    // 使用 form-data 创建表单
    const formData = new FormData()
    const fileStream = fs.createReadStream(file.filepath)
    formData.append('file', fileStream, {
      filename: file.originalFilename || 'resume.pdf',
      contentType: file.mimetype || 'application/pdf',
    })
    formData.append('user', 'user-' + Date.now())

    // 调用 Dify 文件上传 API
    const uploadResponse = await fetch(`${apiUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData as any,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Upload error:', errorText)
      throw new Error(`File upload failed: ${uploadResponse.status} - ${errorText}`)
    }

    const uploadData = await uploadResponse.json()
    console.log('Upload success:', uploadData)
    const fileId = uploadData.id

    // 使用文件 ID 调用 chat API
    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: '请分析这份简历',
        response_mode: 'blocking',
        user: 'user-' + Date.now(),
        files: [
          {
            type: 'document',
            transfer_method: 'local_file',
            upload_file_id: fileId,
          }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Chat error:', errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Chat response:', data)
    const result = data.answer || data.result || '未获取到分析结果'

    // 清理临时文件
    fs.unlinkSync(file.filepath)

    res.status(200).json({ result })
  } catch (error) {
    console.error('Dify API Error:', error)
    res.status(500).json({ error: '调用 AI 服务失败：' + (error as Error).message })
  }
}
