import { useState, useEffect, useRef, memo } from 'react';
import { Send, Sparkles, Menu, ChevronDown, PanelLeftOpen } from 'lucide-react';
import { Message } from '../types';
import { Message as MessageComponent } from '../components/Message';
import { Sidebar } from '../components/Sidebar';
import { chatService } from '../services/api';
import { ThinkingWithText } from '../components/ThinkingIndicator';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
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
            sessionIds.map(async (id) => {
                try {
                    const history = await chatService.getSessionHistory(id);
                    const firstUserMsg = history.find((msg: any) => msg.role === 'user');
                    let title = firstUserMsg ? firstUserMsg.content : `Session ${id.slice(0, 8)}`;
                    
                    // Simple logic to clean up the title (first 40 characters)
                    if (title.length > 40) {
                        title = title.substring(0, 40) + '...';
                    }
                    
                    return { id, title };
                } catch (e) {
                    return { id, title: `Session ${id.slice(0, 8)}` };
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
              type: 'text'
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
      setMessages([]);
      setCurrentSessionId(null);
      setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        // Decide if Scheme Search or Agent Chat based on keyword (Simple Client Router)
        // In full version, Backend Router handles this.
        // For MVP: If 'scheme' -> Scheme Search, Else -> Agent
        
        if (currentInput.toLowerCase().includes('scheme') || currentInput.toLowerCase().includes('subsidy')) {
             const schemes = await chatService.searchSchemes(currentInput);
             const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: schemes.length > 0 
                    ? "Here are some schemes that might help you:" 
                    : "I couldn't find any specific schemes matching your criteria right now.",
                timestamp: new Date(),
                type: 'scheme-list',
                schemes: schemes.map(s => ({
                    id: s.id.toString(),
                    name: s.name,
                    category: s.category,
                    description: s.description,
                    benefits: s.benefits,
                    relevance_score: 90,
                    explanation: "Matched based on your query",
                    key_benefit: s.benefits.substring(0, 50) + "..."
                }))
            };
            setMessages(prev => [...prev, aiMsg]);
        } else {
            // Agent Chat
            const response = await chatService.chatAgent(currentInput, currentSessionId || undefined);
            
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, aiMsg]);
            
            if (response.session_id && response.session_id !== currentSessionId) {
                setCurrentSessionId(response.session_id);
                loadSessions(); // Refresh session list
            }
        }

    } catch (error) {
        console.error("Error sending message:", error);
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Sorry, I encountered an error while processing your request.",
            timestamp: new Date(),
            type: 'text'
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSessionHistory}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
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
                <div className="flex items-center gap-1 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors group">
                    <span className="text-lg font-medium text-white">MAYA 1.0</span>
                    <ChevronDown size={16} className="text-text-secondary group-hover:text-white transition-colors" />
                </div>
            </div>
            
            {/* Model Selector (Mock) */}
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-text-secondary cursor-pointer hover:text-white transition-colors">
                <Sparkles size={14} className="text-primary" />
                <span>Maya V2 Flash</span>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth relative">
            {isHistoryLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : messages.length === 0 ? (
                /* Welcome Screen (New Chat) */
                <div className="flex flex-col items-center justify-center h-full px-4">
                    <h1 className="text-2xl md:text-3xl font-medium text-white mb-8 text-center animate-in slide-in-from-bottom-4 duration-700">
                        How can I help you grow?
                    </h1>
                    
                    {/* Centered Search Input */}
                    <div className="w-full max-w-2xl relative group animate-in slide-in-from-bottom-6 duration-700 delay-100">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
                        <div className="relative bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                             <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about market trends, schemes, or business ideas..."
                                className="w-full bg-transparent border-none outline-none text-white placeholder-text-secondary/50 px-4 py-4 resize-none h-[56px] max-h-[200px]"
                                rows={1}
                            />
                            <div className="flex justify-between items-center px-2 pb-2">
                                <div className="flex gap-2">
                                     {/* Quick Actions / Attachments (Mock) */}
                                </div>
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="p-2 rounded-lg bg-primary text-black hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Chat Messages List */
                <div className="flex flex-col min-h-full pb-48 pt-4"> {/* Increased pb for floating input */}
                     <div className="flex-1 w-full max-w-[850px] mx-auto px-4 md:px-8 space-y-6">
                        {messages.map((msg) => (
                            <MessageComponent key={msg.id} message={msg} />
                        ))}
                        {isLoading && (
                            <div className="w-full">
                                <ThinkingWithText />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                     </div>
                </div>
            )}
        </div>

        {/* Floating Input Bar (Ongoing Chat) */}
        {messages.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-20 pb-8 px-4">
                 <div className="max-w-[800px] mx-auto relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[28px] opacity-0 group-hover:opacity-100 blur-md transition duration-500" />
                    <div className="relative flex items-center bg-[#1a1a1a] rounded-[28px] border border-white/10 shadow-2xl px-2 py-1.5">
                        <div className="flex items-center gap-1 pl-2">
                             <button className="p-2 text-text-secondary hover:text-white transition-colors">
                                <Menu size={20} />
                             </button>
                        </div>
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message MAYA..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-text-secondary/50 px-3 py-3 resize-none max-h-[200px] min-h-[48px] text-[15px]"
                            rows={1}
                        />
                         <div className="flex items-center gap-2 pr-1">
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                         </div>
                    </div>
                     <p className="text-center text-[11px] text-text-secondary mt-3">
                        MAYA can make mistakes. Consider checking important information.
                    </p>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
}
