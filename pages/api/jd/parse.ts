import type { NextApiRequest, NextApiResponse } from 'next'

const DIFY_API_URL = 'https://api.dify.ai/v1'
const DIFY_API_KEY = 'app-PKM5GNF2sDXi7LkQkU4oCTDg'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, file } = req.body
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
          jd_text: text || '',
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
    
    // 从 Workflow 输出中提取解析结果
    let parsedJD = {
      title: '',
      company: '',
      location: '',
      salary: '',
      experience: '',
      education: '',
      responsibilities: [] as string[],
      requirements: [] as string[],
      tags: [] as string[],
      benefits: [] as string[],
    }

    // 解析 Workflow 返回的数据
    if (workflowData.data?.outputs) {
      const output = workflowData.data.outputs.text || workflowData.data.outputs.result || ''
      
      try {
        // 尝试解析为 JSON
        const parsed = JSON.parse(output)
        parsedJD = { ...parsedJD, ...parsed }
      } catch (e) {
        // 如果不是 JSON，使用文本解析
        parsedJD = parseJDFromText(output, text || '')
      }
    }

    res.status(200).json({
      success: true,
      parsed: parsedJD,
      raw: text || '',
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

// 从文本中解析 JD 信息的辅助函数
function parseJDFromText(aiOutput: string, originalText: string) {
  const result = {
    title: extractField(aiOutput, ['岗位名称', '职位名称', 'title', '岗位']) || '未知岗位',
    company: extractField(aiOutput, ['公司', 'company', '企业']) || '未知公司',
    location: extractField(aiOutput, ['地点', '工作地点', 'location', '城市']) || '未知',
    salary: extractField(aiOutput, ['薪资', '薪酬', 'salary', '待遇']) || '面议',
    experience: extractField(aiOutput, ['经验', '工作经验', 'experience']) || '不限',
    education: extractField(aiOutput, ['学历', 'education']) || '不限',
    responsibilities: extractList(aiOutput, ['岗位职责', '工作职责', '职责', 'responsibilities']),
    requirements: extractList(aiOutput, ['任职要求', '岗位要求', '要求', 'requirements']),
    tags: extractTags(aiOutput + ' ' + originalText),
    benefits: extractList(aiOutput, ['福利', '待遇', 'benefits']),
  }
  return result
}

function extractField(text: string, keywords: string[]): string {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[：:]\\s*([^\\n]+)`, 'i')
    const match = text.match(regex)
    if (match) return match[1].trim()
  }
  return ''
}

function extractList(text: string, keywords: string[]): string[] {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[：:]([\\s\\S]*?)(?=\\n\\n|$)`, 'i')
    const match = text.match(regex)
    if (match) {
      return match[1]
        .split(/\\n|[1-9]\\.|•|-/)
        .map(item => item.trim())
        .filter(item => item.length > 5)
    }
  }
  return []
}

function extractTags(text: string): string[] {
  const commonTags = ['Java', 'Python', 'Go', 'JavaScript', 'TypeScript', 'React', 'Vue', 'MySQL', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'AWS', 'Git']
  const tags = commonTags.filter(tag => text.includes(tag))
  return tags.length > 0 ? tags : ['技术岗位']
}
