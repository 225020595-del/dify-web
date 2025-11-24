import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [jobSelection, setJobSelection] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // 岗位选项列表（与 Workflow 配置一致）
  const jobOptions = [
    '金融：银行金融科技类岗位',
    '金融：银行产品与研发类岗位',
    '金融：银行客户服务与销售岗',
    '金融：银行运营与支持岗',
    '金融：银行信贷与投资岗',
    '金融：银行风险管理岗',
    '金融：投行股权承做岗',
    '金融：机构销售岗',
    '金融：资管固收投资助理',
    '金融：研究助理岗',
    '金融：投资研究岗',
    '金融：产品研发岗',
    '金融：风险控制岗',
    '金融：量化交易员',
    '金融：基金运营岗',
    '金融：精算师',
    '金融：保险产品开发',
    '金融：核保核赔岗',
    '金融：保险投资岗',
    '快消：快消市场销售管培生',
    '快消：快消HR',
    '快消：快消产品供应链管培生',
    '快消：快消技术支持岗',
    '快消：快消品牌管理',
    '快消：快消产品研发',
    '快消：市场调研',
    '互联网：后端开发工程师',
    '互联网：前端开发工程师',
    '互联网：移动端开发工程师',
    '互联网：算法工程师',
    '互联网：测试开发工程师',
    '互联网：功能产品经理',
    '互联网：策略产品经理',
    '互联网：商业化产品经理',
    '互联网：AI产品经理',
    '互联网：UI设计师',
    '互联网：交互设计师',
    '互联网：数据科学家',
    '互联网：商业分析师（BA/DS）',
    '互联网：电商运营',
    '互联网：内容运营',
    '互联网：产品运营',
    '互联网：市场营销',
    '互联网：用户研究',
    '互联网：投资分析师',
    '互联网：风险策略分析师',
    '互联网：人力资源',
    '互联网：行政专员',
    '互联网：战略分析师',
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const fileType = selectedFile.type
      const fileName = selectedFile.name.toLowerCase()
      
      // 验证文件类型
      if (
        fileType === 'application/pdf' ||
        fileType === 'application/msword' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.pdf') ||
        fileName.endsWith('.doc') ||
        fileName.endsWith('.docx')
      ) {
        setFile(selectedFile)
        setResult('')
      } else {
        alert('请上传 PDF 或 Word 文档（.pdf, .doc, .docx）')
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
      const fileType = droppedFile.type
      const fileName = droppedFile.name.toLowerCase()
      
      if (
        fileType === 'application/pdf' ||
        fileType === 'application/msword' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.pdf') ||
        fileName.endsWith('.doc') ||
        fileName.endsWith('.docx')
      ) {
        setFile(droppedFile)
        setResult('')
      } else {
        alert('请上传 PDF 或 Word 文档（.pdf, .doc, .docx）')
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const apiKey = process.env.NEXT_PUBLIC_APP_KEY

    if (!apiUrl || !apiKey) {
      alert('系统配置错误，请联系管理员')
      setLoading(false)
      return
    }

    try {
      // 第一步：上传文件到 Dify
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('user', 'user-' + Date.now())

      const uploadResponse = await fetch(`${apiUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.message || '文件上传失败')
      }

      const uploadData = await uploadResponse.json()
      console.log('文件上传成功:', uploadData)

      // 第二步：调用 Workflow API
      const workflowResponse = await fetch(`${apiUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            CV: uploadData.id,  // 文件ID作为CV输入
            job_selection: jobSelection,  // 岗位选择
          },
          response_mode: 'blocking',
          user: 'user-' + Date.now(),
        }),
      })

      if (!workflowResponse.ok) {
        const errorData = await workflowResponse.json()
        throw new Error(errorData.message || '分析请求失败')
      }

      const workflowData = await workflowResponse.json()
      console.log('Workflow 响应:', workflowData)
      
      // 从 Workflow 输出中提取结果
      const evaluation = workflowData.data?.outputs?.text || ''
      const evaluator = workflowData.data?.outputs?.text_1 || ''
      
      // 组合两个输出
      const fullResult = `# AI 简历评估报告\n\n${evaluation}\n\n---\n\n# 评估质量检查\n\n${evaluator}`
      
      setResult(fullResult || '未获取到分析结果，请检查 Workflow 配置')

    } catch (error) {
      console.error('Error:', error)
      setResult('分析出错：' + (error as Error).message + '\n\n请确保：\n1. 已在 Vercel 配置环境变量\n2. Dify Workflow 支持文件上传\n3. API Key 有效且有权限')
    } finally {
      setLoading(false)
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
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6bS0yMCAwYzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        {/* 渐变光效 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative min-h-screen py-12 px-4 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          {/* 头部标题 */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 mb-6 shadow-lg shadow-purple-500/50">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                AI 简历分析助手
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              基于先进 AI 技术，为您提供专业的简历优化建议
            </p>
          </div>
          
          {/* 文件上传区域 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full mr-3"></div>
              <label className="text-xl font-semibold text-white">
                上传简历文档
              </label>
            </div>
            
            {/* 岗位选择下拉框 */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">选择目标岗位：</label>
              <select
                value={jobSelection}
                onChange={(e) => setJobSelection(e.target.value)}
                className="w-full p-4 bg-slate-900/50 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-100 transition-all duration-300"
              >
                <option value="">-- 请选择岗位 --</option>
                {jobOptions.map((job, index) => (
                  <option key={index} value={job}>{job}</option>
                ))}
              </select>
            </div>
            
            {/* 拖拽上传区域 */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-purple-400 bg-purple-500/20' 
                  : 'border-purple-500/30 bg-slate-900/50 hover:border-purple-500/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
              
              {!file ? (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl text-white font-semibold mb-2">
                        点击上传或拖拽文件到此处
                      </p>
                      <p className="text-gray-400 text-sm">
                        支持 PDF、Word 文档（.pdf, .doc, .docx）
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        文件大小限制：10MB
                      </p>
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
                  <button
                    onClick={removeFile}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={analyzeResume}
              disabled={loading || !file || !jobSelection}
              className="mt-6 w-full relative group overflow-hidden bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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
          </div>

          {/* 结果展示区域 */}
          {result && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 animate-slide-up">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-cyan-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  分析结果
                </h2>
              </div>
              <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed whitespace-pre-wrap bg-slate-900/30 rounded-xl p-6 border border-purple-500/20">
                {result}
              </div>
            </div>
          )}
          
          {/* 特性展示 */}
          {!result && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-fade-in-delay">
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">智能建议</h3>
                <p className="text-gray-400 text-sm">AI 驱动，提供个性化优化建议</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">隐私保护</h3>
                <p className="text-gray-400 text-sm">数据加密传输，保护您的隐私安全</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
