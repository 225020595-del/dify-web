import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [resume, setResume] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const analyzeResume = async () => {
    if (!resume.trim()) {
      alert('请输入简历内容')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume }),
      })

      if (!response.ok) {
        throw new Error('分析失败')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (error) {
      console.error('Error:', error)
      setResult('分析出错，请稍后重试')
    } finally {
      setLoading(false)
    }
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
          
          {/* 输入区域 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full mr-3"></div>
              <label className="text-xl font-semibold text-white">
                粘贴您的简历内容
              </label>
            </div>
            
            <textarea
              className="w-full h-72 p-6 bg-slate-900/50 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-gray-100 placeholder-gray-500 transition-all duration-300 backdrop-blur-sm"
              placeholder="在此粘贴您的简历内容，AI 将为您进行深度分析..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
            
            <button
              onClick={analyzeResume}
              disabled={loading}
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
