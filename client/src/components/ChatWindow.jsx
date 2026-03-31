import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatWindow = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Jab bhi naya message aaye ya loading state badle, niche scroll karo
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scrollbar relative">
      {messages && messages.length > 0 ? (
        messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
              msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <div className="prose max-w-none text-sm leading-relaxed">
                <ReactMarkdown
                  children={msg.content || ""}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="my-4 rounded-lg overflow-hidden border border-slate-200">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1rem', fontSize: '13px' }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="bg-slate-200 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-xs" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                />
              </div>

              {/* Citations */}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-md">
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
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <p className="text-sm font-medium">No messages yet. Ask something about the code!</p>
        </div>
      )}

      {/* 🟢 REAL CHAT THINKING BUBBLE */}
      {loading && (
        <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            <span className="text-[10px] text-slate-400 ml-2 font-medium">DevOnboard is thinking...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;