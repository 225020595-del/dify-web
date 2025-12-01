import type { NextApiRequest, NextApiResponse } from 'next'

const DIFY_API_URL = 'https://api.dify.ai/v1'
const DIFY_API_KEY = 'app-IdeSY4rrZeKmutu2w0ERHbD2'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, type, topK } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // 调用 Dify 招聘查询 RAG Workflow（使用流式响应）
    const workflowResponse = await fetch(`${DIFY_API_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          query: query,
        },
        response_mode: 'streaming',
        user: userId,
      }),
    })

    if (!workflowResponse.ok) {
      const errorData = await workflowResponse.json().catch(() => ({ message: 'API 调用失败' }))
      throw new Error(errorData.message || `API 调用失败 (${workflowResponse.status})`)
    }

    // 处理流式响应
    const reader = workflowResponse.body?.getReader()
    const decoder = new TextDecoder()
    let answer = ''
    let evaluation = ''
    let jobsData: any[] = []
    let sources: any[] = []

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

          for (const line of lines) {
            try {
              const jsonStr = line.replace(/^data:\s*/, '')
              const data = JSON.parse(jsonStr)

              // 提取不同节点的输出
              if (data.event === 'node_finished' && data.data?.outputs) {
                const outputs = data.data.outputs
                
                // LLM 输出的回答
                if (outputs.text) {
                  answer = outputs.text
                }
                
                // 评估输出
                if (outputs.text_1) {
                  evaluation = outputs.text_1
                }
                
                // 工具节点返回的岗位数据
                if (outputs.result) {
                  try {
                    const resultData = typeof outputs.result === 'string' 
                      ? JSON.parse(outputs.result) 
                      : outputs.result
                    if (Array.isArray(resultData)) {
                      jobsData = resultData
                    }
                  } catch (e) {
                    console.log('解析岗位数据失败:', e)
                  }
                }
              }

              // 知识检索结果
              if (data.event === 'node_finished' && data.data?.title === '知识检索') {
                if (data.data.outputs?.result) {
                  sources = data.data.outputs.result.map((item: any, idx: number) => ({
                    docId: `doc_${idx}`,
                    excerpt: item.content || item.text || '',
                    score: item.score || 0,
                  }))
                }
              }
            } catch (e) {
              console.log('解析行失败:', line)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    }

    // 组装最终回答
    const finalAnswer = answer || evaluation || '未能获取到相关信息，请尝试其他查询。'

    // 格式化岗位数据
    const formattedJobs = jobsData.map((job, idx) => ({
      id: job.id || `job_${idx}`,
      title: job['岗位名称'] || job.title || '未知岗位',
      company: job['公司'] || job.company || '未知公司',
      location: job['地点'] || job.location || '未知',
      type: job['类型'] || job.type || '校招',
      applyUrl: job['申请链接'] || job.url || job.applyUrl,
      referralCode: job['内推码'] || job.referralCode,
      updateDate: job['更新时间'] || job.updateDate,
    }))

    res.status(200).json({
      answer: finalAnswer,
      jobs: formattedJobs,
      sources: sources,
    })
  } catch (error) {
    console.error('Query error:', error)
    const errorMessage = (error as Error).message
    res.status(500).json({ 
      error: '查询失败',
      message: errorMessage,
    })
  }
}
