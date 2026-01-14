import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Menu, ChevronDown, PlusCircle } from 'lucide-react';
import { Message, Scheme } from '../types';
import { Message as MessageComponent } from '../components/Message';
import { Sidebar } from '../components/Sidebar';
import { chatService } from '../services/api';
import { ThinkingWithText } from '../components/ThinkingIndicator';

export function ChatInterface() {
  // --- States ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. Session Management ---
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionIds = await chatService.getSessions();
      const sessionsWithTitles = await Promise.all(
        sessionIds.map(async (id: string) => {
          try {
            const history = await chatService.getSessionHistory(id);
            const firstUserMsg = history.find((msg: any) => msg.role === 'user');
            let title = firstUserMsg ? firstUserMsg.content : `Session ${id.slice(0, 8)}`;
            if (title.length > 35) title = title.substring(0, 35) + '...';
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
    setMessages([]);
    setCurrentSessionId(null);
    setInput('');
  };

  // --- 2. Message Handling ---
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
      // Direct call to our LangGraph Agent API
      const data = await chatService.chatAgent(currentInput, currentSessionId || undefined);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        // Backend se aayi schemes agar hain toh type 'scheme-list' hoga
        type: data.schemes && data.schemes.length > 0 ? 'scheme-list' : 'text',
        schemes: data.schemes || [],
        agent: data.agent // Kaunsa agent bol raha hai (Router/Scheme/Finance)
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (data.session_id && data.session_id !== currentSessionId) {
        setCurrentSessionId(data.session_id);
        loadSessions(); 
      }
    } catch (error) {
      console.error("Agent Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to my agents. Please try again.",
        timestamp: new Date(),
        type: 'text'
      }]);
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

  // --- 3. UI Render ---
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

      <div className="flex-1 flex flex-col relative w-full h-full border-l border-white/5">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 bg-black/40 backdrop-blur-xl z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-text-secondary hover:text-white transition-colors">
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-all">
              <span className="text-sm font-bold tracking-tight text-white/90">MAYA 1.0</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-text-secondary">
            <Sparkles size={12} className="text-primary" />
            <span>POWERED BY MULTI-AGENT ARCHITECTURE</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {isHistoryLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            /* Welcome State */
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Welcome to MAYA</h1>
              <p className="text-text-secondary max-w-md mb-8">
                Your autonomous business agent for schemes, market trends, and scaling in India.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                {['Show me UP Startup schemes', 'Business plan for a cafe', 'Loan for textile machinery', 'Market trends in AI'].map((hint) => (
                  <button 
                    key={hint}
                    onClick={() => { setInput(hint); }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl text-left text-sm hover:border-primary/50 transition-all hover:bg-white/10"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Chat State */
            <div className="max-w-[850px] mx-auto w-full px-4 md:px-8 py-10 space-y-8">
              {messages.map((msg) => (
                <MessageComponent key={msg.id} message={msg} />
              ))}
              {isLoading && <ThinkingWithText />}
              <div ref={messagesEndRef} className="h-32" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent pt-10 pb-6 px-4">
          <div className="max-w-[800px] mx-auto">
            <div className="relative flex flex-col bg-[#111] rounded-2xl border border-white/10 shadow-2xl focus-within:border-primary/50 transition-all">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask MAYA about business, schemes, or growth..."
                className="w-full bg-transparent border-none outline-none text-white placeholder-text-secondary/40 px-5 py-4 resize-none max-h-[200px] min-h-[60px] text-[15px]"
                rows={1}
              />
              <div className="flex justify-between items-center px-3 pb-3">
                <button onClick={handleNewChat} className="p-2 text-text-secondary hover:text-white transition-colors">
                  <PlusCircle size={20} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 rounded-xl bg-primary text-black font-bold hover:scale-105 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest">
              Autonomous Intelligence Layer v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}