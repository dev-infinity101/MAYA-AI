import { useState, useEffect, useRef } from 'react';
import { ChevronDown, PanelLeftOpen, Square, Plus, ArrowUp } from 'lucide-react';
import { Message } from '../types';
import { Message as MessageComponent } from '../components/Message';
import { Sidebar } from '../components/Sidebar';
import { chatService } from '../services/api';
import { ThinkingWithText, ThinkingMode } from '../components/ThinkingIndicator';
import styles from './ChatInterface.module.css';

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

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [lastQuery, setLastQuery] = useState('');
  const [thinkingState, setThinkingState] = useState<{ text: string; mode: ThinkingMode }>({
    text: 'Thinking',
    mode: 'thinking'
  });
  
  // Ref for AbortController to stop generation
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
        const sessionIds = await chatService.getSessions();
        
        // Fetch history for each session to determine the title from the first user message
        const sessionsWithTitles = await Promise.all(
            sessionIds.map(async (id: string) => {
                try {
                    const history = await chatService.getSessionHistory(id);
                    const firstUserMsg = history.find((msg: any) => msg.role === 'user');
                    let title = firstUserMsg ? firstUserMsg.content : `Session ${id.slice(0, 8)}`;
                    
                    // Simple logic to clean up the title (first 35 characters)
                    if (title.length > 35) {
                        title = title.substring(0, 35) + '...';
                    }
                    
                    return { id, title };
                } catch (e) {
                    return { id, title: `Chat ${id.slice(0, 5)}` };
                }
            })
        );
        
        setSessions(sessionsWithTitles);
    } catch (error) {
        console.error("Failed to load sessions", error);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
      try {
          setIsHistoryLoading(true);
          const history = await chatService.getSessionHistory(sessionId);
          // Transform history to Message type
          const formattedMessages: Message[] = history.map((msg: any) => ({
              id: msg.id.toString(),
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              type: msg.role === 'assistant' && msg.schemes?.length > 0 ? 'scheme-list' : 'text',
              schemes: msg.schemes || []
          }));
          setMessages(formattedMessages);
          setCurrentSessionId(sessionId);
      } catch (error) {
          console.error("Failed to load history", error);
      } finally {
          setIsHistoryLoading(false);
      }
  };

  const handleNewChat = () => {
      handleStop(); // Stop any ongoing generation
      setMessages([]);
      setCurrentSessionId(null);
      setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, thinkingState]);

  useEffect(() => {
    if (!isLoading) {
      setThinkingState({ text: 'Thinking', mode: 'thinking' });
      return;
    }

    const query = lastQuery.toLowerCase();
    let timeout1: ReturnType<typeof setTimeout> | undefined;
    let timeout2: ReturnType<typeof setTimeout> | undefined;

    setThinkingState({ text: 'Thinking', mode: 'thinking' });

    timeout1 = setTimeout(() => {
      if (query.includes('market') || query.includes('trend') || query.includes('competitor') || query.includes('industry')) {
        setThinkingState({ text: 'Market Research Agent Activated', mode: 'agent-active' });
        timeout2 = setTimeout(() => {
          setThinkingState({ text: 'Searching the web...', mode: 'web-search' });
        }, 1500);
      } else if (query.includes('scheme') || query.includes('loan') || query.includes('subsidy') || query.includes('gov')) {
        setThinkingState({ text: 'Scheme Navigator Activated', mode: 'agent-active' });
        timeout2 = setTimeout(() => {
          setThinkingState({ text: 'Searching Database...', mode: 'db-search' });
        }, 1500);
      } else if (query.includes('brand') || query.includes('logo') || query.includes('name') || query.includes('slogan')) {
        setThinkingState({ text: 'Brand Consultant Activated', mode: 'agent-active' });
        timeout2 = setTimeout(() => {
          setThinkingState({ text: 'Generating creative concepts...', mode: 'thinking' });
        }, 1500);
      } else if (query.includes('finance') || query.includes('tax') || query.includes('cost')) {
        setThinkingState({ text: 'Financial Advisor Activated', mode: 'agent-active' });
      } else if (query.includes('market') && (query.includes('strategy') || query.includes('plan'))) {
        setThinkingState({ text: 'Marketing Strategist Activated', mode: 'agent-active' });
      }
    }, 1500);

    return () => {
      if (timeout1) clearTimeout(timeout1);
      if (timeout2) clearTimeout(timeout2);
    };
  }, [isLoading, lastQuery]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input;
    if (!textToSend.trim() || isLoading) return;

    // Create new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLastQuery(textToSend);
    setIsLoading(true);

    try {
        const data = await chatService.chatAgent(
            textToSend, 
            currentSessionId || undefined, 
            controller.signal
        );
        
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
            type: data.schemes && data.schemes.length > 0 ? 'scheme-list' : 'text',
            schemes: data.schemes || [],
            agent: data.agent
        };

        setMessages(prev => [...prev, aiMsg]);
        
        if (data.session_id && data.session_id !== currentSessionId) {
            setCurrentSessionId(data.session_id);
            loadSessions(); 
        }

    } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
            console.log("🛑 MAYA: Generation stopped by user");
        } else {
            console.error("Error sending message:", error);
            let errorMessage = "Sorry, I encountered an error while processing your request.";
            
            // Extract specific error message from backend if available
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = error.response.data.detail;
            }

            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        sessions={sessions}
        currentSessionId={currentSessionId}
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
                        isLoading={isLoading}
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
                            <MessageComponent key={msg.id} message={msg} />
                        ))}
                        {isLoading && (
                            <div className="w-full pl-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <ThinkingWithText text={thinkingState.text} mode={thinkingState.mode} />
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
                        isLoading={isLoading}
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
