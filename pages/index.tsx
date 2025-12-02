import { useState } from 'react'
import Head from 'next/head'

// ========== 共用 SVG 图标 ==========
const UploadIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ========== 类型定义 ==========
interface JDAnalysisResult {
  advise: string      // AI 准备建议
  score: number       // 评分 (0-1)
  reason: string      // 评分原因
  raw: string         // 原始 JD 文本
}

interface JobItem {
  id: string
  title: string
  company: string
  location: string
  type: string
  applyUrl?: string
  referralCode?: string
  updateDate?: string
}

interface QueryResult {
  answer: string
  jobs: JobItem[]
  sources: Array<{
    docId: string
    excerpt: string
    score: number
  }>
}

interface MatchingStats {
  totalScore: number
  totalSummary: string
  strengths: { score: number; content: string }
  gaps: { score: number; content: string }
  analysis: { score: number; content: string }
  suggestion: { content: string }
}

// ========== 简历分析组件 (Nov 25 成熟版本) ==========
function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [jobSelection, setJobSelection] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // 岗位选项列表（与 Dify Workflow 配置一致）
  const jobOptions = [
    '金融：银行金融科技类岗位', '金融：银行产品与研发类岗位', '金融：银行客户服务与销售岗',
    '金融：银行运营与支持岗', '金融：银行信贷与投资岗', '金融：银行风险管理岗',
    '金融：投行股权承做岗', '金融：机构销售岗', '金融：资管固收投资助理',
    '金融：研究助理岗', '金融：投资研究岗', '金融：产品研发岗',
    '金融：风险控制岗', '金融：量化交易员', '金融：基金运营岗',
    '金融：精算师', '金融：保险产品开发', '金融：核保核赔岗', '金融：保险投资岗',
    '快消：快消市场销售管培生', '快消：快消HR', '快消：快消产品供应链管培生',
    '快消：快消技术支持岗', '快消：快消品牌管理', '快消：快消产品研发', '快消：市场调研',
    '互联网：后端开发工程师', '互联网：前端开发工程师', '互联网：移动端开发工程师',
    '互联网：算法工程师', '互联网：测试开发工程师', '互联网：功能产品经理',
    '互联网：策略产品经理', '互联网：商业化产品经理', '互联网：AI产品经理',
    '互联网：UI设计师', '互联网：交互设计师', '互联网：数据科学家',
    '互联网：商业分析师', '互联网：电商运营', '互联网：内容运营',
    '互联网：产品运营', '互联网：市场营销', '互联网：用户研究',
    '互联网：投资分析师', '互联网：风险策略分析师', '互联网：人力资源',
    '互联网：行政专员', '互联网：战略分析师',
  ]

  // 渲染格式化结果
  const renderFormattedResult = (text: string) => {
    let cleanText = text
      .replace(/^##+ /gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/^[-•*]\s+/gm, '• ')
      .replace(/\n{3,}/g, '\n\n')
    
    const paragraphs = cleanText.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map((para, idx) => {
      const lines = para.split('\n').filter(l => l.trim())
      
      return (
        <div key={idx} className="mb-6 last:mb-0">
          {lines.map((line, i) => {
            const trimmed = line.trim()
            if (!trimmed) return null
            
            if (trimmed.startsWith('• ')) {
              return (
                <div key={i} className="flex items-start gap-3 group hover:bg-white/5 p-3 rounded-lg transition-all duration-200 mb-2">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                  <p className="text-gray-300 leading-relaxed flex-1">{trimmed.substring(2)}</p>
                </div>
              )
            }
            
            const isTitle = i === 0 && lines.length > 1 && !trimmed.includes('：') && trimmed.length < 50
            
            if (isTitle) {
              return (
                <div key={i} className="flex items-center gap-3 mb-4 pb-3 border-b border-teal-500/30">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-400">{trimmed}</h2>
                </div>
              )
            }
            
            return <p key={i} className="text-gray-300 leading-relaxed mb-2">{trimmed}</p>
          })}
        </div>
      )
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const fileName = selectedFile.name.toLowerCase()
      const supportedExtensions = ['.txt', '.md', '.pdf', '.html', '.xlsx', '.xls', '.doc', '.docx', '.csv', '.pptx', '.ppt', '.xml', '.epub']
      const isSupported = supportedExtensions.some(ext => fileName.endsWith(ext))
      
      if (isSupported) {
        setFile(selectedFile)
        setResult('')
      } else {
        alert('请上传支持的文档格式：PDF、Word、Excel、PowerPoint、Markdown、TXT 等')
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const fileName = droppedFile.name.toLowerCase()
      const supportedExtensions = ['.txt', '.md', '.pdf', '.html', '.xlsx', '.xls', '.doc', '.docx', '.csv', '.pptx', '.ppt', '.xml', '.epub']
      const isSupported = supportedExtensions.some(ext => fileName.endsWith(ext))
      
      if (isSupported) {
        setFile(droppedFile)
        setResult('')
      } else {
        alert('请上传支持的文档格式')
      }
    }
  }

  const analyzeResume = async () => {
    if (!file || !jobSelection) {
      alert('请上传简历并选择岗位')
      return
    }

    setLoading(true)
    setResult('')

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const apiKey = process.env.NEXT_PUBLIC_APP_KEY

    if (!apiUrl || !apiKey) {
      alert('系统配置错误，请联系管理员')
      setLoading(false)
      return
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`

    try {
      // 上传文件
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('user', userId)

      const uploadResponse = await fetch(`${apiUrl}/files/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: uploadFormData,
        cache: 'no-store',
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ message: '文件上传失败' }))
        throw new Error(errorData.message || `文件上传失败 (${uploadResponse.status})`)
      }

      const uploadData = await uploadResponse.json()
      await new Promise(resolve => setTimeout(resolve, 500))

      // 调用 Workflow
      const workflowResponse = await fetch(`${apiUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            CV: {
              type: 'document',
              transfer_method: 'local_file',
              upload_file_id: uploadData.id,
            },
            job_selection: jobSelection,
          },
          response_mode: 'streaming',
          user: userId,
        }),
        cache: 'no-store',
      })

      if (!workflowResponse.ok) {
        const errorData = await workflowResponse.json().catch(() => ({ message: '分析请求失败' }))
        throw new Error(errorData.message || `分析请求失败 (${workflowResponse.status})`)
      }

      // 处理流式响应
      const reader = workflowResponse.body?.getReader()
      const decoder = new TextDecoder()
      let evaluation = ''
      let evaluator = ''
      let totalScore = 0
      let scores = { strengths: 0, gaps: 0, analysis: 0, potential: 0 }
      
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
                
                if (data.event === 'node_finished' && data.data?.outputs) {
                  if (data.data.outputs.text) evaluation = data.data.outputs.text
                  if (data.data.outputs.text_1) evaluator = data.data.outputs.text_1
                  
                  // 提取评分数据（如果返回JSON格式）
                  try {
                    const scoreData = JSON.parse(data.data.outputs.text || data.data.outputs.text_1 || '{}')
                    if (scoreData.total_score) totalScore = parseFloat(scoreData.total_score)
                    if (scoreData.scores) scores = scoreData.scores
                  } catch (e) {
                    // 不是JSON格式，从文本中提取分数
                    const scoreMatch = (evaluation + evaluator).match(/总体匹配度[：:]\s*(\d+\.?\d*)/i) || 
                                      (evaluation + evaluator).match(/得分[：:]\s*(\d+\.?\d*)/i)
                    if (scoreMatch) totalScore = parseFloat(scoreMatch[1])
                  }
                }
                
                if (data.event === 'workflow_finished') break
              } catch (e) {
                console.log('解析行失败:', line)
              }
            }
            // 不再实时更新结果，只在最后显示完整报告
          }
        } finally {
          reader.releaseLock()
        }
      }
      
      // 构建完整结果 - 只过滤纯 JSON 格式的中间数据，保留完整报告
      const isOnlyJson = (text: string): boolean => {
        if (!text) return true
        const trimmed = text.trim()
        // 检查是否是纯 JSON 对象（以 { 开头以 } 结尾，且能解析）
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            JSON.parse(trimmed)
            return true // 是纯 JSON，不是报告
          } catch (e) {
            return false
          }
        }
        // 检查是否只是 ```json ... ``` 代码块，没有其他文字
        const withoutCodeBlock = trimmed.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim()
        if (withoutCodeBlock.length < 10 && trimmed.includes('```')) {
          return true // 只有代码块，没有报告文字
        }
        return false
      }
      
      // 只有当内容不是纯 JSON 时才使用
      const finalEvaluation = isOnlyJson(evaluation) ? '' : evaluation
      const finalEvaluator = isOnlyJson(evaluator) ? '' : evaluator
      const fullResult = `${finalEvaluation}${finalEvaluator ? '\n\n---\n\n' + finalEvaluator : ''}`
      
      if (fullResult.trim()) {
        setResult(fullResult)
      } else {
        // 如果两个都是 JSON，尝试直接显示原始内容（可能是正常报告）
        const rawResult = `${evaluation}${evaluator ? '\n\n---\n\n' + evaluator : ''}`
        setResult(rawResult.trim() || '✅ 分析完成，但未生成文本报告。请检查 Dify 工作流配置。')
      }

    } catch (error) {
      console.error('Error:', error)
      const errorMessage = (error as Error).message
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setResult('❌ 网络连接失败\n\n可能原因：网络不稳定或被防火墙拦截')
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        setResult('❌ 权限验证失败\n\n请确保 API Key 正确且有效')
      } else {
        setResult(`❌ 分析出错：${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            AI 简历智能分析
          </span>
        </h1>
        <p className="text-gray-300 text-lg">基于先进 AI 技术，为您提供专业的简历优化建议</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        {/* 岗位选择 */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-3">选择目标岗位：</label>
          <select
            value={jobSelection}
            onChange={(e) => setJobSelection(e.target.value)}
            className="w-full p-4 bg-slate-900/50 border-2 border-teal-500/30 rounded-xl focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-gray-100"
          >
            <option value="">-- 请选择岗位 --</option>
            {jobOptions.map((job, index) => (
              <option key={index} value={job}>{job}</option>
            ))}
          </select>
        </div>

        {/* 文件上传 */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive ? 'border-teal-400 bg-teal-500/20' : 'border-teal-500/30 bg-slate-900/50 hover:border-teal-500/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="resume-file-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.pptx,.ppt,.html,.csv,.xml,.epub"
            onChange={handleFileChange}
          />
          
          {!file ? (
            <label htmlFor="resume-file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <UploadIcon />
                <div>
                  <p className="text-xl text-white font-semibold mb-2">点击上传或拖拽文件到此处</p>
                  <p className="text-gray-400 text-sm">支持 PDF、Word、Excel、PowerPoint、Markdown、TXT 等文档格式</p>
                  <p className="text-gray-500 text-xs mt-2">文件大小限制：10MB</p>
                </div>
              </div>
            </label>
          ) : (
            <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-300 transition-colors">
                <XIcon />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={analyzeResume}
          disabled={loading || !file || !jobSelection}
          className="mt-6 w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-5 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
        >
          {loading ? '🔄 AI 分析中...' : '🚀 开始智能分析'}
        </button>
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="bg-gradient-to-br from-slate-900/90 to-teal-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-teal-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-300">AI 评估报告</h2>
                <p className="text-gray-400 text-sm mt-1">基于您的简历和目标岗位生成</p>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result)
                alert('✅ 报告已复制到剪贴板！')
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all flex items-center gap-2"
            >
              📋 复制报告
            </button>
          </div>

          {/* 详细报告内容 */}
          <div className="relative z-10 bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-100 leading-relaxed">
                {renderFormattedResult(result)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ========== JD 解析组件 ==========
function JDParser() {
  const [inputText, setInputText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<JDAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setInputText('')
      setResult(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setInputText('')
      setResult(null)
    }
  }

  const parseJD = async () => {
    if (!inputText && !file) {
      alert('请输入 JD 文本或上传文件')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      }
      // 只在有实际内容时才添加 text 字段
      if (inputText && inputText.trim()) {
        formData.append('text', inputText.trim())
      }

      const response = await fetch('/api/jd/parse', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || '解析失败')
      }

      const data = await response.json()
      setResult({
        advise: data.advise || '',
        score: data.score || 0,
        reason: data.reason || '',
        raw: data.raw || '',
      })
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : '解析失败')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    const text = `【AI 准备建议】\n${result.advise}\n\n【评分】${(result.score * 100).toFixed(0)}%\n【评分原因】${result.reason}`
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  // 格式化显示建议文本
  const formatAdvise = (text: string) => {
    if (!text) return null
    return text
      .split('\n')
      .map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <br key={i} />
        // 处理标题行
        if (trimmed.match(/^#+\s/) || trimmed.match(/^\d+\.\s*\*\*/) || trimmed.match(/^##/)) {
          const clean = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '')
          return <h3 key={i} className="text-lg font-bold text-purple-300 mt-4 mb-2">{clean}</h3>
        }
        // 处理列表项
        if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
          const clean = trimmed.replace(/^[-•*]\s+/, '• ').replace(/\*\*/g, '')
          return <p key={i} className="text-gray-200 ml-4 my-1">{clean}</p>
        }
        // 普通段落
        return <p key={i} className="text-gray-200 my-2">{trimmed.replace(/\*\*/g, '')}</p>
      })
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            JD 智能分析助手
          </span>
        </h1>
        <p className="text-gray-300 text-lg">AI 分析职位要求，为您提供针对性准备建议</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* 文本输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">粘贴 JD 文本</label>
            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setFile(null); setResult(null); }}
              placeholder="粘贴完整的职位描述..."
              className="w-full h-64 bg-white/10 border border-gray-400 rounded-xl p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 文件上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">或上传 JD 文件</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center h-64 flex flex-col justify-center transition-all ${
                dragActive ? 'border-purple-400 bg-purple-500/20' : 'border-gray-400 bg-white/5 hover:bg-white/10'
              }`}
            >
              <input type="file" onChange={handleFileChange} accept=".txt,.pdf,.doc,.docx" className="hidden" id="jd-upload" />
              <label htmlFor="jd-upload" className="cursor-pointer flex flex-col items-center">
                <UploadIcon />
                <p className="text-gray-300 mt-4">{file ? file.name : '拖拽或点击上传'}</p>
                <p className="text-sm text-gray-400 mt-2">支持 TXT, PDF, DOC, DOCX</p>
              </label>
              {file && (
                <button onClick={() => setFile(null)} className="mt-4 text-red-400 hover:text-red-300 flex items-center justify-center gap-2">
                  <XIcon /> 移除文件
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={parseJD}
          disabled={loading || (!inputText && !file)}
          className="mt-8 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '🔄 AI 分析中（可能需要30秒）...' : '🚀 开始分析'}
        </button>
      </div>

      {/* 分析结果 */}
      {result && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 space-y-6">
          {/* 评分卡片 */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* 评分圆环 */}
            <div className="flex-shrink-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl p-6 flex flex-col items-center justify-center min-w-[200px]">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="url(#scoreGradient)" 
                    strokeWidth="12" 
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${result.score * 351.86} 351.86`}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{(result.score * 100).toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-gray-300 mt-3 text-center">建议完整度评分</p>
            </div>

            {/* 评分原因 */}
            <div className="flex-1 bg-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-3">📊 评分说明</h3>
              <p className="text-gray-200 leading-relaxed">{result.reason || '暂无评分说明'}</p>
            </div>
          </div>

          {/* 准备建议 */}
          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-300">📝 AI 准备建议</h3>
              <button 
                onClick={copyToClipboard}
                className="bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 px-4 py-2 rounded-lg transition-all text-sm"
              >
                📋 复制全部
              </button>
            </div>
            <div className="text-gray-200 leading-relaxed max-h-[600px] overflow-y-auto pr-2">
              {formatAdvise(result.advise)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ========== 招聘查询组件 ==========
function RecruitAgent() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [queryType, setQueryType] = useState<'company' | 'industry' | 'auto'>('auto')

  const suggestedQueries = [
    '阿里巴巴有哪些实习岗位？',
    '互联网行业的后端开发岗位',
    '字节跳动的内推码',
    '腾讯秋招算法岗位',
    '金融行业有哪些优质公司？',
    '快消行业市场营销岗位',
  ]

  const handleSearch = async () => {
    if (!query.trim()) {
      alert('请输入查询内容')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/recruit/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          type: queryType === 'auto' ? undefined : queryType,
          topK: 10,
        }),
      })

      if (!response.ok) throw new Error('查询失败')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      alert('查询失败')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert('✅ 已复制到剪贴板'))
  }

  // 清理文本中的 Markdown 格式符号
  const cleanText = (text: string) => {
    return text
      .replace(/\*\*/g, '')      // 去掉 **粗体**
      .replace(/\*/g, '')        // 去掉 *斜体*
      .replace(/`/g, '')         // 去掉 `代码`
      .replace(/#+\s*/g, '')     // 去掉 # 标题
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // 转换链接为纯文本
      .trim()
  }

  // 格式化 AI 回答，美化输出
  const formatAnswer = (text: string) => {
    if (!text) return null
    
    // 分割成段落处理
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let currentJobBlock: string[] = []
    let jobIndex = 0
    
    const flushJobBlock = () => {
      if (currentJobBlock.length > 0) {
        elements.push(
          <div key={`job-${jobIndex}`} className="bg-white/5 rounded-xl p-4 mb-4 border-l-4 border-blue-400">
            {currentJobBlock.map((line, i) => {
              const trimmed = line.trim()
              // 岗位标题（以数字开头或【】包裹）
              if (trimmed.match(/^\d+\.\s*/) || trimmed.match(/^【.+】/) || trimmed.match(/^\*\*.+\*\*/)) {
                const title = cleanText(trimmed.replace(/^\d+\.\s*/, '').replace(/^【/, '').replace(/】$/, ''))
                return <h4 key={i} className="text-lg font-bold text-blue-300 mb-3">{title}</h4>
              }
              // 属性行（以 - 或 • 或 ** 开头）
              if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\*\*[^*]+\*\*[：:]/)) {
                const content = cleanText(trimmed.replace(/^[-•]\s*/, ''))
                // 检测是否有标签（如 岗位类别：、工作地点：等）
                const labelMatch = content.match(/^([^：:]+)[：:]\s*(.*)$/)
                if (labelMatch) {
                  const label = cleanText(labelMatch[1])
                  const value = cleanText(labelMatch[2])
                  return (
                    <div key={i} className="flex items-start gap-3 my-2">
                      <span className="text-cyan-400 font-medium min-w-[70px] text-sm">{label}</span>
                      <span className="text-gray-200 flex-1">{value}</span>
                    </div>
                  )
                }
                return <p key={i} className="text-gray-300 ml-2 my-1">• {content}</p>
              }
              // 普通行
              const cleaned = cleanText(trimmed)
              return cleaned ? <p key={i} className="text-gray-300 my-1">{cleaned}</p> : null
            })}
          </div>
        )
        currentJobBlock = []
        jobIndex++
      }
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // 空行：结束当前岗位块
      if (!trimmed) {
        flushJobBlock()
        continue
      }
      
      // 检测是否是岗位开始（数字+点+标题 或 【标题】 或 **标题**）
      if (trimmed.match(/^\d+\.\s*/) || trimmed.match(/^【[^】]+】/) || (trimmed.match(/^\*\*[^*]+\*\*$/) && !trimmed.includes('：'))) {
        flushJobBlock()
        currentJobBlock.push(line)
        continue
      }
      
      // 检测是否是属性行（在岗位块内）
      if (currentJobBlock.length > 0 && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\*\*/))) {
        currentJobBlock.push(line)
        continue
      }
      
      // 其他情况：如果有正在进行的岗位块，添加进去；否则作为普通段落
      if (currentJobBlock.length > 0) {
        currentJobBlock.push(line)
      } else {
        // 普通段落
        const cleaned = cleanText(trimmed)
        if (cleaned.startsWith('根据') || cleaned.startsWith('以下是') || cleaned.includes('招聘信息') || cleaned.includes('岗位信息')) {
          elements.push(
            <p key={`intro-${i}`} className="text-gray-300 mb-4 pb-3 border-b border-white/10">{cleaned}</p>
          )
        } else if (trimmed.match(/^#+\s/)) {
          // Markdown 标题
          elements.push(<h3 key={`h-${i}`} className="text-xl font-bold text-blue-300 mt-4 mb-3">{cleaned}</h3>)
        } else {
          elements.push(<p key={`p-${i}`} className="text-gray-300 my-2">{cleaned}</p>)
        }
      }
    }
    
    // 处理最后一个岗位块
    flushJobBlock()
    
    return elements
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            智能招聘查询 Agent
          </span>
        </h1>
        <p className="text-gray-300 text-lg">基于 RAG 的智能招聘信息检索系统</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        {/* 查询类型 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-3">查询类型</label>
          <div className="flex gap-4">
            {[
              { value: 'auto', label: '🤖 智能识别', desc: '自动判断查询类型' },
              { value: 'company', label: '🏢 公司查询', desc: '查找特定公司岗位' },
              { value: 'industry', label: '🏭 行业查询', desc: '按行业筛选岗位' },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setQueryType(type.value as any)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  queryType === type.value
                    ? 'border-blue-400 bg-blue-500/20'
                    : 'border-gray-600 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="font-bold text-white mb-1">{type.label}</div>
                <div className="text-sm text-gray-400">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-3">输入查询</label>
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="例如：阿里巴巴有哪些实习岗位？"
              className="flex-1 bg-white/10 border border-gray-400 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-8 py-3 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '🔄 查询中...' : '🔍 搜索'}
            </button>
          </div>
        </div>

        {/* 推荐查询 */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">快速查询</label>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map(q => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-lg transition-all text-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 查询结果 */}
      {result && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 space-y-6">
          {/* AI 回答 */}
          {result.answer && (
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-300">🤖 AI 智能回答</h3>
                <button 
                  onClick={() => copyToClipboard(result.answer)}
                  className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 px-4 py-2 rounded-lg transition-all text-sm"
                >
                  📋 复制全部
                </button>
              </div>
              <div className="max-h-[600px] overflow-y-auto pr-2">
                {formatAnswer(result.answer)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ========== 辅助组件 ==========
const InfoCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
    <h4 className="text-sm text-gray-400 mb-2">{title}</h4>
    <p className="text-white font-medium">{value || '-'}</p>
  </div>
)

const ListCard = ({ title, items, icon }: { title: string; items: string[]; icon: string }) => (
  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
    <h4 className="text-lg font-bold text-white mb-3">{icon} {title}</h4>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-gray-200 flex items-start gap-2">
          <span className="text-purple-400 mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
)

const TagCard = ({ title, tags }: { title: string; tags: string[] }) => (
  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
    <h4 className="text-lg font-bold text-white mb-3">🏷️ {title}</h4>
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <span key={tag} className="bg-purple-500/30 border border-purple-400/50 text-purple-200 px-3 py-1 rounded-full text-sm">
          {tag}
        </span>
      ))}
    </div>
  </div>
)

// ========== 主页面组件 ==========
export default function IntegratedHome() {
  const [activeTab, setActiveTab] = useState<'resume' | 'jd' | 'recruit'>('resume')

  return (
    <>
      <Head>
        <title>AI 智能助手 - 简历分析 | JD 解析 | 招聘查询</title>
        <meta name="description" content="基于 Dify AI 的三合一智能招聘助手" />
      </Head>

      {/* 背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6bS0yMCAwYzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Tab 切换按钮 */}
          <div className="mb-12 flex justify-center gap-6 animate-fade-in">
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all transform ${
                activeTab === 'resume'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-2xl scale-110'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
              }`}
            >
              📄 简历分析
            </button>
            <button
              onClick={() => setActiveTab('jd')}
              className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all transform ${
                activeTab === 'jd'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl scale-110'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
              }`}
            >
              🔍 JD 解析
            </button>
            <button
              onClick={() => setActiveTab('recruit')}
              className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all transform ${
                activeTab === 'recruit'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl scale-110'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
              }`}
            >
              💼 招聘查询
            </button>
          </div>

          {/* 内容区域 */}
          <div className="animate-fade-in">
            {activeTab === 'resume' && <ResumeAnalyzer />}
            {activeTab === 'jd' && <JDParser />}
            {activeTab === 'recruit' && <RecruitAgent />}
          </div>

          {/* 页脚 */}
          <div className="mt-16 text-center text-gray-400 text-sm">
            <p>Powered by Dify AI · 智能招聘助手 v1.0</p>
          </div>
        </div>
      </main>
    </>
  )
}
