import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, PanelLeftOpen, Square, Plus, ArrowUp } from 'lucide-react';
import { Message } from '../types';
import { Message as MessageComponent } from '../components/Message';
import { Sidebar } from '../components/Sidebar';
import { chatService, chatStream } from '../services/api';
import { ThinkingWithText, ThinkingMode } from '../components/ThinkingIndicator';
import styles from './ChatInterface.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Detects whether the query is a scheme/government search */
function isSchemeQuery(message: string): boolean {
    const lower = message.toLowerCase();
    return (
        lower.includes('scheme') ||
        lower.includes('loan') ||
        lower.includes('subsidy') ||
        lower.includes('government') ||
        lower.includes('yojana') ||
        lower.includes('mudra') ||
        lower.includes('msme scheme') ||
        lower.includes('eligib')
    );
}

/** Detect which text agent to use */
function detectTextAgent(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('market') || lower.includes('trend') || lower.includes('competitor') || lower.includes('industry')) return 'market';
    if (lower.includes('brand') || lower.includes('logo') || lower.includes('name') || lower.includes('slogan')) return 'brand';
    if (lower.includes('finance') || lower.includes('tax') || lower.includes('cost') || lower.includes('loan')) return 'finance';
    if (lower.includes('marketing') || lower.includes('adverti') || lower.includes('social media') || lower.includes('seo')) return 'marketing';
    return 'general';
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT INPUT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    isLoading: boolean;
    handleStop: () => void;
    isCentered?: boolean;
    onNewChat?: () => void;
}

