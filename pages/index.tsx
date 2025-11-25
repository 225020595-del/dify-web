import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [jobSelection, setJobSelection] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('')

  // 清理并显示纯文本结果（去除 Markdown 符号）
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
                  <p className="text-gray-300 leading-relaxed flex-1">
                    {trimmed.substring(2)}
                  </p>
                </div>
              )
            }
            
            const isTitle = i === 0 && lines.length > 1 && !trimmed.includes('：') && trimmed.length < 50
            
            if (isTitle) {
              return (
                <div key={i} className="flex items-center gap-3 mb-4 pb-3 border-b border-teal-500/30">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-400">
                    {trimmed}
                  </h2>
                </div>
              )
            }
            
            return (
              <p key={i} className="text-gray-300 leading-relaxed mb-2">
                {trimmed}
              </p>
            )
          })}
        </div>
      )
    })
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
    '互联网：战略分析师',
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const fileName = selectedFile.name.toLowerCase()
      
      const supportedExtensions = [
        '.txt', '.md', '.mdx', '.markdown', '.pdf', '.html', 
        '.xlsx', '.xls', '.doc', '.docx', '.csv', '.eml', 
        '.msg', '.pptx', '.ppt', '.xml', '.epub'
      ]
      
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
      
      const supportedExtensions = [
        '.txt', '.md', '.mdx', '.markdown', '.pdf', '.html', 
        '.xlsx', '.xls', '.doc', '.docx', '.csv', '.eml', 
        '.msg', '.pptx', '.ppt', '.xml', '.epub'
      ]
      
      const isSupported = supportedExtensions.some(ext => fileName.endsWith(ext))
      
      if (isSupported) {
        setFile(droppedFile)
        setResult('')
      } else {
        alert('请上传支持的文档格式：PDF、Word、Excel、PowerPoint、Markdown、TXT 等')
      }
    }
  }

  const analyzeResume = async () => {
    if (!file) {
      alert('请先上传简历文件')
      return
    }

    if (!jobSelection) {
      alert('请选择目标岗位')
      return
    }

    setLoading(true)
    setResult('')
    setProgress(0)
    setAnalysisStage('正在上传文件...')

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const apiKey = process.env.NEXT_PUBLIC_APP_KEY

    if (!apiUrl || !apiKey) {
      alert('系统配置错误，请联系管理员')
      setLoading(false)
      return
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`

    try {
      setProgress(20)
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('user', userId)

      const uploadResponse = await fetch(`${apiUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: uploadFormData,
        cache: 'no-store',
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ message: '文件上传失败' }))
        throw new Error(errorData.message || `文件上传失败 (${uploadResponse.status})`)
      }

      const uploadData = await uploadResponse.json()
      setProgress(40)
      setAnalysisStage('文件上传成功，正在 AI 分析中...')

      await new Promise(resolve => setTimeout(resolve, 500))

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

      setProgress(60)
      setAnalysisStage('AI 正在生成评估报告...')

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
                
                if (data.event === 'workflow_finished') {
                  setProgress(100)
                  break
                }
              } catch (e) {
                console.log('解析行失败:', line)
              }
            }
            
            if (evaluation || evaluator) {
              const partialResult = evaluation || evaluator 
                ? `${evaluation}${evaluator ? '\n\n---\n\n' + evaluator : ''}`
                : ''
              if (partialResult) setResult(partialResult)
              setProgress(Math.min(80 + (evaluation.length / 100), 95))
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
      setAnalysisStage('分析完成！')
      setProgress(100)

    } catch (error) {
      console.error('Error:', error)
      const errorMessage = (error as Error).message
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setResult('❌ 网络连接失败\n\n可能原因：\n• 网络不稳定或被防火墙拦截\n• Dify API 服务暂时不可用\n• CORS 跨域问题\n\n建议：\n1. 检查网络连接\n2. 稍后重试\n3. 查看浏览器控制台获取详细错误信息')
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        setResult('❌ 权限验证失败\n\n请确保：\n• API Key 正确且有效\n• API Key 有访问该 Workflow 的权限\n• 在 Vercel 正确配置了环境变量')
      } else {
        setResult(`❌ 分析出错：${errorMessage}\n\n请确保：\n1. 已在 Vercel 配置环境变量\n2. Dify Workflow 支持文件上传\n3. API Key 有效且有权限\n4. 网络连接正常`)
      }
    } finally {
      setLoading(false)
      setProgress(0)
      setAnalysisStage('')
    }
  }

  const removeFile = () => {
    setFile(null)
    setResult('')
  }

  return (
    <>
      <Head>
        <title>AI 简历分析助手 - 智能职业规划</title>
        <meta name="description" content="基于 Dify AI 的智能简历分析工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* 背景动画层 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6bS0yMCAwYzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative min-h-screen py-12 px-4 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          {/* 头部 */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 mb-6 shadow-lg shadow-teal-500/50">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
                AI 简历分析助手
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              基于 Dify AI 技术，为您提供专业的简历评估与职业建议
            </p>
          </div>

          {/* 主要内容卡片 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 animate-fade-in" style={{animationDelay: '0.2s'}}>
            
            {/* 文件上传区域 */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-white">上传简历文件</h2>
              </div>
              
              {!file ? (
                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300
                    ${dragActive 
                      ? 'border-teal-400 bg-teal-500/20' 
                      : 'border-teal-500/30 bg-slate-900/50 hover:border-teal-500/50'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.pptx,.ppt,.html,.csv,.xml,.epub"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center transform transition-transform hover:scale-110">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-xl font-semibold text-white mb-2">
                      {dragActive ? '松开鼠标上传文件' : '点击上传或拖拽文件至此'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      支持 PDF、Word、Excel、PPT、Markdown、TXT 等多种格式
                    </p>
                  </label>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/50 rounded-xl p-6 flex items-center justify-between group hover:border-teal-400 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-lg truncate">{file.name}</p>
                      <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="ml-4 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all transform hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* 岗位选择 */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-white">选择目标岗位</h2>
              </div>
              <select
                value={jobSelection}
                onChange={(e) => setJobSelection(e.target.value)}
                className="w-full p-4 bg-slate-900/50 border-2 border-teal-500/30 rounded-xl focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-gray-100 transition-all duration-300 hover:border-teal-500/50"
              >
                <option value="">请选择岗位类型...</option>
                {jobOptions.map((job, index) => (
                  <option key={index} value={job} className="bg-slate-900 text-gray-100">
                    {job}
                  </option>
                ))}
              </select>
            </div>

            {/* 分析按钮 */}
            <button
              onClick={analyzeResume}
              disabled={loading || !file || !jobSelection}
              className="mt-6 w-full relative group overflow-hidden bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-600 hover:via-teal-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-teal-500/50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>AI 分析中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>开始智能分析</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>

            {/* 进度提示 */}
            {loading && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{analysisStage}</span>
                  <span className="text-teal-400 font-semibold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* 结果展示区域 */}
          {result && (
            <div className="mt-8 bg-gradient-to-br from-slate-900/90 to-teal-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-teal-500/30 animate-slide-up overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300">
                      AI 评估报告
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">基于您的简历和目标岗位生成</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result).then(() => {
                      alert('✅ 已复制到剪贴板')
                    })
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制报告
                </button>
              </div>
              
              <div className="relative z-10 bg-slate-950/50 rounded-xl p-8 border border-teal-500/20 backdrop-blur-sm">
                {renderFormattedResult(result)}
              </div>
            </div>
          )}
          
          {/* 特性展示 */}
          {!result && !loading && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">快速分析</h3>
                <p className="text-gray-400 text-sm">秒级响应，即时获得专业分析结果</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">智能匹配</h3>
                <p className="text-gray-400 text-sm">51 种岗位类型，精准评估匹配度</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">专业建议</h3>
                <p className="text-gray-400 text-sm">AI 提供详细改进方案和职业规划</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
