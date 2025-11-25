import { useState } from 'react'
import Head from 'next/head'

interface MatchingStats {
  totalJobs: number
  averageScore: number
  highMatch: number
  goodMatch: number
  fairMatch: number
  poorMatch: number
}

interface JobMatch {
  jobTitle: string
  score: number
  level: 'high' | 'good' | 'fair' | 'poor'
  details: string
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [jobSelection, setJobSelection] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('')
  const [showDashboard, setShowDashboard] = useState(false)
  const [stats, setStats] = useState<MatchingStats | null>(null)
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])

  // 解析 AI 返回的结果并提取统计数据
  const parseAnalysisResult = (text: string) => {
    const lines = text.split('\n')
    const matches: JobMatch[] = []
    let totalScore = 0

    // 简单的解析逻辑 - 根据实际 AI 输出格式调整
    lines.forEach(line => {
      // 假设格式类似：职位名称 - 匹配度：X分
      const match = line.match(/(.+?)[：:]\s*(\d+(\.\d+)?)\s*分/)
      if (match) {
        const score = parseFloat(match[2])
        const level = score >= 4 ? 'high' : score >= 3 ? 'good' : score >= 2 ? 'fair' : 'poor'
        matches.push({
          jobTitle: match[1].trim(),
          score,
          level,
          details: line
        })
        totalScore += score
      }
    })

    const stats: MatchingStats = {
      totalJobs: matches.length,
      averageScore: matches.length > 0 ? totalScore / matches.length : 0,
      highMatch: matches.filter(m => m.level === 'high').length,
      goodMatch: matches.filter(m => m.level === 'good').length,
      fairMatch: matches.filter(m => m.level === 'fair').length,
      poorMatch: matches.filter(m => m.level === 'poor').length,
    }

    setStats(stats)
    setJobMatches(matches)
    setShowDashboard(true)
  }

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
    '互联网：算法工程师', '互联网：数据分析师', '互联网：产品经理',
    '互联网：UI/UX设计师', '互联网：测试工程师', '互联网：运维工程师',
    '互联网：项目经理', '互联网：市场营销', '互联网：商务拓展',
    '互联网：客户成功', '互联网：内容运营', '互联网：用户运营',
    '互联网：数据运营', '互联网：社区运营', '互联网：新媒体运营',
    '互联网：SEO/SEM', '互联网：战略分析师', '互联网：商业分析',
    '互联网：财务分析', '互联网：法务专员', '互联网：行政专员',
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const analyzeResume = async () => {
    if (!file || !jobSelection) {
      alert('请上传简历文件并选择目标岗位')
      return
    }

    setLoading(true)
    setProgress(0)
    setAnalysisStage('文件上传中...')
    setResult('')
    setShowDashboard(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress(20)
      setAnalysisStage('正在解析简历...')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('文件上传失败')
      }

      const { file_id } = await uploadResponse.json()
      setProgress(40)
      setAnalysisStage('AI 分析中...')

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id,
          jobSelection,
          user: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`分析失败: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let progressValue = 40

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.event === 'agent_message' || data.event === 'message') {
                  fullText += data.answer
                  setResult(fullText)
                  progressValue = Math.min(95, progressValue + 5)
                  setProgress(progressValue)
                }

                if (data.event === 'workflow_finished' || data.event === 'message_end') {
                  setProgress(100)
                  setAnalysisStage('分析完成！')
                  // 解析结果并生成仪表盘
                  parseAnalysisResult(fullText)
                }
              } catch (e) {
                console.log('解析行跳过:', line)
              }
            }
          }
        }
      }
    } catch (error: any) {
      setResult(`分析失败: ${error.message}`)
      setProgress(0)
      setAnalysisStage('')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
        .then(() => alert('✓ 已复制到剪贴板'))
        .catch(() => alert('✗ 复制失败'))
    }
  }

  return (
    <>
      <Head>
        <title>AI 简历分析系统</title>
        <meta name="description" content="基于 Dify AI 的智能简历分析工具" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* 背景装饰 */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="fixed top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* 头部 */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
              🎯 LinkedIn Job Matching Analysis
            </h1>
            <p className="text-xl text-gray-300">
              Personalized Job Matching Results Based on AI Intelligence Assessment
            </p>
          </div>

          {/* 仪表盘显示 */}
          {showDashboard && stats && (
            <div className="max-w-6xl mx-auto mb-12">
              {/* 匹配结果概览 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🎯</span>
                  <h2 className="text-3xl font-bold text-white">Matching Results Overview</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* 总职位数 */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-6 border border-purple-400/30">
                    <div className="text-5xl font-bold text-white mb-2">{stats.totalJobs}</div>
                    <div className="text-purple-200">Total Jobs</div>
                  </div>

                  {/* 平均匹配分 */}
                  <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl p-6 border border-cyan-400/30">
                    <div className="text-5xl font-bold text-white mb-2">{stats.averageScore.toFixed(1)}</div>
                    <div className="text-cyan-200">Average Match Score</div>
                  </div>

                  {/* 高匹配 */}
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30">
                    <div className="text-5xl font-bold text-white mb-2">{stats.highMatch}</div>
                    <div className="text-green-200">High Match (4-5 pts)</div>
                  </div>

                  {/* 中等匹配 */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl p-6 border border-blue-400/30">
                    <div className="text-5xl font-bold text-white mb-2">{stats.goodMatch}</div>
                    <div className="text-blue-200">Good Match (3-4 pts)</div>
                  </div>

                  {/* 一般匹配 */}
                  <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-2xl p-6 border border-gray-400/30">
                    <div className="text-5xl font-bold text-white mb-2">{stats.fairMatch}</div>
                    <div className="text-gray-200">Fair Match (2-3 pts)</div>
                  </div>

                  {/* 低匹配 */}
                  <div className="bg-gradient-to-br from-gray-600/20 to-slate-600/20 rounded-2xl p-6 border border-gray-500/30">
                    <div className="text-5xl font-bold text-white mb-2">{stats.poorMatch}</div>
                    <div className="text-gray-300">Poor Match (0-2 pts)</div>
                  </div>
                </div>
              </div>

              {/* 评分权重配置 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">⚖️</span>
                  <h2 className="text-3xl font-bold text-white">Scoring Weights Configuration</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-xl p-5 border border-cyan-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔧</span>
                      <span className="text-white font-medium">Hard Skills</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-cyan-300">0.35</span>
                      <span className="text-cyan-200">(35%)</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-5 border border-blue-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💼</span>
                      <span className="text-white font-medium">Experience Level</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-blue-300">0.2</span>
                      <span className="text-blue-200">(20%)</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-5 border border-purple-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      <span className="text-white font-medium">Domain Knowledge</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-purple-300">0.2</span>
                      <span className="text-purple-200">(20%)</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-5 border border-pink-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎓</span>
                      <span className="text-white font-medium">Education & Certifications</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-pink-300">0.07</span>
                      <span className="text-pink-200">(7%)</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-5 border border-yellow-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💡</span>
                      <span className="text-white font-medium">Soft Skills</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-yellow-300">0.1</span>
                      <span className="text-yellow-200">(10%)</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-5 border border-green-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌐</span>
                      <span className="text-white font-medium">Language Fluency</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-green-300">0.08</span>
                      <span className="text-green-200">(8%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 上传区域 */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div
                className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-500/10 scale-105'
                    : 'border-gray-400 hover:border-cyan-500 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="mb-6">
                  <svg
                    className="mx-auto h-16 w-16 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-block bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  选择简历文件
                </label>
                
                <p className="mt-4 text-gray-300">
                  或拖拽文件到此处
                </p>
                
                {file && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-lg border border-cyan-400/30">
                    <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                    </svg>
                    <span className="text-cyan-300 font-medium">{file.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <label className="block text-cyan-300 font-semibold mb-3 text-lg">
                  选择目标岗位
                </label>
                <select
                  value={jobSelection}
                  onChange={(e) => setJobSelection(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border-2 border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                >
                  <option value="">请选择岗位...</option>
                  {jobOptions.map((job, index) => (
                    <option key={index} value={job} className="bg-slate-800">
                      {job}
                    </option>
                  ))}
                </select>
              </div>

              {loading && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-300 font-medium">{analysisStage}</span>
                    <span className="text-cyan-300 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={analyzeResume}
                disabled={loading || !file || !jobSelection}
                className="mt-8 w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-5 rounded-xl font-bold text-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-transform shadow-lg"
              >
                {loading ? '分析中...' : '🚀 开始 AI 分析'}
              </button>
            </div>

            {/* 原始文本结果（可折叠） */}
            {result && (
              <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    📄 详细分析报告
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    📋 复制结果
                  </button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                    {result}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