const ChatInputBox = ({
    input,
    setInput,
    handleSend,
    handleKeyDown,
    isLoading,
    handleStop,
    isCentered = false,
    onNewChat
}: ChatInputProps) => {
    return (
        <div className={`w-full max-w-2xl relative group animate-in fade-in duration-500 ${isCentered ? 'slide-in-from-bottom-6' : ''}`}>
            {/* Neon Gradient Animation */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/70 rounded-[26px] blur transition duration-500 ${isCentered ? 'opacity-20 group-hover:opacity-40' : 'opacity-0 group-hover:opacity-100'}`} />

            <div className="relative bg-[#212121] rounded-[26px] border border-white/5 shadow-xl overflow-hidden flex items-center min-h-[52px] transition-colors hover:bg-[#2f2f2f]">
                    <button
                        onClick={onNewChat}
                        className="p-3 ml-1 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title="New Chat"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                    </button>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isCentered ? "Ask anything" : "Message MAYA..."}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-text-secondary/60 px-2 py-3 resize-none h-[52px] max-h-[200px] custom-scrollbar text-[16px] leading-relaxed flex items-center pt-3.5"
                        rows={1}
                    />

                    <div className="flex items-center gap-1 pr-2">
                        {isLoading ? (
                            <button
                                onClick={handleStop}
                                className="p-1.5 rounded-full bg-white text-black hover:scale-105 transition-all flex items-center justify-center"
                            >
                                <Square size={16} fill="black" />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                                    input.trim()
                                    ? 'bg-white text-black hover:scale-105'
                                    : 'bg-[#3f3f3f] text-[#212121] cursor-not-allowed'
                                }`}
                            >
                                <ArrowUp size={20} strokeWidth={3} />
                            </button>
                        )}
                    </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  // thinkingMode drives the ThinkingWithText indicator.
  // null = hidden. A ThinkingMode value = visible with that mode.
  const [thinkingMode, setThinkingMode] = useState<ThinkingMode | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, isLoading, isStreaming, thinkingMode]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
        const sessions = await chatService.getSessions();
        setSessions(sessions);
    } catch (error) {
        console.error('Failed to load sessions', error);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
        setIsHistoryLoading(true);
        const history = await chatService.getSessionHistory(sessionId);

        // V2: history items have content_type + content (JSONB)
        const formattedMessages: Message[] = history.map((msg: any) => {
            const contentType = msg.content_type || 'text';
            const content = msg.content || {};

            // Reconstruct scheme cards from stored JSONB
            if (contentType === 'scheme_results') {
                return {
                    id: msg.id.toString(),
                    role: msg.role,
                    content: content.summary || '',
                    content_type: 'scheme_results',
                    timestamp: new Date(msg.timestamp),
                    type: 'scheme-list',
                    schemes: content.schemes || [],
                    agent: msg.agent_used || 'scheme',
                };
            }

            // Text or agent_response
            const textContent =
                typeof content === 'string' ? content :
                content.text || content.summary || JSON.stringify(content);

            return {
                id: msg.id.toString(),
                role: msg.role,
                content: textContent,
                content_type: contentType,
                timestamp: new Date(msg.timestamp),
                type: 'text',
                schemes: [],
                agent: msg.agent_used,
            };
        });

        setMessages(formattedMessages);
        setConversationId(sessionId);
    } catch (error) {
        console.error('Failed to load history', error);
    } finally {
        setIsHistoryLoading(false);
    }
  };

  const handleNewChat = () => {
    handleStop();
    setMessages([]);
    setConversationId(null);
    setInput('');
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsStreaming(false);
      setThinkingMode(null);
      setMessages(prev => prev.map((m, i) =>
          i === prev.length - 1 && m.isStreaming
              ? { ...m, isStreaming: false }
              : m
      ));
    }
  };

  // ── updateLastMessage — appends streamed chunk to last message ─────────────
  const updateLastMessage = useCallback((updater: (prev: string) => string) => {
    setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.isStreaming) {
            const currentText = typeof last.content === 'string' ? last.content : '';
            next[next.length - 1] = {
                ...last,
                content: updater(currentText),
            };
        }
        return next;
    });
  }, []);

  // ── markLastMessageDone — removes streaming cursor ─────────────────────────
  const markLastMessageDone = useCallback(() => {
    setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 && m.isStreaming
            ? { ...m, isStreaming: false }
            : m
    ));
  }, []);

  // ── MAIN SEND HANDLER ──────────────────────────────────────────────────────

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input;
    if (!textToSend.trim() || isLoading || isStreaming) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add user message to UI immediately
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: textToSend,
        content_type: 'text',
        timestamp: new Date(),
        type: 'text',
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    // Show 'thinking' the moment user hits send
    setThinkingMode('thinking');

    try {
        if (isSchemeQuery(textToSend)) {
            // ── SCHEME PATH: JSON, renders cards ─────────────────────────────
            // Switch to db-search mode while vector DB query runs
            setThinkingMode('db-search');

            const data = await chatService.chatAgent(
                textToSend,
                conversationId,
                controller.signal
            );

            // Response arrived — hide indicator before rendering card
            setThinkingMode(null);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                content_type: data.schemes?.length > 0 ? 'scheme_results' : 'text',
                timestamp: new Date(),
                type: data.schemes?.length > 0 ? 'scheme-list' : 'text',
                schemes: data.schemes || [],
                agent: data.agent,
            };
            setMessages(prev => [...prev, aiMsg]);

            const newConvId = data.conversation_id || data.session_id;
            if (newConvId && newConvId !== conversationId) {
                setConversationId(newConvId);
                loadSessions();
            }

        } else {
            // ── STREAMING PATH: SSE, text streams word by word ────────────────
            const detectedAgent = detectTextAgent(textToSend);

            // Switch mode based on agent type immediately (before API call)
            if (detectedAgent === 'market') {
                setThinkingMode('web-search');
            } else {
                setThinkingMode('agent-active');
            }

            let firstChunkReceived = false;

            // Add empty placeholder — ThinkingWithText shows until first chunk
            const streamingMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                content_type: 'agent_response',
                timestamp: new Date(),
                type: 'text',
                isStreaming: true,
                agent: detectedAgent,
            };
            setMessages(prev => [...prev, streamingMsg]);
            setIsStreaming(true);
            setIsLoading(false);

            await chatStream(
                {
                    message: textToSend,
                    agent: detectedAgent,
                    conversation_id: conversationId,
                },
                // onChunk — hide thinking on first chunk, then append text
                (chunk: string) => {
                    if (!firstChunkReceived) {
                        firstChunkReceived = true;
                        setThinkingMode(null); // text is arriving — hide indicator
                    }
                    updateLastMessage(prev => prev + chunk);
                },
                // onInit — store conversation_id
                (convId: string) => {
                    if (!conversationId) {
                        setConversationId(convId);
                        loadSessions();
                    }
                },
                // onDone — finalise message
                () => {
                    setIsStreaming(false);
                    setThinkingMode(null);
                    markLastMessageDone();
                },
                // onError
                (err: string) => {
                    setIsStreaming(false);
                    setThinkingMode(null);
                    markLastMessageDone();
                    console.error('Stream error:', err);
                },
                controller.signal
            );
        }

    } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
            console.log('🛑 MAYA: Generation stopped by user');
        } else {
            console.error('Error sending message:', error);
            let errorMessage = 'Sorry, I encountered an error while processing your request.';
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: errorMessage,
                content_type: 'text',
                timestamp: new Date(),
                type: 'text',
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setThinkingMode(null); // always clear on exit
        abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={conversationId}
        onSelectSession={loadSessionHistory}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative w-full h-full ${styles.sidebarBorder}`}>
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 bg-black/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                        title="Open sidebar"
                        className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                    >
                        <PanelLeftOpen size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-text-secondary cursor-pointer hover:text-white transition-colors">
                    <span className={`text-lg font-small text-grey ${styles.heading}`}>MAYA V2 Flash </span>
                    <ChevronDown size={16} className="text-text-secondary group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar ${styles.scrollArea}`}>
            {isHistoryLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            ) : messages.length === 0 ? (
                /* Welcome Screen (New Chat) */
                <div className="flex flex-col items-center justify-center h-full px-4">
                    <h1 className={`text-center animate-in slide-in-from-bottom-4 duration-700 tracking-tight font text-white mb-8 ${styles.welcomeTitle}`}>
                        How can I help you grow?
                    </h1>

                    {/* Centered Search Input */}
                    <ChatInputBox
                        input={input}
                        setInput={setInput}
                        handleSend={handleSend}
                        handleKeyDown={handleKeyDown}
                        isLoading={isLoading || isStreaming}
                        handleStop={handleStop}
                        isCentered={true}
                        onNewChat={handleNewChat}
                    />
                </div>
            ) : (
                /* Chat Messages List */
                <div className="flex flex-col min-h-full pb-48 pt-4">
                     <div className={`flex-1 w-full max-w-[850px] mx-auto ${styles.messageList}`}>
                        {messages.map((msg) => (
                            <div key={msg.id}>
                                <MessageComponent message={msg} />
                                {/* Streaming cursor removed — ThinkingWithText handles pre-chunk state */}
                            </div>
                        ))}
                        {/* ThinkingWithText — visible only while thinkingMode is non-null
                             and NOT while streaming text is already showing              */}
                        {thinkingMode && !messages.some(m => m.isStreaming && (m.content as string)?.length > 0) && (
                            <div className="w-full pl-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <ThinkingWithText
                                    mode={thinkingMode}
                                    text={
                                        thinkingMode === 'thinking'    ? 'Thinking...'      :
                                        thinkingMode === 'db-search'   ? 'Searching schemes' :
                                        thinkingMode === 'web-search'  ? 'Searching web'    :
                                                                          'Agent working'
                                    }
                                />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                     </div>
                </div>
            )}
        </div>

        {/* Floating Input Bar (Ongoing Chat) */}
        {messages.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-20 pb-8 px-4 z-10">
                 <div className="max-w-[850px] mx-auto flex justify-center">
                    <ChatInputBox
                        input={input}
                        setInput={setInput}
                        handleSend={handleSend}
                        handleKeyDown={handleKeyDown}
                        isLoading={isLoading || isStreaming}
                        handleStop={handleStop}
                        isCentered={false}
                        onNewChat={handleNewChat}
                    />
                 </div>
                 <p className="text-center text-[11px] text-text-secondary mt-3">
                    MAYA can make mistakes. Consider checking important information.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
