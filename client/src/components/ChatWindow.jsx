// src/components/ChatWindow.jsx
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatWindow = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0B1120] custom-scrollbar relative">
      {messages && messages.length > 0 ? (
        messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-3xl shadow-lg ${
              msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm backdrop-blur-md'
            }`}>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown
                  children={msg.content || ""}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="my-5 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1.2rem', fontSize: '13px', background: '#020617' }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded-md font-mono text-xs border border-white/5" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                />
              </div>

              {/* Citations / Sources */}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg shadow-sm">
                        📄 {source.fileName} ({source.lines})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-500">
          <p className="text-sm font-medium tracking-wide">No messages yet. Ask something about the code!</p>
        </div>
      )}

      {/* 🟢 Dark Theme Thinking Bubble */}
      {loading && (
        <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-sm shadow-md flex gap-2 items-center backdrop-blur-md">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
            <span className="text-xs text-slate-400 ml-3 font-medium">DevOnboard is mapping logic...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;