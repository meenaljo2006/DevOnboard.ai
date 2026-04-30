import React, { useState } from 'react';
import { Folder, FileCode, ChevronDown, ChevronRight, Hash, FileJson, Layout } from 'lucide-react';

// 🟢 Helper: File type ke hisaab se icon chunne ke liye
const getFileIcon = (fileName) => {
  if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return <FileCode size={16} className="text-yellow-500" />;
  if (fileName.endsWith('.css')) return <Hash size={16} className="text-blue-400" />;
  if (fileName.endsWith('.json')) return <FileJson size={16} className="text-orange-400" />;
  if (fileName.endsWith('.html')) return <Layout size={16} className="text-red-400" />;
  return <FileCode size={16} className="text-slate-400" />;
};

const FileTreeItem = ({ item, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.type === 'folder') {
    return (
      <div className="select-none">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center gap-2 py-1.5 px-3 hover:bg-slate-100 rounded-md cursor-pointer transition-all duration-200"
        >
          {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
          <Folder size={18} className={`transition-colors ${isOpen ? 'text-indigo-500 fill-indigo-50' : 'text-slate-400'}`} />
          <span className="text-sm font-medium text-slate-700">{item.name}</span>
        </div>
        {isOpen && item.children && (
          <div className="ml-4 pl-2 border-l border-slate-200 mt-0.5">
            {item.children.map((child, index) => (
              <FileTreeItem key={index} item={child} onFileSelect={onFileSelect} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={() => onFileSelect(item.path)}
      className="flex items-center gap-2 py-1.5 px-3 ml-4 hover:bg-indigo-50 hover:text-indigo-600 rounded-md cursor-pointer transition-all group"
    >
      {getFileIcon(item.name)}
      <span className="text-sm text-slate-600 group-hover:text-indigo-600 truncate">
        {item.name}
      </span>
    </div>
  );
};

const FileTree = ({ structure, onFileSelect }) => {
  if (!structure || structure.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center border-t border-slate-100">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
          <Folder size={20} className="text-slate-300" />
        </div>
        <p className="text-xs font-medium text-slate-400 italic leading-relaxed">
          Select a repository to <br/> view its structure.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col border-r border-slate-200 w-64 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-50 bg-slate-50/50">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          Files
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {structure.map((item, index) => (
          <FileTreeItem key={index} item={item} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;