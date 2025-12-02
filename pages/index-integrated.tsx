import { useState } from 'react'
import Head from 'next/head'

// 三合一整合页面 - Tab 切换模式
export default function IntegratedHome() {
  const [activeTab, setActiveTab] = useState<'resume' | 'jd' | 'recruit'>('resume')

  return (
    <>
      <Head>
        <title>AI 智能助手 - 简历分析 | JD 解析 | 招聘查询</title>
      </Head>

      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
        {/* 背景动画省略 */}
      </div>

      <main className="relative min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Tab 切换按钮 */}
          <div className="mb-8 flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'resume'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-2xl scale-110'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              📄 简历分析
            </button>
            <button
              onClick={() => setActiveTab('jd')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'jd'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl scale-110'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              🔍 JD 解析
            </button>
            <button
              onClick={() => setActiveTab('recruit')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'recruit'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl scale-110'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              💼 招聘查询
            </button>
          </div>

          {/* 内容区域 */}
          <div className="animate-fade-in">
            {activeTab === 'resume' && <div>简历分析模块 - 待完整实现</div>}
            {activeTab === 'jd' && <div>JD 解析模块 - 待完整实现</div>}
            {activeTab === 'recruit' && <div>招聘查询模块 - 待完整实现</div>}
          </div>
        </div>
      </main>
    </>
  )
}
