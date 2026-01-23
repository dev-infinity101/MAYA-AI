import { clsx } from 'clsx';
import { Download } from 'lucide-react';
import { Message as MessageType } from '../types';
import { SchemeCard } from './SchemeCard';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

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
        {/* Text Content */}
        {message.content && (
           <>
               <div className={clsx(
                "relative group",
                isUser 
                    ? "bg-[#006b33] text-white rounded-[24px] px-5 py-2.5 shadow-sm" 
                    : "bg-transparent text-white rounded-none border-none px-0 py-3"
                )}>
                    <div className={clsx(
                    "w-full text-white/90 leading-relaxed space-y-4 text-[14px]", // Main chat text 14px
                    isUser ? "text-right" : "text-left"
                )}>
                    <ReactMarkdown
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-semibold text-white mt-8 mb-4 first:mt-0" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mt-8 mb-4 first:mt-0" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mt-6 mb-3 first:mt-0" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            hr: ({node, ...props}) => <hr className="border-white/10 my-8" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                            table: ({node, ...props}) => (
                                <div className="my-6 w-full overflow-hidden rounded-lg border border-white/10">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm" {...props} />
                                    </div>
                                </div>
                            ),
                            thead: ({node, ...props}) => <thead className="bg-white/5 text-white/90" {...props} />,
                            tbody: ({node, ...props}) => <tbody className="divide-y divide-white/5" {...props} />,
                            tr: ({node, ...props}) => <tr className="transition-colors hover:bg-white/5" {...props} />,
                            th: ({node, ...props}) => <th className="px-4 py-3 font-semibold" {...props} />,
                            td: ({node, ...props}) => <td className="px-4 py-3 align-top text-white/70" {...props} />,
                            code: ({node, ...props}) => (
                                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[0.9em] font-mono" {...props} />
                            ),
                            blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-2 border-primary/30 pl-4 italic text-white/70 my-4" {...props} />
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
                        {message.content}
                    </ReactMarkdown>
                </div>
                </div>
                <div className={clsx(
                    "mt-1 text-[11px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity", // Timestamp 11px
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
