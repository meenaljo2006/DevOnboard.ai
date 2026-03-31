import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { Send, Loader2, Database } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeRepo, setActiveRepo] = useState('');
  const [indexedRepos, setIndexedRepos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllRepos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/repo/all`);
        if (res.data.success) {
          const readyUrls = res.data.repos.map(repo => repo.url);
          setIndexedRepos(readyUrls);
        }
      } catch (err) {
        console.error("Failed to fetch initial repos list", err);
      }
    };
    fetchAllRepos();
  }, []);

  useEffect(() => {
    if (activeRepo) {
      fetchHistory();
    }
  }, [activeRepo]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/repo/history?repoUrl=${activeRepo}`);
      if (res.data.success) {
        const formatted = res.data.messages.map(m => ({
          role: m.role,
          content: m.content,
          sources: m.sources || []
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error("History fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIndexSuccess = (url) => {
    if (!url) return;
    setIndexedRepos(prev => prev.includes(url) ? prev : [...prev, url]);
    setActiveRepo(url);

    setMessages([{ 
      role: 'assistant', 
      content: `The repository **${url.split('/').pop()}** has been indexed successfully.\n\nFeel free to ask any questions about its architecture, files, or functions.` 
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeRepo || loading) return;

    const currentQuestion = input.trim();
    const userMsg = { role: 'user', content: currentQuestion };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/repo/ask`, {
        question: currentQuestion,
        repoUrl: activeRepo
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: res.data.answer,
          sources: res.data.sources || []
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "The connection to the backend server has been interrupted. Please verify that the server is running."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      
      <Sidebar 
        onIndexSuccess={handleIndexSuccess} 
        onSelectRepo={(url) => {
          setActiveRepo(url);
          setMessages([]);
          setLoading(true);
        }}
        indexedRepos={indexedRepos}
        activeRepo={activeRepo}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {activeRepo ? (
          <>
            <header className="h-16 border-b border-slate-200 flex items-center px-6 bg-white">
              <div className="flex flex-col">
                <span className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.2em]">
                  Context Active
                </span>
                <h2 className="text-xs font-mono text-slate-600 truncate max-w-md">
                  {activeRepo}
                </h2>
              </div>
            </header>
            
            <ChatWindow messages={messages} loading={loading} activeRepo={activeRepo}/>
            {/* 🟢 TYPING INDICATOR: Loading ke waqt ye dikhega */}
            {loading && (
              <div className="px-6 py-2">
                <div className="flex items-center gap-2 text-indigo-500 text-xs font-medium animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  DevOnboard is thinking...
                </div>
              </div>
            )}

            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask anything about ${activeRepo.split('/').pop()}...`}
                  className="flex-1 bg-slate-100 border border-slate-300 rounded-2xl py-3.5 px-5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                </button>
              </form>

              <p className="text-[10px] text-center mt-2 text-slate-400 tracking-tight">
                DevOnboard.ai: Using RAG to provide code-level truth and citations.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mb-8 border border-indigo-200 shadow-lg">
              <Database size={44} className="text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight">DevOnboard.ai</h2>
            <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
              Connect your GitHub repository to generate technical insights and codebase citations.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;