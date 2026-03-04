import { useState } from 'react';
import { Github, Database, Loader2, Plus } from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ onIndexSuccess, onSelectRepo, indexedRepos, activeRepo }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleIndex = async () => {
    if (!url.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/repo/index-repo', { repoUrl: url });

      if (res.data.success) {
        onIndexSuccess(url);
        setUrl('');
      }
    } catch (err) {
      console.error("Indexing error:", err);
      alert("Indexing failed. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-72 h-screen bg-white border-r border-slate-200 flex flex-col">

      <div className="p-6">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-8">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Database size={20}/>
          </div>
          DevOnboard.ai
        </h1>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              New Repository
            </label>

            <div className="mt-2 flex flex-col gap-2">
              <input 
                type="text"
                placeholder="https://github.com/..."
                className="bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <button 
                onClick={handleIndex}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white p-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus size={16}/> Index Repo</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
          Indexed Codebases
        </label>

        <div className="mt-3 space-y-1">
          {indexedRepos && indexedRepos.map((repo, i) => (
            <button 
              key={i}
              onClick={() => onSelectRepo(repo)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs transition-all ${
                activeRepo === repo
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Github size={14} className={activeRepo === repo ? 'text-indigo-600' : 'text-slate-400'} />
              <span className="truncate">{repo.split('/').pop()}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Sidebar;