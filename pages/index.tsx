import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Briefcase, 
  ChevronDown, Loader2, Send, MapPin, Calendar, DollarSign, 
  Star, Trophy, TrendingUp, AlertTriangle, BookOpen, User, 
  Bell, Settings, LayoutDashboard, X
} from 'lucide-react';

// --- 配置区域 ---
const API_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dify.ai/v1";

// 岗位列表
const JOB_OPTIONS = [
  "金融：银行金融科技类岗位", "金融：银行产品与研发类岗位", "金融：银行客户服务与销售岗", 
  "金融：银行运营与支持岗", "金融：银行信贷与投资岗", "金融：银行风险管理岗", 
  "金融：投行股权承做岗", "金融：机构销售岗", "金融：资管固收投资助理", 
  "金融：研究助理岗", "金融：投资研究岗", "金融：产品研发岗", 
  "金融：风险控制岗", "金融：量化交易员", "金融：基金运营岗", 
  "金融：精算师", "金融：保险产品开发", "金融：核保核赔岗", 
  "金融：保险投资岗", "快消：快消市场销售管培生", "快消：快消HR", 
  "快消：快消产品供应链管培生", "快消：快消技术支持岗", "快消：快消品牌管理", 
  "快消：快消产品研发", "快消：市场调研", "互联网：后端开发工程师", 
  "互联网：前端开发工程师", "互联网：移动端开发工程师", "互联网：算法工程师", 
  "互联网：测试开发工程师", "互联网：功能产品经理", "互联网：策略产品经理", 
  "互联网：商业化产品经理", "互联网：AI产品经理", "互联网：UI设计师", 
  "互联网：交互设计师", "互联网：数据科学家", "互联网：商业分析师（BA/DS）", 
  "互联网：电商运营", "互联网：内容运营", "互联网：产品运营", 
  "互联网：市场营销", "互联网：用户研究", "互联网：投资分析师", 
  "互联网：风险策略分析师", "互联网：人力资源", "互联网：行政专员", 
  "互联网：战略分析师"
];

// --- 辅助组件 ---
const CircleProgress = ({ score, total = 10, size = 160, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedScore = Math.min(Math.max(score, 0), total);
  const progress = (normalizedScore / total) * circumference;
  const percentage = Math.round((normalizedScore / total) * 100);

  let colorClass = "text-emerald-500";
  if (percentage < 60) colorClass = "text-red-500";
  else if (percentage < 80) colorClass = "text-amber-500";

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-4xl font-bold ${colorClass}`}>{normalizedScore}</span>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">TOTAL SCORE</span>
      </div>
      <div className={`mt-2 text-sm font-bold ${colorClass} bg-opacity-10 px-3 py-1 rounded-full bg-current`}>
        {percentage}% Match
      </div>
    </div>
  );
};

const ScoreCard = ({ title, score, content, icon: Icon, color = "emerald" }) => {
  const getColorClasses = (c) => {
    switch (c) {
      case "emerald": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "amber": return "text-amber-600 bg-amber-50 border-amber-100";
      case "blue": return "text-blue-600 bg-blue-50 border-blue-100";
      case "indigo": return "text-indigo-600 bg-indigo-50 border-indigo-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };
  
  const classes = getColorClasses(color);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg ${classes} bg-opacity-20`}>
              <Icon size={20} className={classes.split(' ')[0]} />
           </div>
           <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
        </div>
        {score !== null && (
          <div className={`text-2xl font-bold ${classes.split(' ')[0]}`}>
             {score}<span className="text-sm text-slate-400 font-normal">/10</span>
          </div>
        )}
      </div>
      <div className="text-slate-600 text-sm leading-relaxed space-y-2">
        {content}
      </div>
    </div>
  );
};

