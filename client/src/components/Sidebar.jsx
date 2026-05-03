// src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Github, Loader2, Plus, Bot, CheckCircle2, AlertCircle, LogOut, User as UserIcon ,Brain} from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ onIndexSuccess, onSelectRepo, indexedRepos, activeRepo, user, onLogout }) => {
  const [url, setUrl] = useState('');
  const [localRepos, setLocalRepos] = useState([]);
  const [isInputLoading, setIsInputLoading] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/repo/all-status'); 
        if (res.data.success) {
          setLocalRepos(res.data.repos);
        }
      } catch (err) { console.log("Status poll failed"); }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleIndex = async () => {
    if (!url.trim()) return;
    setIsInputLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/repo/index-repo', { repoUrl: url });
      if (res.data.success) {
        setUrl('');
        onIndexSuccess(); // Refresh parent if needed
      }
    } catch (err) {
      alert("Failed to start indexing");
    } finally {
      setIsInputLoading(false);
    }
  };

  return (
    <div className="w-72 h-screen bg-[#020617] border-r border-white/5 flex flex-col text-slate-300">
      <div className="p-6">
        {/* Branding */}
        <h1 className="text-xl font-black text-blue-200 flex items-center mb-8 ">
          <div className="p-1.5 ">
            <Brain size={20} className="text-white" />
          </div>
          DevOnboard <span className="text-xl text-white">.ai</span>
        </h1>

        {/* Input Section */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            New Repository
          </label>
          <div className="mt-2 flex flex-col gap-3">
            <input 
              type="text"
              placeholder="https://github.com/..."
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={handleIndex}
              disabled={isInputLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-slate-500 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              {isInputLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus size={16}/> Index Repo</>}
            </button>
          </div>
        </div>
      </div>

      {/* Repo List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3 block">
          Indexed Codebases
        </label>

        <div className="space-y-2">
          {localRepos.map((repo, i) => {
            const isReady = repo.indexingStatus === 'Ready';
            const isFailed = repo.indexingStatus === 'Failed';
            const isProcessing = !isReady && !isFailed;

            return (
              <div key={i} className={`p-3 rounded-2xl border transition-all ${
                activeRepo === repo.url ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}>
                <button 
                  onClick={() => isReady && onSelectRepo(repo.url)}
                  disabled={!isReady}
                  className={`w-full flex items-center gap-3 text-left text-xs ${
                    isReady ? 'cursor-pointer text-slate-200' : 'cursor-not-allowed text-slate-500'
                  }`}
                >
                  <Github size={16} className={isReady ? 'text-indigo-400' : 'text-slate-600'} />
                  <span className="truncate font-medium flex-1">{repo.name || repo.url.split('/').pop()}</span>
                  {isReady && <CheckCircle2 size={14} className="text-emerald-400" />}
                  {isFailed && <AlertCircle size={14} className="text-red-400" />}
                </button>

                {/* Progress UI */}
                {isProcessing && (
                  <div className="mt-3 pl-8">
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-2/3 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 size={10} className="animate-spin text-indigo-400" />
                      <span className="text-[10px] text-indigo-400 font-medium tracking-wide">
                        {repo.indexingStatus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🟢 NEW: User Profile & Logout */}
      {user && (
        <div className="p-4 ">
          <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white truncate">{user.name}</span>
                <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;