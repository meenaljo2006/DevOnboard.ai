import { useState, useEffect } from 'react';
import { Github, Loader2, Plus, Bot, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ onIndexSuccess, onSelectRepo, indexedRepos, activeRepo }) => {
  const [url, setUrl] = useState('');
  const [localRepos, setLocalRepos] = useState([]); // Array of objects {url, indexingStatus}
  const [isInputLoading, setIsInputLoading] = useState(false);

  // Poll database for status updates
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/repo/all-status'); 
        // Note: Ek naya route bana lo backend mein jo saare repos ka status de
        if (res.data.success) {
          setLocalRepos(res.data.repos);
        }
      } catch (err) { console.log("Status poll failed"); }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 3000); // Har 3 sec mein check karega
    return () => clearInterval(interval);
  }, []);

  const handleIndex = async () => {
    if (!url.trim()) return;
    setIsInputLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/repo/index-repo', { repoUrl: url });
      if (res.data.success) {
        setUrl('');
        // indexingStatus backend mein handle ho jayega
      }
    } catch (err) {
      alert("Failed to start indexing");
    } finally {
      setIsInputLoading(false);
    }
  };

  return (
    <div className="w-72 h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-8">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Bot size={20}/>
          </div>
          DevOnboard.ai
        </h1>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            New Repository
          </label>
          <div className="mt-2 flex flex-col gap-2">
            <input 
              type="text"
              placeholder="https://github.com/..."
              className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={handleIndex}
              disabled={isInputLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white p-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              {isInputLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus size={16}/> Index Repo</>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
          Codebases
        </label>

        <div className="mt-3 space-y-2">
          {localRepos.map((repo, i) => {
            const isReady = repo.indexingStatus === 'Ready';
            const isFailed = repo.indexingStatus === 'Failed';
            const isProcessing = !isReady && !isFailed;

            return (
              <div key={i} className={`p-3 rounded-xl border transition-all ${
                activeRepo === repo.url ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'
              }`}>
                <button 
                  onClick={() => isReady && onSelectRepo(repo.url)}
                  disabled={!isReady}
                  className={`w-full flex items-center gap-3 text-left text-xs ${
                    isReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                  }`}
                >
                  <Github size={14} className={isReady ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className="truncate font-medium flex-1">{repo.name || repo.url.split('/').pop()}</span>
                  {isReady && <CheckCircle2 size={12} className="text-green-500" />}
                  {isFailed && <AlertCircle size={12} className="text-red-500" />}
                </button>

                {/* 🔵 PROGRESS UI */}
                {isProcessing && (
                  <div className="mt-2 pl-7">
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-2/3 animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Loader2 size={8} className="animate-spin text-indigo-500" />
                      <span className="text-[9px] text-indigo-600 font-medium italic">
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
    </div>
  );
};

export default Sidebar;