export default function Home() {
  const [selectedJob, setSelectedJob] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const parsedData = useMemo(() => {
    if (!result) return null;

    const totalScoreMatch = result.match(/总体匹配得分.*?得分：\s*([\d.]+)/s);
    const totalScore = totalScoreMatch ? parseFloat(totalScoreMatch[1]) : 0;
    const totalSummaryMatch = result.match(/总体匹配得分.*?总结：\s*(.*?)(?=\n##|$)/s);

    const strengthsMatch = result.match(/您的关键优势.*?优势得分：\s*([\d.]+)(.*?)(?=\n##|$)/s);
    const strengthsScore = strengthsMatch ? parseFloat(strengthsMatch[1]) : 0;
    const strengthsContent = strengthsMatch ? strengthsMatch[2].replace(/优势得分：.*?$/m, '') : "";

    const gapsMatch = result.match(/潜在差距.*?差距得分：\s*([\d.]+)(.*?)(?=\n##|$)/s);
    const gapsScore = gapsMatch ? parseFloat(gapsMatch[1]) : 0;
    const gapsContent = gapsMatch ? gapsMatch[2].replace(/差距得分：.*?$/m, '') : "";

    const analysisMatch = result.match(/详细分析与推理.*?分析得分：\s*([\d.]+)(.*?)(?=\n##|$)/s);
    const analysisScore = analysisMatch ? parseFloat(analysisMatch[1]) : 0;
    const analysisContent = analysisMatch ? analysisMatch[2].replace(/分析得分：.*?$/m, '') : "";

    const suggestionMatch = result.match(/建议的准备方向(.*?)$/s);
    const suggestionContent = suggestionMatch ? suggestionMatch[1] : "";

    return {
      totalScore,
      totalSummary: totalSummaryMatch ? totalSummaryMatch[1].trim() : "AI 正在生成总结...",
      strengths: { score: strengthsScore, content: strengthsContent },
      gaps: { score: gapsScore, content: gapsContent },
      analysis: { score: analysisScore, content: analysisContent },
      suggestion: { content: suggestionContent }
    };
  }, [result]);

  const renderList = (text) => {
    if (!text) return <p className="text-slate-400 italic">等待分析...</p>;
    return text.split('\n').map((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return null;
      if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        const content = cleanLine.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={idx} className="flex items-start gap-2 mb-2">
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></div>
            <p dangerouslySetInnerHTML={{ __html: content }}></p>
          </div>
        );
      }
      return <p key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!API_KEY) { 
      setError("请先配置环境变量：NEXT_PUBLIC_APP_KEY"); 
      return; 
    }
    if (!selectedJob) { 
      setError("请选择一个岗位"); 
      return; 
    }
    if (!file) { 
      setError("请上传简历文件"); 
      return; 
    }

    setError("");
    setShowUploadForm(false);
    setIsUploading(true);
    setResult("");

    try {
      // 1. 上传文件到 Dify
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', 'web-user');
      
      const upRes = await fetch(`${BASE_URL}/files/upload`, {
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${API_KEY}` }, 
        body: formData
      });
      
      if (!upRes.ok) {
        const errorData = await upRes.json().catch(() => ({}));
        throw new Error(errorData.message || "文件上传失败，请检查 API Key 和网络连接");
      }
      
      const upData = await upRes.json();

      setIsUploading(false);
      setIsProcessing(true);

      // 2. 执行 Workflow
      const res = await fetch(`${BASE_URL}/workflows/run`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          inputs: { 
            "job_selection": selectedJob, 
            "CV": { 
              "type": "document", 
              "transfer_method": "local_file", 
              "upload_file_id": upData.id 
            } 
          },
          response_mode: "streaming", 
          user: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "分析流程启动失败");
      }

      // 3. 处理流式响应
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.event === 'text_chunk') {
                  setResult(prev => prev + data.data.text);
                }
                if (data.event === 'workflow_finished') {
                  setIsProcessing(false);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
      setIsProcessing(false);
      setShowUploadForm(true);
    }
  };

  return (
    <>
      <Head>
        <title>AI 简历分析系统 - JobMatch AI</title>
        <meta name="description" content="基于 Dify AI 的智能简历分析工具" />
      </Head>

      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
        
        {/* 侧边栏 */}
        <aside className="w-full md:w-20 lg:w-64 bg-[#1e293b] text-white flex flex-col shrink-0 transition-all duration-300">
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700/50">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
               <Briefcase size={18} className="text-white" />
             </div>
             <span className="ml-3 font-bold text-lg hidden lg:block">JobMatch AI</span>
          </div>
          
          <nav className="flex-1 py-6 px-3 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
             <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 transition-all shrink-0">
                <LayoutDashboard size={20} />
                <span className="hidden lg:block font-medium">Dashboard</span>
             </a>
             <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0">
                <FileText size={20} />
                <span className="hidden lg:block font-medium">My Resumes</span>
             </a>
             <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0">
                <Settings size={20} />
                <span className="hidden lg:block font-medium">Settings</span>
             </a>
          </nav>
          
          <div className="p-4 border-t border-slate-700/50 hidden lg:block">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                   <User size={20} className="text-slate-300" />
                </div>
                <div>
                   <p className="text-sm font-medium">Demo User</p>
                   <p className="text-xs text-slate-500">Free Plan</p>
                </div>
             </div>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* 顶部 Header */}
          <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10">
             <h2 className="text-lg font-bold text-slate-800">Evaluation Dashboard</h2>
             <div className="flex items-center gap-4">
                {!showUploadForm && !isProcessing && (
                  <button 
                    onClick={() => { setShowUploadForm(true); setResult(""); setFile(null); }} 
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Send size={14} /> New Scan
                  </button>
                )}
                <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
                <Bell size={20} className="text-slate-400 hover:text-slate-600 cursor-pointer hidden sm:block" />
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50">
            
            <div className="max-w-6xl mx-auto space-y-6">

              {/* API Key 警告 */}
              {!API_KEY && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm flex items-center gap-3">
                   <AlertCircle className="text-amber-500" />
                   <div>
                      <h4 className="font-bold text-amber-800 text-sm">需要配置 API Key</h4>
                      <p className="text-xs text-amber-700">请创建 .env.local 文件并配置 NEXT_PUBLIC_APP_KEY</p>
                   </div>
                </div>
              )}

              {/* 上传表单 */}
              {showUploadForm ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto mt-10">
                   <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">Resume Compatibility Scan</h2>
                      <p className="text-slate-500">AI-powered analysis matching your profile against industry standards</p>
                   </div>

                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Target Position</label>
                        <div className="relative">
                          <select 
                            value={selectedJob} 
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                          >
                            <option value="" disabled>Select a role...</option>
                            {JOB_OPTIONS.map((j, i) => <option key={i} value={j}>{j}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Upload Resume</label>
                        <div className="relative group cursor-pointer">
                           <input 
                             type="file" 
                             accept=".pdf,.doc,.docx,.txt" 
                             onChange={handleFileChange} 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                           />
                           <div 
                             className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                               dragActive ? 'border-indigo-500 bg-indigo-50' : 
                               file ? 'border-emerald-500 bg-emerald-50/50' : 
                               'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                             }`}
                             onDragEnter={handleDrag}
                             onDragLeave={handleDrag}
                             onDragOver={handleDrag}
                             onDrop={handleDrop}
                           >
                              {file ? (
                                <div className="flex items-center gap-3 w-full">
                                  <CheckCircle className="text-emerald-500 w-8 h-8 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-emerald-700 font-medium block truncate">{file.name}</span>
                                    <span className="text-xs text-emerald-600">{(file.size / 1024).toFixed(1)} KB</span>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                    className="p-1 hover:bg-emerald-200 rounded-full transition-colors shrink-0"
                                    type="button"
                                  >
                                    <X size={18} className="text-emerald-700" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Upload className="text-slate-400 mb-2 w-8 h-8 group-hover:text-indigo-400 transition-colors" />
                                  <span className="text-slate-600 font-medium">Click or Drag to Upload</span>
                                  <span className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT formats supported</span>
                                </>
                              )}
                           </div>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}

                      <button 
                        onClick={handleSubmit} 
                        disabled={!file || !selectedJob || !API_KEY}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${
                          (!file || !selectedJob || !API_KEY) ? 
                          'bg-slate-300 cursor-not-allowed shadow-none' : 
                          'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                        }`}
                      >
                        Analyze Match
                      </button>
                   </div>
                </div>
              ) : (
                // 结果 Dashboard
                <div className="space-y-6 pb-12">
                  
                  {/* Job Header */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
                     <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 text-white font-bold text-2xl shadow-md">
                           {selectedJob.charAt(0)}
                        </div>
                        <div>
                           <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-2">{selectedJob}</h1>
                           <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><Briefcase size={14} /> Full-time</span>
                              <span className="flex items-center gap-1"><MapPin size={14} /> Hybrid / Remote</span>
                              <span className="flex items-center gap-1"><Calendar size={14} /> Posted 2 days ago</span>
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium text-xs border border-amber-200">Promoted</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                           <DollarSign size={18} /> Competitive Salary
                        </div>
                        <div className="flex gap-2">
                           <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg text-sm border border-indigo-100 hover:bg-indigo-100 transition-colors">Save Job</button>
                           <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm shadow hover:bg-indigo-700 transition-colors">Apply Now</button>
                        </div>
                     </div>
                  </div>

                  {/* Score Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                     
                     <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
                        
                        {isUploading ? (
                           <div className="text-center py-10">
                              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                              <p className="text-slate-500 font-medium">Analyzing Resume...</p>
                           </div>
                        ) : (
                           <>
                              <CircleProgress score={parsedData?.totalScore || 0} />
                              <div className="mt-6 text-center">
                                 <p className="text-slate-500 text-sm leading-relaxed px-2">
                                    {parsedData?.totalSummary || (isProcessing ? "AI 正在计算匹配度..." : "等待分析结果...")}
                                 </p>
                              </div>
                           </>
                        )}
                     </div>

                     <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full group hover:border-emerald-300 transition-colors">
                           <div className="flex items-start justify-between mb-2">
                              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                 <Trophy size={20} />
                              </div>
                              <span className="text-2xl font-bold text-emerald-600">{parsedData?.strengths.score || 0}</span>
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-700 mb-1">Key Strengths</h4>
                              <p className="text-xs text-slate-400">Skills matching job requirements</p>
                           </div>
                           <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{width: `${(parsedData?.strengths.score || 0) * 10}%`}}></div>
                           </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full group hover:border-amber-300 transition-colors">
                           <div className="flex items-start justify-between mb-2">
                              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                 <AlertTriangle size={20} />
                              </div>
                              <span className="text-2xl font-bold text-amber-600">{parsedData?.gaps.score || 0}</span>
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-700 mb-1">Potential Gaps</h4>
                              <p className="text-xs text-slate-400">Areas needing improvement</p>
                           </div>
                           <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{width: `${(parsedData?.gaps.score || 0) * 10}%`}}></div>
                           </div>
                        </div>

                         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full group hover:border-blue-300 transition-colors">
                           <div className="flex items-start justify-between mb-2">
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                 <BookOpen size={20} />
                              </div>
                              <span className="text-2xl font-bold text-blue-600">{parsedData?.analysis.score || 0}</span>
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-700 mb-1">Detail Analysis</h4>
                              <p className="text-xs text-slate-400">Experience & Education fit</p>
                           </div>
                           <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{width: `${(parsedData?.analysis.score || 0) * 10}%`}}></div>
                           </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full group hover:border-purple-300 transition-colors">
                           <div className="flex items-start justify-between mb-2">
                              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                 <TrendingUp size={20} />
                              </div>
                              <span className="text-2xl font-bold text-purple-600">High</span>
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-700 mb-1">Growth Potential</h4>
                              <p className="text-xs text-slate-400">Estimated based on history</p>
                           </div>
                           <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-400 rounded-full" style={{width: '85%'}}></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-8">
                        <Star className="text-indigo-500" size={20} /> Detailed Breakdown
                     </h3>

                     {isProcessing && !parsedData?.strengths.content && (
                        <div className="space-y-4 animate-pulse">
                           <div className="h-32 bg-slate-200 rounded-xl"></div>
                           <div className="h-32 bg-slate-200 rounded-xl"></div>
                        </div>
                     )}

                     {(parsedData?.strengths.content || parsedData?.strengths.score > 0) && (
                        <ScoreCard 
                          title="Hard Skills & Strengths" 
                          score={parsedData.strengths.score} 
                          content={renderList(parsedData.strengths.content)}
                          icon={Trophy}
                          color="emerald"
                        />
                     )}

                     {(parsedData?.gaps.content || parsedData?.gaps.score > 0) && (
                        <ScoreCard 
                          title="Skill Gaps & Weaknesses" 
                          score={parsedData.gaps.score} 
                          content={renderList(parsedData.gaps.content)}
                          icon={AlertTriangle}
                          color="amber"
                        />
                     )}

                     {(parsedData?.analysis.content || parsedData?.analysis.score > 0) && (
                        <ScoreCard 
                          title="Experience Level Analysis" 
                          score={parsedData.analysis.score} 
                          content={renderList(parsedData.analysis.content)}
                          icon={Briefcase}
                          color="blue"
                        />
                     )}

                     {parsedData?.suggestion.content && (
                        <ScoreCard 
                          title="Recommended Actions" 
                          score={null}
                          content={renderList(parsedData.suggestion.content)}
                          icon={TrendingUp}
                          color="indigo"
                        />
                     )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
