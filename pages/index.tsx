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
interface ParsedJD {
  title: string
  company: string
  location: string
  salary: string
  experience: string
  education: string
  responsibilities: string[]
  requirements: string[]
  tags: string[]
  benefits: string[]
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
    '互联网：商业分析师(BA/DS)', '互联网：电商运营', '互联网：内容运营',
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
                }
                
                if (data.event === 'workflow_finished') break
              } catch (e) {
                console.log('解析行失败:', line)
              }
            }
            
            if (evaluation || evaluator) {
              const partialResult = `${evaluation}${evaluator ? '\n\n---\n\n' + evaluator : ''}`
              if (partialResult) setResult(partialResult)
            }
          }
        } finally {
          reader.releaseLock()
        }
      }
      
      const fullResult = evaluation || evaluator 
        ? `${evaluation}${evaluator ? '\n\n---\n\n' + evaluator : ''}`
        : '未获取到分析结果，请检查 Workflow 配置'
      
      setResult(fullResult)

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
          
          <div className="flex items-center mb-8 relative z-10">
            <div className="flex items-center gap-3 flex-1">
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
                navigator.clipboard.writeText(result).then(() => alert('已复制到剪贴板'))
              }}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all"
            >
              📋 复制报告
            </button>
          </div>
          
          <div className="relative z-10 bg-slate-950/50 rounded-xl p-8 border border-teal-500/20">
            {renderFormattedResult(result)}
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
  const [parsedJD, setParsedJD] = useState<ParsedJD | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setInputText('')
      setParsedJD(null)
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
      setParsedJD(null)
    }
  }

  const parseJD = async () => {
    if (!inputText && !file) {
      alert('请输入 JD 文本或上传文件')
      return
    }

    setLoading(true)
    setParsedJD(null)

    try {
      let textContent = inputText
      
      // 如果上传了文件，读取文件内容
      if (file) {
        textContent = await file.text()
      }

      const response = await fetch('/api/jd/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textContent,
        }),
      })
      
      if (!response.ok) throw new Error('解析失败')

      const data = await response.json()
      setParsedJD(data.parsed)
    } catch (error) {
      console.error(error)
      alert('解析失败')
    } finally {
      setLoading(false)
    }
  }

  const exportAsJSON = () => {
    if (!parsedJD) return
    const dataStr = JSON.stringify(parsedJD, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', 'jd_parsed.json')
    linkElement.click()
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            JD 智能解析器
          </span>
        </h1>
        <p className="text-gray-300 text-lg">AI 自动提取职位描述关键信息</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* 文本输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">粘贴 JD 文本</label>
            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setFile(null); setParsedJD(null); }}
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
          {loading ? '🔄 AI 解析中...' : '🚀 开始解析'}
        </button>
      </div>

      {/* 解析结果 */}
      {parsedJD && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">解析结果</h2>
            <button onClick={exportAsJSON} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all">
              📥 导出 JSON
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InfoCard title="职位名称" value={parsedJD.title} />
            <InfoCard title="公司名称" value={parsedJD.company} />
            <InfoCard title="工作地点" value={parsedJD.location} />
            <InfoCard title="薪资范围" value={parsedJD.salary} />
            <InfoCard title="工作经验" value={parsedJD.experience} />
            <InfoCard title="学历要求" value={parsedJD.education} />
          </div>

          <ListCard title="岗位职责" items={parsedJD.responsibilities} icon="📋" />
          <ListCard title="任职要求" items={parsedJD.requirements} icon="✅" />
          <TagCard title="技能标签" tags={parsedJD.tags} />
          <ListCard title="福利待遇" items={parsedJD.benefits} icon="🎁" />
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

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert('✅ 已复制到剪贴板'))
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
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-3">🤖 AI 智能回答</h3>
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
            </div>
          )}

          {/* 岗位列表 */}
          {result.jobs && result.jobs.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">📋 相关岗位 ({result.jobs.length})</h3>
              <div className="space-y-4">
                {result.jobs.map(job => (
                  <div key={job.id} className="bg-white/10 rounded-xl p-5 border border-white/20 hover:border-blue-400 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-white">{job.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{job.company} · {job.location}</p>
                      </div>
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">{job.type}</span>
                    </div>
                    {job.referralCode && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-300">内推码:</span>
                        <code className="bg-gray-800 text-green-400 px-3 py-1 rounded">{job.referralCode}</code>
                        <button onClick={() => copyCode(job.referralCode!)} className="text-blue-400 hover:text-blue-300 text-sm">
                          📋 复制
                        </button>
                      </div>
                    )}
                    {job.applyUrl && (
                      <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm">
                        🔗 查看详情 →
                      </a>
                    )}
                  </div>
                ))}
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
