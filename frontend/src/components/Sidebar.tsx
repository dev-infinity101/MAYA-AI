import React from 'react';
import { Bot, Plus, MessageSquare, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <div 
      className={clsx(
        "fixed md:relative z-20 h-full bg-black/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-in-out",
        isOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full md:w-0 md:translate-x-0 opacity-0 md:opacity-100 overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
              <Bot className="text-primary w-8 h-8" />
              <span className="font-bold text-xl tracking-wider">MAYA</span>
          </Link>
          <button onClick={onClose} className="md:hidden text-text-secondary">
              <X />
          </button>
        </div>

        <Button variant="outline" className="w-full justify-start gap-2 mb-6" size="sm">
          <Plus size={16} /> New Chat
        </Button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Recent</div>
          {['Food Processing Loan', 'Marketing Strategy', 'Textile Subsidy'].map((topic, i) => (
            <button key={i} className="w-full text-left p-3 rounded-lg hover:bg-white/5 text-sm text-text-secondary hover:text-white transition-colors flex items-center gap-2 group">
              <MessageSquare size={14} className="group-hover:text-primary transition-colors" />
              <span className="truncate">{topic}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/10">
           <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary" />
              <div className="text-sm">
                  <div className="text-white font-medium">Business Owner</div>
                  <div className="text-text-secondary text-xs">Free Plan</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
