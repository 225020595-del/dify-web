import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

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

export default function RecruitAgent() {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          type: queryType === 'auto' ? undefined : queryType,
          topK: 10,
        }),
      })

      if (!response.ok) {
        throw new Error('查询失败')
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      alert('查询失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const copyCo = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ 已复制到剪贴板')
    })
  }

  return (
    <>
      <Head>
        <title>招聘查询 Agent - AI 智能检索</title>
        <meta name="description" content="基于 RAG 的智能招聘信息查询系统" />
      </Head>

      {/* 背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6bS0yMCAwYzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
              href="/jd-breaker" 
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200"
            >
              JD 解析器
            </Link>
          </div>

          {/* 标题 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 shadow-lg shadow-blue-500/50">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                招聘查询 Agent
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              基于 RAG 的智能招聘信息检索，快速获取岗位、内推和公司信息
            </p>
          </div>

          {/* 搜索区 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">智能搜索</h2>
            </div>

            {/* 查询类型选择 */}
            <div className="mb-4 flex gap-3">
              <button
                onClick={() => setQueryType('auto')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  queryType === 'auto'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                智能识别
              </button>
              <button
                onClick={() => setQueryType('company')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  queryType === 'company'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                按公司查询
              </button>
              <button
                onClick={() => setQueryType('industry')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  queryType === 'industry'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                按行业查询
              </button>
            </div>

            {/* 搜索框 */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="例如：阿里巴巴实习岗位、互联网算法岗、腾讯内推码..."
                className="flex-1 px-4 py-3 bg-slate-900/50 border-2 border-blue-500/30 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : '搜索'}
              </button>
            </div>

            {/* 推荐问题 */}
            <div>
              <p className="text-gray-400 text-sm mb-2">推荐查询：</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(sq)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 text-sm rounded-lg transition-all"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 结果展示 */}
          {result && (
            <div className="space-y-6">
              {/* AI 回答 */}
              <div className="bg-gradient-to-br from-slate-900/90 to-blue-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-blue-500/30">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mb-2">
                      AI 智能回答
                    </h3>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-slate-950/50 rounded-lg p-4 border border-blue-500/20">
                      {result.answer}
                    </div>
                  </div>
                  <button
                    onClick={() => copyCo(result.answer)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 岗位列表 */}
              {result.jobs && result.jobs.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-white">相关岗位 ({result.jobs.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-slate-900/50 rounded-xl p-5 border border-blue-500/20 hover:border-blue-500/50 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-blue-300 group-hover:text-blue-200 mb-1">
                              {job.title}
                            </h4>
                            <p className="text-gray-400 text-sm">{job.company}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
                            {job.type}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-300 mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{job.location}</span>
                          </div>
                          {job.updateDate && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>更新于 {job.updateDate}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {job.applyUrl && (
                            <a
                              href={job.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium rounded-lg transition-all text-center"
                            >
                              申请岗位
                            </a>
                          )}
                          {job.referralCode && (
                            <button
                              onClick={() => copyCo(job.referralCode!)}
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              内推码
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 数据来源 */}
              {result.sources && result.sources.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <details className="group">
                    <summary className="cursor-pointer text-gray-300 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      查看数据来源 ({result.sources.length} 条)
                    </summary>
                    <div className="mt-3 space-y-2">
                      {result.sources.map((source, idx) => (
                        <div key={idx} className="bg-slate-900/50 rounded-lg p-3 border border-blue-500/10">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs text-gray-400">来源片段 #{idx + 1}</span>
                            <span className="text-xs text-blue-400">匹配度: {(source.score * 100).toFixed(1)}%</span>
                          </div>
                          <p className="text-sm text-gray-300">{source.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* 空状态 */}
          {!result && !loading && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">开始你的智能搜索</h3>
              <p className="text-gray-500">输入公司名、行业或岗位类型，AI 将为你检索相关信息</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
