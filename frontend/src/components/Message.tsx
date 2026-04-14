import { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { Copy, Check, Download, FileSpreadsheet, Clock, ClipboardCopy } from 'lucide-react';
import { Message as MessageType } from '../types';
import { SchemeCard } from './SchemeCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { exportMarkdownTableToExcel } from '../utils/exportToExcel';

interface MessageProps {
  message: MessageType;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT MENU COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ContextMenuProps {
  x: number;
  y: number;
  text: string;
  timestamp: Date;
  onClose: () => void;
}

function ContextMenu({ x, y, text, timestamp, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => { setCopied(false); onClose(); }, 1200);
    } catch {
      onClose();
    }
  };

  // Close on outside click or Escape
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  // Clamp position so the menu stays in viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 120),
    left: Math.min(x, window.innerWidth - 200),
    zIndex: 9999,
  };

  const formattedTime = timestamp.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      ref={menuRef}
      style={style}
      className="w-52 bg-[#1C1C1C] border border-white/[0.08] rounded-xl shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        onClick={handleCopy}
        className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
      >
        {copied
          ? <Check size={14} className="text-primary" />
          : <ClipboardCopy size={14} />
        }
        {copied ? 'Copied!' : 'Copy message'}
      </button>
      <div className="h-px bg-white/[0.05] mx-2 my-1" />
      <div className="flex items-start gap-2.5 px-3 py-2 text-[12px] text-text-secondary/60 cursor-default select-none">
        <Clock size={13} className="mt-0.5 flex-shrink-0" />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY BUTTON COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function CopyButton({ text, isUser }: { text: string; isUser: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy message"
      className={clsx(
        'opacity-0 group-hover:opacity-100 transition-all duration-200',
        'p-1.5 rounded-lg hover:scale-110 active:scale-95',
        'text-text-secondary hover:text-white hover:bg-white/10',
      )}
    >
      {copied
        ? <Check size={13} className="text-primary" />
        : <Copy size={13} />
      }
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MESSAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  // Safely coerce content to string
  const contentText: string = (() => {
    if (typeof message.content === 'string') return message.content;
    if (typeof message.content === 'object' && message.content !== null) {
      const c = message.content as Record<string, any>;
      return c.text ?? c.summary ?? JSON.stringify(c);
    }
    return '';
  })();

  // ── Context menu state ──────────────────────────────────────────────────
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // ── Timestamp helpers ──────────────────────────────────────────────────
  const timeString = message.timestamp instanceof Date
    ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <>
      <div
        className={clsx(
          'flex w-full animate-in slide-in-from-bottom-2 duration-500',
          isUser ? 'justify-end' : 'justify-start',
        )}
        onContextMenu={handleContextMenu}
      >
        <div className={clsx(
          'max-w-[85%] md:max-w-[80%]',
          isUser ? 'flex flex-col items-end' : 'flex flex-col items-start',
        )}>
          {/* Text Content — always rendered (empty string = streaming placeholder) */}
          {contentText !== undefined && (
            <>
              <div className={clsx(
                'relative group',
                isUser
                  ? 'bg-[#1E1E1E] text-white rounded-[24px] px-6 py-3'
                  : 'bg-transparent text-[#EAEAEA] rounded-none border-none py-1',
              )}>
                {/* Copy button — floats over the message bubble on hover */}
                {!message.isStreaming && contentText && (
                  <div className={clsx(
                    'absolute -top-2 flex items-center gap-1',
                    isUser ? '-left-8' : '-right-8',
                  )}>
                    <CopyButton text={contentText} isUser={isUser} />
                  </div>
                )}

                <div className={clsx(
                  'w-full leading-relaxed space-y-4 text-[15px]',
                  isUser ? 'text-right font-medium text-white' : 'text-left text-[#EAEAEA]',
                )}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold text-white mt-8 mb-4 first:mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-white mt-8 mb-4 first:mt-0" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-white mt-6 mb-3 first:mt-0" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                      hr: ({ node, ...props }) => <hr className="border-white/10 my-8" {...props} />,
                      table: ({ node, ...props }) => (
                        <div className="my-6 flex flex-col items-start gap-2">
                          <div className="overflow-x-auto w-full md:max-w-[70vw] rounded-lg border border-white/10 bg-black/20">
                            <table className="w-full border-collapse text-sm" {...props} />
                          </div>
                          {!isUser && !message.isStreaming && (
                            <button
                              onClick={() => exportMarkdownTableToExcel(
                                contentText,
                                message.agent ? `maya_${message.agent}` : 'maya_export',
                              )}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors duration-200"
                              title="Export table data to Excel"
                            >
                              <FileSpreadsheet size={14} />
                              Export to Excel
                            </button>
                          )}
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-white/5 border-b border-white/10" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="px-4 py-3 text-left text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap" {...props} />
                      ),
                      tbody: ({ node, ...props }) => <tbody className="divide-y divide-white/5" {...props} />,
                      tr: ({ node, ...props }) => <tr className="hover:bg-white/5 transition-colors" {...props} />,
                      td: ({ node, ...props }) => <td className="px-4 py-3 text-gray-300 text-sm align-top" {...props} />,
                      code: ({ node, ...props }) => (
                        <code className="bg-black/40 text-white px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-2 border-white/30 pl-4 italic text-white/70 my-4" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-none space-y-2 my-4" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="flex gap-2 text-[#EAEAEA] text-[15px] leading-7" {...props}>
                          <span className="text-primary mt-0.5">•</span>
                          <span>{props.children}</span>
                        </li>
                      ),
                      p: ({ node, ...props }) => (
                        <p className="text-[#EAEAEA] text-[15px] leading-7 mb-4 last:mb-0" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="text-white font-semibold" {...props} />
                      ),
                      img: ({ node, ...props }) => (
                        <div className="relative group my-4 rounded-lg overflow-hidden border border-white/10 bg-black/20 max-w-md">
                          <img
                            className="w-full h-auto object-cover"
                            {...props}
                            alt={props.alt || 'Generated Image'}
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
      </div>

      {/* Context Menu (Right-click) */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          text={contentText}
          timestamp={message.timestamp}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
