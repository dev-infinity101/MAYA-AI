import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Sparkles, Menu, TrendingUp, Loader2, Globe, Database } from 'lucide-react'; // Added Globe and Database
import { Button } from '../components/Button';
import { Message } from '../types';
import { Message as MessageComponent } from '../components/Message';
import { Sidebar } from '../components/Sidebar';
import { chatService } from '../services/api';

// --- NEW: Thinking Animation Component ---
const ThinkingMessage = () => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    "Searching government portals...",
    "Scanning business databases...",
    "Analyzing latest schemes...",
    "MAYA is thinking..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Sparkles size={16} className="text-primary animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary/80">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm font-medium tracking-wide uppercase italic">
            {statuses[statusIndex]}
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm MAYA. I can help you find government schemes or provide business advice. How can I help you today?",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]); // Trigger scroll when loading starts/ends

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
    setInput('');
    setIsLoading(true);

    try {
        if (input.toLowerCase().includes('scheme') || input.toLowerCase().includes('loan') || input.toLowerCase().includes('subsidy')) {
            const schemes = await chatService.searchSchemes(userMsg.content);
            
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
             const response = await chatService.testAi(userMsg.content);
             const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, aiMsg]);
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
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col relative w-full">
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setSidebarOpen(!isSidebarOpen)} 
                    className="text-text-secondary hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-sm font-medium text-text-secondary">MAYA</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">Help</Button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg) => (
              <MessageComponent key={msg.id} message={msg} />
            ))}
            
            {/* --- INTEGRATED LOADING STATE --- */}
            {isLoading && <ThinkingMessage />}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="max-w-4xl mx-auto space-y-4">
             {/* Quick Actions */}
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { icon: <Search size={14} />, label: 'Find Schemes' },
                    { icon: <Sparkles size={14} />, label: 'Brand Ideas' },
                    { icon: <TrendingUp size={14} />, label: 'Market Research' },
                ].map((action, i) => (
                    <button 
                        key={i}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all whitespace-nowrap text-sm text-text-secondary hover:text-white"
                        onClick={() => setInput(action.label)}
                    >
                        {action.icon}
                        {action.label}
                    </button>
                ))}
             </div>

             {/* Input Bar */}
             <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 group-hover:opacity-50 blur transition duration-500" />
                <div className="relative flex items-center bg-black rounded-full border border-white/10 px-4 py-2 shadow-2xl">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about your business..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-text-secondary px-4 py-2"
                        disabled={isLoading} // Optional: disable while loading
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
             </div>
             <p className="text-center text-xs text-text-secondary">
                MAYA AI can make mistakes. Consider checking important information.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}