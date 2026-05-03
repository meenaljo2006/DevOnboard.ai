import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // NEW: For routing
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import FileTree from '../components/Explorer/FileTree';
import FileViewer from '../components/Explorer/FileViewer';
import { Send, Loader2, Brain, MessageSquare, ShieldAlert, FileText, Zap, Sparkles, LogOut } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate(); // Navigation setup
  const [activeRepo, setActiveRepo] = useState('');
  const [allReposData, setAllReposData] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null); 
  const [fetchingFile, setFetchingFile] = useState(false);
  const [user, setUser] = useState(null); // Save user data

  // 🟢 1. AUTHENTICATION CHECK ON LOAD
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/'); // Agar token nahi hai, Landing page pe bhej do
        return;
      }
      
      // Optional: Verify token with backend (Good practice)
      try {
        const res = await axios.get(`${API_BASE}/auth/verify`, {
          headers: { 'x-auth-token': token }
        });
        setUser(res.data.user);
        fetchAllRepos(); // Auth pass ho gaya, ab repos fetch karo
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/'); // Token galat/expire ho gaya toh bahar
      }
    };
    
    checkAuth();
  }, [navigate]);

  // 🟢 2. LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const fetchAllRepos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/repo/all`);
      if (res.data.success) setAllReposData(res.data.repos);
    } catch (err) { console.error("Fetch error", err); }
  };

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

  const executeMessage = async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/repo/ask`, { 
        question: text, 
        repoUrl: activeRepo,
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

  // Sirf tab tak render na kare jab tak user check na ho jaye
  if (!user) return <div className="h-screen w-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500 w-10 h-10" /></div>;

  return (
    <div className="flex h-screen w-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* 🟢 SIDEBAR (Updated to dark theme in next step) */}
      <Sidebar 
        onIndexSuccess={() => fetchAllRepos()} 
        onSelectRepo={(url) => { setActiveRepo(url); setMessages([]); }}
        indexedRepos={allReposData.map(r => r.url)}
        activeRepo={activeRepo}
        user={user} // Pass user to sidebar
        onLogout={handleLogout} // Pass logout function
      />

      {activeRepo && (
        <FileTree structure={activeRepoData?.structure} onFileSelect={handleFileSelect} />
      )}

      <main className="flex-1 flex flex-col min-w-0 relative bg-[#0B1120] border-l border-white/5">
        {activeRepo ? (
          <>
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0B1120]/80 backdrop-blur-md">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">Active Codebase</span>
                <h2 className="text-sm font-mono text-slate-300 truncate">{activeRepo}</h2>
              </div>
              {viewingFile && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleQuickAction(`Refactor this file (${viewingFile.path}) for better performance and readability.`)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                  >
                    <Sparkles size={14} /> Refactor Code
                  </button>
                  <button onClick={() => setViewingFile(null)} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors border border-white/5">
                    <MessageSquare size={14} /> Back to Chat
                  </button>
                </div>
              )}
            </header>
            
            <div className="flex-1 overflow-hidden relative flex flex-col">
               {!viewingFile && (
                 <div className="flex gap-3 p-4 px-8 overflow-x-auto bg-[#0B1120] border-b border-white/5 no-scrollbar">
                    <button onClick={() => handleQuickAction("Explain the project architecture and main components.")} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all text-slate-300">
                      <Zap size={14} className="text-cyan-400" /> Architecture Audit
                    </button>
                    <button onClick={() => handleQuickAction("Perform a security scan on this codebase.")} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all">
                      <ShieldAlert size={14} /> Security Scan
                    </button>
                    <button onClick={() => handleQuickAction("Generate a README documentation for this project.")} className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all">
                      <FileText size={14} /> Auto-Doc
                    </button>
                 </div>
               )}

               {fetchingFile ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-indigo-400">
                   <Loader2 className="animate-spin mb-3 w-8 h-8" />
                   <span className="text-sm font-bold tracking-widest uppercase">Reading File...</span>
                 </div>
               ) : viewingFile ? (
                 <FileViewer filename={viewingFile.name} content={viewingFile.content} onClose={() => setViewingFile(null)} />
               ) : (
                 <ChatWindow messages={messages} loading={loading} activeRepo={activeRepo}/>
               )}
            </div>
            
            <div className="p-6 bg-[#0B1120] border-t border-white/5">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3 bg-[#020617] border border-white/10 rounded-2xl p-2 shadow-2xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={viewingFile ? `Ask about ${viewingFile.name}...` : "Ask anything about the code..."}
                  className="flex-1 bg-transparent py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button type="submit" disabled={loading || !input.trim()} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 disabled:bg-white/10 disabled:text-slate-500 transition-all shadow-lg shadow-indigo-600/20">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#0B1120]">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
              <Brain size={48} className="text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black mb-3 text-white">DevOnboard Intelligence</h2>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">Select a repository from the sidebar to begin analyzing architecture, logic, and security.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;