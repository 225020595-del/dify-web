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

// ========== 简历分析组件 ==========
function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [selectedJob, setSelectedJob] = useState('')
  const [stats, setStats] = useState<MatchingStats | null>(null)
  const [loading, setLoading] = useState(false)

  const jobPositions = [
    'AI工程师', '后端开发', '前端开发', '产品经理', '数据分析师',
    '算法工程师', '测试工程师', '运维工程师', 'UI设计师', '项目经理'
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
      setStats(null)
    }
  }

  const analyzeResume = async () => {
    if (!resumeFile || !selectedJob) {
      alert('请上传简历并选择岗位')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('position', selectedJob)

    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('分析失败')
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error(error)
      alert('分析失败')
    } finally {
      setLoading(false)
    }
  }

  const CircleProgress = ({ score }: { score: number }) => {
    const percentage = Math.round((score / 10) * 100)
    let colorClass = percentage < 60 ? "text-red-500" : percentage < 80 ? "text-amber-500" : "text-emerald-500"
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-700" />
          <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={2 * Math.PI * 54 * (1 - percentage / 100)} className={colorClass} strokeLinecap="round" />
        </svg>
        <div className="absolute text-3xl font-bold text-white">{percentage}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            AI 简历智能分析
          </span>
        </h1>
        <p className="text-gray-300 text-lg">上传简历，AI 秒速匹配岗位适配度</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* 上传区域 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">上传简历</label>
            <div className="border-2 border-dashed border-gray-400 rounded-xl p-8 text-center bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" id="resume-upload" />
              <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                <UploadIcon />
                <p className="text-gray-300 mt-4">{resumeFile ? resumeFile.name : '点击或拖拽上传简历'}</p>
                <p className="text-sm text-gray-400 mt-2">支持 PDF, DOC, DOCX</p>
              </label>
            </div>
          </div>

          {/* 岗位选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">选择目标岗位</label>
            <div className="grid grid-cols-2 gap-3">
              {jobPositions.map(job => (
                <button
                  key={job}
                  onClick={() => setSelectedJob(job)}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedJob === job
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {job}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={analyzeResume}
          disabled={loading || !resumeFile || !selectedJob}
          className="mt-8 w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-4 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '🔄 AI 分析中...' : '🚀 开始分析'}
        </button>
      </div>

      {/* 分析结果 */}
      {stats && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 space-y-6">
          <div className="text-center">
            <CircleProgress score={stats.totalScore} />
            <h3 className="text-2xl font-bold text-white mt-4">综合匹配度</h3>
            <p className="text-gray-300 mt-2">{stats.totalSummary}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4">
              <h4 className="font-bold text-emerald-400 mb-2">💪 优势亮点 ({stats.strengths.score}/10)</h4>
              <p className="text-gray-200 text-sm">{stats.strengths.content}</p>
            </div>
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4">
              <h4 className="font-bold text-amber-400 mb-2">⚠️ 能力差距 ({stats.gaps.score}/10)</h4>
              <p className="text-gray-200 text-sm">{stats.gaps.content}</p>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
              <h4 className="font-bold text-blue-400 mb-2">📊 深度分析 ({stats.analysis.score}/10)</h4>
              <p className="text-gray-200 text-sm">{stats.analysis.content}</p>
            </div>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
            <h4 className="font-bold text-purple-400 mb-2">💡 优化建议</h4>
            <p className="text-gray-200">{stats.suggestion.content}</p>
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
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      } else {
        formData.append('text', inputText)
      }

      const response = await fetch('/api/jd/parse', { method: 'POST', body: formData })
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
