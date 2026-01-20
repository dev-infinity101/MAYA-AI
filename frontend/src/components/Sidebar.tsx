import { memo, useState } from 'react';
import { Plus, MessageSquare, X, Settings, HelpCircle, LogOut, Sparkles, Zap, PanelLeftClose } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Brand } from './Brand';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions?: { id: string; title: string }[];
  currentSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
}

const SidebarCloseButton = memo(({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    aria-label="Close sidebar"
    title="Close sidebar"
    className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 group"
  >
    <PanelLeftClose size={20} className="group-hover:scale-110 transition-transform" />
  </button>
));

SidebarCloseButton.displayName = 'SidebarCloseButton';

export function Sidebar({ isOpen, onClose, sessions = [], currentSessionId, onSelectSession, onNewChat }: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div 
      className={clsx(
        "fixed md:relative z-20 h-full bg-black/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 -translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full p-4 relative">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Brand showText={false} />
          </Link>
          <SidebarCloseButton onClick={onClose} />
        </div>

        <Button 
            variant="outline" 
            className="w-full justify-start gap-2 mb-6" 
            size="sm"
            onClick={onNewChat}
        >
          <Plus size={16} /> New Chat
        </Button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">History</div>
          {sessions.length === 0 ? (
              <div className="text-xs text-text-secondary/50 italic px-2">No recent chats</div>
          ) : (
              sessions.map((session) => (
                <button 
                    key={session.id} 
                    onClick={() => onSelectSession?.(session.id)}
                    className={clsx(
                        "w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center gap-2 group",
                        currentSessionId === session.id 
                            ? "bg-primary/10 text-white" 
                            : "hover:bg-white/5 text-text-secondary hover:text-white"
                    )}
                >
                  <MessageSquare size={14} className={clsx(
                      "transition-colors shrink-0",
                      currentSessionId === session.id ? "text-primary" : "group-hover:text-primary"
                  )} />
                  <span className="truncate">{session.title}</span>
                </button>
              ))
          )}
        </div>
        
        {/* User Settings Popover */}
        {isMenuOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
             <div className="p-2 border-b border-white/5 mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary" />
                  <div>
                    <div className="text-sm text-white font-medium">Business Owner</div>
                    <div className="text-[10px] text-text-secondary">@gstunnerbeats</div>
                  </div>
                </div>
             </div>
             
             <button className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors">
                <Sparkles size={16} className="text-primary" />
                <span>Upgrade plan</span>
             </button>
             <button className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors">
                <Zap size={16} />
                <span>Personalization</span>
             </button>
             <button className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors">
                <Settings size={16} />
                <span>Settings</span>
             </button>
             <div className="h-px bg-white/5 my-1" />
             <button className="w-full flex items-center justify-between p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} />
                  <span>Help</span>
                </div>
                <X size={14} className="rotate-45 text-text-secondary" />
             </button>
             <button className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors">
                <LogOut size={16} />
                <span>Log out</span>
             </button>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-white/10">
           <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={clsx(
              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
              isMenuOpen ? "bg-white/10" : "hover:bg-white/5"
            )}
           >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary" />
              <div className="text-sm flex-1">
                  <div className="text-white font-medium">Business Owner</div>
                  <div className="text-text-secondary text-xs">Free Plan</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
