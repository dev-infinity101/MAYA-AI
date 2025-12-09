import React from 'react';
import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';
import { Message as MessageType } from '../types';
import { SchemeCard } from './SchemeCard';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div 
      className={clsx(
        "flex gap-4 animate-in slide-in-from-bottom-2 duration-500",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-2",
          isUser ? "bg-white/10" : "bg-primary/20"
      )}>
          {isUser ? <User size={16} /> : <Bot size={16} className="text-primary" />}
      </div>
      
      <div className={clsx(
          "max-w-[85%] md:max-w-[75%]",
          isUser ? "flex justify-end" : ""
      )}>
        {/* Text Content */}
        {message.content && (
           <div className={clsx(
            "rounded-2xl p-6 relative group mb-4",
            isUser 
                ? "bg-white/5 border border-primary/30 text-white rounded-tr-none backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,178,0.05)]" 
                : "glass-panel text-white rounded-tl-none"
            )}>
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <div className={clsx(
                    "absolute -bottom-6 text-xs text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity",
                    isUser ? "right-0" : "left-0"
                )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
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
