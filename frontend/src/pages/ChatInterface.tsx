import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Menu, ChevronDown, PanelLeftOpen } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, Menu, ChevronDown, PlusCircle, Square } from 'lucide-react';
import { Message } from '../types';
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
  
  // Ref for AbortController to stop generation
  const abortControllerRef = useRef<AbortController | null>(null);
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
    handleStop(); // Stop any ongoing generation
    setMessages([]);
    setCurrentSessionId(null);
    setInput('');
  };

  // --- 2. Message & Abort Handling ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

const handleSend = async (forcedInput?: string) => {
  const textToSend = forcedInput || input;
  if (!textToSend.trim() || isLoading) return;

  // 1. Naya AbortController banayein aur use ref mein save karein
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
  setIsLoading(true);

  try {
    // 2. CRITICAL CHANGE: Signal ko chatAgent mein teesre parameter ke taur par bhejein
    const data = await chatService.chatAgent(
      textToSend, 
      currentSessionId || undefined, 
      controller.signal // <--- Ye signal background request ko cancel karega
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
    // 3. Check karein ki kya error request cancel hone ki wajah se aaya hai
    if (error.name === 'AbortError' || error.name === 'CanceledError') {
      console.log("🛑 MAYA: Generation stopped by user");
      // Kuch nahi karenge, message list mein AI response add nahi hoga
    } else {
      console.error("Agent Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to my agents. Please try again.",
        timestamp: new Date(),
        type: 'text'
      }]);
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
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer group">
              <span className="text-sm font-bold tracking-tight text-white/90">MAYA 1.0</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <ChevronDown size={14} className="text-text-secondary group-hover:text-white transition-colors" />
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
            /* Welcome State - Merged Theme */
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 animate-in zoom-in duration-500">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3 animate-in fade-in slide-in-from-bottom-3 duration-700">How can I help you grow?</h1>
              <p className="text-text-secondary max-w-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                Ask about market trends, schemes, or business ideas in India.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                {['Show me Startup Schemes', 'Business Plan for a Cafe', 'Loan for Textile Machinery', 'Market Trends in AI'].map((hint) => (
                  <button 
                    key={hint}
                    onClick={() => handleSend(hint)}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl text-left text-sm hover:border-primary/50 transition-all hover:bg-white/10 group"
                  >
                    <span className="text-text-secondary group-hover:text-white transition-colors">{hint}</span>
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
              <div ref={messagesEndRef} className="h-40" />
            </div>
          )}
        </div>

        {/* Floating Input Area - Merged Theme */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-6 px-4 z-10">
          <div className="max-w-[800px] mx-auto relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-md transition duration-500" />
            
            <div className="relative flex flex-col bg-[#0f0f0f] rounded-2xl border border-white/10 shadow-2xl focus-within:border-primary/40 transition-all overflow-hidden">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message MAYA..."
                className="w-full bg-transparent border-none outline-none text-white placeholder-text-secondary/40 px-5 py-4 resize-none max-h-[200px] min-h-[60px] text-[15px] custom-scrollbar"
                rows={1}
              />
              <div className="flex justify-between items-center px-3 pb-3">
                <div className="flex gap-1">
                    <button onClick={handleNewChat} className="p-2 text-text-secondary hover:text-white transition-colors" title="New Chat">
                    <PlusCircle size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {isLoading ? (
                        /* Stop Generation Button */
                        <button 
                            onClick={handleStop}
                            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
                        >
                            <Square size={14} fill="white" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Stop</span>
                        </button>
                    ) : (
                        /* Send Button */
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className="p-2.5 rounded-xl bg-primary text-black font-bold hover:scale-105 transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100"
                        >
                            <Send size={18} />
                        </button>
                    )}
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest pointer-events-none">
              MAYA can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}