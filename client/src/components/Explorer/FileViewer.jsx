import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Code2 } from 'lucide-react';

const FileViewer = ({ filename, content, onClose }) => {
  const getLanguage = (name) => {
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
    if (name.endsWith('.py')) return 'python';
    if (name.endsWith('.html')) return 'html';
    if (name.endsWith('.css')) return 'css';
    if (name.endsWith('.json')) return 'json';
    if (name.endsWith('.md')) return 'markdown';
    return 'javascript';
  };

  return (
    <div className="flex flex-col h-[calc(100%-2rem)] bg-[#020617] m-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-indigo-400" />
          <span className="text-sm font-mono font-medium text-slate-200 tracking-wide">{filename}</span>
        </div>
        
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto text-sm scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
        <SyntaxHighlighter 
          language={getLanguage(filename)} 
          style={vscDarkPlus}
          customStyle={{ 
            margin: 0, 
            padding: '24px', 
            backgroundColor: 'transparent', 
            fontSize: '13px',
            lineHeight: '1.6',
            height: '100%', 
          }}
          showLineNumbers={true}
          wrapLines={true}
          lineNumberStyle={{ minWidth: '3em', paddingRight: '1.5em', color: '#475569', textAlign: 'right' }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
      
    </div>
  );
};

export default FileViewer;