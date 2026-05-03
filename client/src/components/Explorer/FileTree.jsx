// src/components/Explorer/FileTree.jsx
import React, { useState } from 'react';
import { Folder, FileCode, ChevronDown, ChevronRight, Hash, FileJson, Layout } from 'lucide-react';

// 🟢 Helper: Dark mode ke liye vibrant icons
const getFileIcon = (fileName) => {
  if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return <FileCode size={16} className="text-yellow-400" />;
  if (fileName.endsWith('.css')) return <Hash size={16} className="text-cyan-400" />;
  if (fileName.endsWith('.json')) return <FileJson size={16} className="text-emerald-400" />;
  if (fileName.endsWith('.html')) return <Layout size={16} className="text-orange-400" />;
  if (fileName.endsWith('.md')) return <FileCode size={16} className="text-purple-400" />;
  return <FileCode size={16} className="text-slate-500" />;
};

const FileTreeItem = ({ item, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.type === 'folder') {
    return (
      <div className="select-none">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center gap-2 py-1.5 px-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-200"
        >
          {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
          <Folder size={16} className={`transition-colors ${isOpen ? 'text-indigo-400 fill-indigo-400/20' : 'text-slate-500'}`} />
          <span className="text-sm font-medium text-slate-300">{item.name}</span>
        </div>
        
        {/* Child Items with a subtle left border line */}
        {isOpen && item.children && (
          <div className="ml-4 pl-2 border-l border-white/10 mt-1">
            {item.children.map((child, index) => (
              <FileTreeItem key={index} item={child} onFileSelect={onFileSelect} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File Item Render
  return (
    <div 
      onClick={() => onFileSelect(item.path)}
      className="flex items-center gap-2 py-1.5 px-3 ml-4 hover:bg-indigo-500/10 hover:text-indigo-300 rounded-lg cursor-pointer transition-all group"
    >
      <div className="group-hover:scale-110 transition-transform">
        {getFileIcon(item.name)}
      </div>
      <span className="text-sm text-slate-400 group-hover:text-indigo-300 truncate transition-colors">
        {item.name}
      </span>
    </div>
  );
};

const FileTree = ({ structure, onFileSelect }) => {
  if (!structure || structure.length === 0) {
    return (
      <div className="h-full w-64 bg-[#0B1120] border-r border-white/5 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/10">
          <Folder size={20} className="text-slate-500" />
        </div>
        <p className="text-xs font-medium text-slate-500 italic leading-relaxed">
          Select a repository to <br/> view its structure.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-64 bg-[#0B1120] border-r border-white/5 shadow-xl z-10">
      {/* File Tree Header */}
      <div className="p-4 border-b border-white/5 bg-[#020617]/50 backdrop-blur-md">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></span>
          Explorer
        </h3>
      </div>
      
      {/* Files Container */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {structure.map((item, index) => (
          <FileTreeItem key={index} item={item} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;