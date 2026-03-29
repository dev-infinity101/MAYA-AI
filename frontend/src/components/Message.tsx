import { clsx } from 'clsx';
import { Message as MessageType } from '../types';
import { SchemeCard } from './SchemeCard';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Sparkles, User2, Clock3, Pencil } from 'lucide-react';
import { useState } from 'react';

interface MessageProps {
  message: MessageType;
  onEditAndResend?: (messageId: string, content: string) => void;
}

export function Message({ message, onEditAndResend }: MessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    onEditAndResend?.(message.id, trimmed);
    setIsEditing(false);
  };

  return (
    <div 
      className={clsx(
        "flex w-full gap-4 animate-in slide-in-from-bottom-2 duration-500",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary md:flex">
          <Sparkles size={18} />
        </div>
      )}

      <div className={clsx(
          "max-w-[88%] md:max-w-[78%]",
          isUser ? "flex flex-col items-end" : "flex flex-col items-start"
      )}>
        <div className={clsx(
          "mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]",
          isUser ? "text-white/40" : "text-primary/70"
        )}>
          {isUser ? <User2 size={12} /> : <Sparkles size={12} />}
          <span>{isUser ? 'You' : message.agent || 'MAYA'}</span>
        </div>

        {/* Text Content */}
        {(message.content || message.isStreaming) && (
           <>
               <div className={clsx(
                "relative group w-full",
                isUser 
                    ? "rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 px-5 py-3 shadow-[0_10px_40px_rgba(16,185,129,0.12)]" 
                    : "rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
                )}>
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-[15px] text-white outline-none focus:border-primary/40"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setDraft(message.content);
                          setIsEditing(false);
                        }}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#00ffcc]"
                      >
                        Save & resend
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={clsx(
                    "w-full text-white/90 leading-relaxed space-y-4",
                    isUser ? "text-[15px]" : "text-[15px] md:text-[16px]"
                  )}>
                      <ReactMarkdown
                          components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-semibold text-white mt-8 mb-4 first:mt-0" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mt-8 mb-4 first:mt-0" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mt-6 mb-3 first:mt-0" {...props} />,
                              p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-7" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1" {...props} />,
                              hr: ({node, ...props}) => <hr className="border-white/10 my-8" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                              code: ({node, ...props}) => (
                                  <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[0.9em] font-mono" {...props} />
                              ),
                              blockquote: ({node, ...props}) => (
                                  <blockquote className="border-l-2 border-primary/30 pl-4 italic text-white/70 my-4" {...props} />
                              ),
                          }}
                      >
                          {message.content || "Thinking..."}
                      </ReactMarkdown>
                  </div>
                )}
                <div className={clsx(
                  "mt-3 flex items-center gap-3 text-[11px]",
                  isUser ? "justify-end text-white/40" : "justify-start text-white/45"
                )}>
                  <div className="flex items-center gap-1.5">
                    <Clock3 size={12} />
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {message.content && (
                    <button 
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-white/55 transition-colors hover:text-white hover:bg-white/5"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                  {isUser && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-white/55 transition-colors hover:text-white hover:bg-white/5"
                      title="Edit and resend"
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                </div>
           </>
        )}

        {/* Scheme List Content */}
        {message.type === 'scheme-list' && message.schemes && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full">
                {message.schemes.map((scheme) => (
                    <SchemeCard key={scheme.id} scheme={scheme} />
                ))}
            </div>
        )}
      </div>

      {isUser && (
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white md:flex">
          <User2 size={18} />
        </div>
      )}
    </div>
  );
}
