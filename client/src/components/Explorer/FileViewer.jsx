import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X } from 'lucide-react';

const FileViewer = ({ filename, content, onClose }) => {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-slate-800">
        <span className="text-xs font-mono text-slate-300">{filename}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-auto text-sm custom-scrollbar">
        <SyntaxHighlighter 
          language="javascript" 
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '20px', backgroundColor: 'transparent' }}
          showLineNumbers={true}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default FileViewer;