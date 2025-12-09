import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Sparkles, Menu, TrendingUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Message } from '../types';
import { Message as MessageComponent } from '../components/Message';
import { Sidebar } from '../components/Sidebar';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      let aiMsg: Message;
      
      if (input.toLowerCase().includes('scheme')) {
        aiMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I found a few schemes that might be relevant for you based on your profile.",
            timestamp: new Date(),
            type: 'scheme-list',
            schemes: [
                {
                    id: 's1',
                    name: 'PM Employment Generation Programme (PMEGP)',
                    category: 'Subsidy',
                    description: 'Credit-linked subsidy programme for generation of employment opportunities through establishment of micro enterprises in rural as well as urban areas.',
                    benefits: 'Subsidy up to 35% of project cost',
                    eligibility: { age: '18+', education: '8th pass' },
                    relevance_score: 95,
                    explanation: 'Matches your requirement for manufacturing business setup.',
                    key_benefit: '35% Subsidy on Project Cost'
                },
                {
                    id: 's2',
                    name: 'CGTMSE - Credit Guarantee Fund',
                    category: 'Loan',
                    description: 'Collateral-free credit to the Micro and Small Enterprise Sector. Both existing and new enterprises are eligible.',
                    benefits: 'Collateral-free loan up to ₹2 Crore',
                    eligibility: { type: 'MSE' },
                    relevance_score: 88,
                    explanation: 'Good option if you lack collateral security.',
                    key_benefit: 'Collateral-free Loan'
                }
            ]
        };
      } else {
        aiMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I'm analyzing your request. Just a moment...",
            timestamp: new Date(),
            type: 'text'
        };
      }
      
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
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

      {/* Main Chat Area */}
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
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-text-secondary">Online</span>
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
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
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
