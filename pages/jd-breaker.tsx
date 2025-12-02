import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

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

export default function JDBreaker() {
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

      const response = await fetch('/api/jd/parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('解析失败')
      }

      const data = await response.json()
      setParsedJD(data.parsed)
    } catch (error) {
      console.error('Error:', error)
      alert('解析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const exportAsJSON = () => {
    if (!parsedJD) return
    
    const dataStr = JSON.stringify(parsedJD, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'jd_parsed.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const clearAll = () => {
    setInputText('')
    setFile(null)
    setParsedJD(null)
  }

  return (
    <>
      <Head>
        <title>JD 解析器 - AI 智能分析</title>
        <meta name="description" content="智能解析岗位描述，提取结构化信息" />
      </Head>

      {/* 背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6bS0yMCAwYzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 导航 */}
          <div className="mb-8 flex items-center gap-4">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>
            <Link 
              href="/recruit-agent" 
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200"
            >
              招聘查询 Agent
            </Link>
          </div>

          {/* 标题 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/50">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                JD 智能解析器
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              上传或粘贴岗位描述，AI 自动提取结构化信息
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：输入区 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
                输入 JD 信息
              </h2>

              {/* 文本输入 */}
              <div className="mb-4">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value)
                    if (e.target.value) setFile(null)
                  }}
                  placeholder="粘贴岗位描述文本..."
                  className="w-full h-64 p-4 bg-slate-900/50 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-100 resize-none"
                  disabled={!!file}
                />
              </div>

              <div className="text-center text-gray-400 my-4">或</div>

              {/* 文件上传 */}
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
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
                    id="jd-file-upload"
                    className="hidden"
                    accept=".txt,.md,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="jd-file-upload" className="cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold">上传 JD 文件</p>
                    <p className="text-gray-400 text-sm mt-1">支持 TXT、MD、PDF、Word</p>
                  </label>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{file.name}</p>
                      <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={parseJD}
                  disabled={loading || (!inputText && !file)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      解析中...
                    </span>
                  ) : (
                    '开始解析'
                  )}
                </button>
                <button
                  onClick={clearAll}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all"
                >
                  清空
                </button>
              </div>
            </div>

            {/* 右侧：结果展示 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
                  解析结果
                </h2>
                {parsedJD && (
                  <button
                    onClick={exportAsJSON}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    导出 JSON
                  </button>
                )}
              </div>

              {!parsedJD ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-center py-20">
                  <div>
                    <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>等待解析...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {/* 基本信息 */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                    <h3 className="text-xl font-bold text-purple-300 mb-3">{parsedJD.title}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">公司：</span>
                        <span className="text-white ml-2">{parsedJD.company}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">地点：</span>
                        <span className="text-white ml-2">{parsedJD.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">薪资：</span>
                        <span className="text-white ml-2">{parsedJD.salary}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">经验：</span>
                        <span className="text-white ml-2">{parsedJD.experience}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">学历：</span>
                        <span className="text-white ml-2">{parsedJD.education}</span>
                      </div>
                    </div>
                  </div>

                  {/* 岗位职责 */}
                  {parsedJD.responsibilities.length > 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="font-bold text-pink-300 mb-2">岗位职责</h4>
                      <ul className="space-y-1">
                        {parsedJD.responsibilities.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                            <span className="text-pink-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 任职要求 */}
                  {parsedJD.requirements.length > 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="font-bold text-indigo-300 mb-2">任职要求</h4>
                      <ul className="space-y-1">
                        {parsedJD.requirements.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 标签 */}
                  {parsedJD.tags.length > 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="font-bold text-purple-300 mb-2">技能标签</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedJD.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 福利待遇 */}
                  {parsedJD.benefits.length > 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="font-bold text-green-300 mb-2">福利待遇</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedJD.benefits.map((benefit, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
