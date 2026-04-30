import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import FileTree from './components/Explorer/FileTree';
import FileViewer from './components/Explorer/FileViewer';
import { Send, Loader2, Brain, MessageSquare, ShieldAlert, FileText, Zap, Sparkles } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeRepo, setActiveRepo] = useState('');
  const [allReposData, setAllReposData] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null); 
  const [fetchingFile, setFetchingFile] = useState(false);

  const fetchAllRepos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/repo/all`);
      if (res.data.success) setAllReposData(res.data.repos);
    } catch (err) { console.error("Fetch error", err); }
  };

  useEffect(() => { fetchAllRepos(); }, []);
  useEffect(() => { if (activeRepo) { fetchHistory(); setViewingFile(null); } }, [activeRepo]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/repo/history?repoUrl=${activeRepo}`);
      if (res.data.success) setMessages(res.data.messages || []);
    } catch (err) { console.error("History error", err); }
    finally { setLoading(false); }
  };

  const handleFileSelect = async (path) => {
    setFetchingFile(true);
    try {
      const res = await axios.get(`${API_BASE}/repo/file-content?repoUrl=${activeRepo}&filePath=${path}`);
      if (res.data.success) setViewingFile({ name: path.split('/').pop(), path: path, content: res.data.content });
    } catch (err) { alert("File cleanup occurred."); }
    finally { setFetchingFile(false); }
  };

  // 🟢 1. Updated Execute Message to include Active File Context
  const executeMessage = async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/repo/ask`, { 
        question: text, 
        repoUrl: activeRepo,
        // Jab message jaye, check karo koi file open hai ya nahi
        activeFile: viewingFile ? { path: viewingFile.path, content: viewingFile.content } : null
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer, sources: res.data.sources }]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); setInput(''); }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeMessage(input);
  };

  const handleQuickAction = (text) => {
    if (loading || !activeRepo) return;
    executeMessage(text);
  };

  const activeRepoData = allReposData.find(r => r.url === activeRepo);

  return (
    <div className="flex h-screen w-screen bg-white text-slate-900 overflow-hidden font-sans">
      <Sidebar 
        onIndexSuccess={() => fetchAllRepos()} 
        onSelectRepo={(url) => { setActiveRepo(url); setMessages([]); }}
        indexedRepos={allReposData.map(r => r.url)}
        activeRepo={activeRepo}
      />

      {activeRepo && (
        <FileTree structure={activeRepoData?.structure} onFileSelect={handleFileSelect} />
      )}

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {activeRepo ? (
          <>
            <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[8px] text-indigo-600 font-bold uppercase tracking-widest">Active Codebase</span>
                <h2 className="text-xs font-mono text-slate-500 truncate">{activeRepo}</h2>
              </div>
              {viewingFile && (
                <div className="flex items-center gap-2">
                  {/* 🟢 Refactor Button: Sirf tab dikhega jab file open ho */}
                  <button 
                    onClick={() => handleQuickAction(`Refactor this file (${viewingFile.path}) for better performance and readability.`)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-md text-xs font-bold hover:bg-amber-100 transition-all border border-amber-200 shadow-sm"
                  >
                    <Sparkles size={14} /> Refactor Code
                  </button>
                  <button onClick={() => setViewingFile(null)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-semibold hover:bg-indigo-100 transition-colors">
                    <MessageSquare size={14} /> Back to Chat
                  </button>
                </div>
              )}
            </header>
            
            <div className="flex-1 overflow-hidden relative flex flex-col">
               {!viewingFile && (
                 <div className="flex gap-2 p-4 px-6 overflow-x-auto bg-white border-b border-slate-100 no-scrollbar">
                    <button onClick={() => handleQuickAction("Explain the project architecture and main components.")} className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold hover:border-indigo-300 transition-all text-slate-600">
                      <Zap size={12} className="text-yellow-500" /> Explain Architecture
                    </button>
                    <button onClick={() => handleQuickAction("Perform a security scan on this codebase.")} className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-full text-[10px] font-bold hover:bg-red-100 transition-all">
                      <ShieldAlert size={12} /> Security Scan
                    </button>
                    <button onClick={() => handleQuickAction("Generate a README documentation for this project.")} className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-full text-[10px] font-bold hover:bg-green-100 transition-all">
                      <FileText size={12} /> Auto-Doc
                    </button>
                 </div>
               )}

               {fetchingFile ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                   <Loader2 className="animate-spin mb-2" />
                   <span className="text-sm">Reading file content...</span>
                 </div>
               ) : viewingFile ? (
                 <FileViewer filename={viewingFile.name} content={viewingFile.content} onClose={() => setViewingFile(null)} />
               ) : (
                 <ChatWindow messages={messages} loading={loading} activeRepo={activeRepo}/>
               )}
            </div>
            
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={viewingFile ? `Ask about ${viewingFile.name}...` : "Ask anything about the code..."}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button type="submit" disabled={loading || !input.trim()} className="bg-indigo-600 p-2.5 rounded-lg hover:bg-indigo-700 disabled:bg-slate-200 transition-all">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100"><Brain size={40} className="text-indigo-600" /></div>
            <h2 className="text-2xl font-bold mb-2">DevOnboard.ai</h2>
            <p className="text-slate-400 max-w-xs text-sm">Select a repo to explore architecture and vulnerabilities.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;