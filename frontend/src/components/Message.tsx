import { clsx } from 'clsx';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Message as MessageType } from '../types';
import { SchemeCard } from './SchemeCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { exportMarkdownTableToExcel } from '../utils/exportToExcel';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  // Safely coerce content to string — handles:
  //   • plain string (normal case)
  //   • empty string "" (streaming start)
  //   • JSONB object { text: "..." } or { summary: "..." } (history reload edge case)
  const contentText: string = (() => {
    if (typeof message.content === 'string') return message.content;
    if (typeof message.content === 'object' && message.content !== null) {
      const c = message.content as Record<string, any>;
      return c.text ?? c.summary ?? JSON.stringify(c);
    }
    return '';
  })();

  return (
    <div
      className={clsx(
        "flex w-full animate-in slide-in-from-bottom-2 duration-500",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={clsx(
          "max-w-[85%] md:max-w-[80%]",
          isUser ? "flex flex-col items-end" : "flex flex-col items-start"
      )}>
        {/* Text Content — always rendered (empty string = streaming placeholder) */}
        {(contentText !== undefined) && (
           <>
               <div className={clsx(
                "relative group",
                isUser
                    ? "bg-[#006b33] text-white rounded-[24px] px-5 py-2.5 shadow-sm"
                    : "bg-transparent text-white rounded-none border-none px-0 py-3"
                )}>
                    <div className={clsx(
                    "w-full text-white/90 leading-relaxed space-y-4 text-[14px]",
                    isUser ? "text-right" : "text-left"
                )}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-semibold text-white mt-8 mb-4 first:mt-0" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mt-8 mb-4 first:mt-0" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mt-6 mb-3 first:mt-0" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                            hr: ({node, ...props}) => <hr className="border-white/10 my-8" {...props} />,
                            table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-3 md:max-w-[70vw]">
                                    <table className="w-full border-collapse text-sm" {...props} />
                                </div>
                            ),
                            thead: ({node, ...props}) => (
                                <thead className="bg-white/5 border-b border-white/10" {...props} />
                            ),
                            th: ({node, ...props}) => (
                                <th className="px-4 py-3 text-left text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap" {...props} />
                            ),
                            tbody: ({node, ...props}) => <tbody className="divide-y divide-white/5" {...props} />,
                            tr: ({node, ...props}) => <tr className="hover:bg-white/5 transition-colors" {...props} />,
                            td: ({node, ...props}) => <td className="px-4 py-3 text-gray-300 text-sm align-top" {...props} />,
                            
                            code: ({node, ...props}) => (
                                <code className="bg-black/40 text-white px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                            ),
                            blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-2 border-white/30 pl-4 italic text-white/70 my-4" {...props} />
                            ),
                            ul: ({node, ...props}) => (
                                <ul className="list-none space-y-2 my-4" {...props} />
                            ),
                            li: ({node, ...props}) => (
                                <li className="flex gap-2 text-gray-300 text-sm" {...props}>
                                    <span className="text-white mt-0.5">•</span>
                                    <span>{props.children}</span>
                                </li>
                            ),
                            p: ({node, ...props}) => (
                                <p className="text-gray-300 text-sm leading-relaxed mb-4 last:mb-0" {...props} />
                            ),
                            strong: ({node, ...props}) => (
                                <strong className="text-white font-bold" {...props} />
                            ),
                            img: ({node, ...props}) => (
                                <div className="relative group my-4 rounded-lg overflow-hidden border border-white/10 bg-black/20 max-w-md">
                                    <img
                                        className="w-full h-auto object-cover"
                                        {...props}
                                        alt={props.alt || "Generated Image"}
                                    />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={props.src}
                                            download={`maya-generated-${Date.now()}.png`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
                                            title="Download Image"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </div>
                                </div>
                            ),
                        }}
                    >
                        {contentText}
                    </ReactMarkdown>

                    {!isUser && contentText.includes('|') && !message.isStreaming && (
                        <button
                            onClick={() => exportMarkdownTableToExcel(
                                contentText,
                                message.agent ? `maya_${message.agent}` : 'maya_export'
                            )}
                            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors duration-200"
                        >
                            <FileSpreadsheet size={14} />
                            Export to Excel
                        </button>
                    )}
                </div>
                </div>
                <div className={clsx(
                    "mt-1 text-[11px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity",
                    isUser ? "text-right pr-2" : "text-left"
                )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
}
