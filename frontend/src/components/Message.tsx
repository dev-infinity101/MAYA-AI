import { clsx } from 'clsx';
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
                    "w-full text-white/90 leading-relaxed space-y-4",
                    isUser ? "text-[15px]" : "text-[16px]"
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
                            code: ({node, ...props}) => (
                                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[0.9em] font-mono" {...props} />
                            ),
                            blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-2 border-primary/30 pl-4 italic text-white/70 my-4" {...props} />
                            ),
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
                </div>
                <div className={clsx(
                    "mt-1 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity",
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
