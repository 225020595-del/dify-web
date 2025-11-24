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
        <title>AI 简历分析助手</title>
        <meta name="description" content="基于 Dify AI 的智能简历分析工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            🎯 AI 简历分析助手
          </h1>
          
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              请粘贴您的简历内容：
            </label>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              placeholder="在此粘贴简历内容..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
            
            <button
              onClick={analyzeResume}
              disabled={loading}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-lg"
            >
              {loading ? '分析中...' : '开始分析'}
            </button>
          </div>

          {result && (
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">分析结果：</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
