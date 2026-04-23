import { memo, useState } from 'react';
import { Settings, HelpCircle, Sparkles, PanelLeftClose, SquarePen, MoreHorizontal, Edit2, Trash2, Check, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Brand } from './Brand';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions?: { id: string; title: string }[];
  currentSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
  onNavigate?: (view: 'chat' | 'dashboard' | 'settings') => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  onDeleteSession?: (id: string) => void;
  userProfile?: Record<string, any> | null;
  clerkUser?: any | null;
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

const SidebarSessionItem = ({ 
    session, 
    currentSessionId, 
    onSelectSession, 
    onRenameSession, 
    onDeleteSession 
}: {
    session: { id: string; title: string };
    currentSessionId?: string | null;
    onSelectSession?: (id: string) => void;
    onRenameSession?: (id: string, newTitle: string) => void;
    onDeleteSession?: (id: string) => void;
}) => {
    const isCurrent = currentSessionId === session.id;
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(session.title);
    const [showMenu, setShowMenu] = useState(false);

    const handleRenameSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (editTitle.trim() && editTitle !== session.title) {
            onRenameSession?.(session.id, editTitle.trim());
        } else {
            setEditTitle(session.title);
        }
        setIsEditing(false);
        setShowMenu(false);
    };

    if (isEditing) {
        return (
            <form onSubmit={handleRenameSubmit} className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                <input 
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit()}
                    className="flex-1 bg-transparent border-none text-white text-[14px] outline-none"
                    spellCheck={false}
                />
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleRenameSubmit(); }} className="text-white hover:text-primary transition-colors">
                    <Check size={16} />
                </button>
            </form>
        );
    }

    return (
        <div className="relative group">
            <button 
                onClick={() => {
                    if (!showMenu) onSelectSession?.(session.id);
                }}
                className={clsx(
                    "w-full text-left py-2 px-3 rounded-xl text-[13px] transition-all flex items-center justify-between group/item",
                    isCurrent || showMenu
                        ? "bg-white/[0.08] text-white font-medium shadow-sm" 
                        : "text-white hover:bg-white/[0.03]"
                )}
                title={session.title}
            >
                <span className="truncate pr-2 block flex-1">{session.title}</span>
                
                <span 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className={clsx(
                        "p-1 rounded-md hover:bg-white/10 transition-all z-10 flex-shrink-0 cursor-pointer",
                        showMenu || isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                >
                    <MoreHorizontal size={16} />
                </span>
            </button>

             {showMenu && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-10 z-20 w-36 bg-[#1a1a1a] border border-white/10 rounded-xl py-1 shadow-2xl animate-in fade-in zoom-in-95">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                        >
                            <Edit2 size={14} /> Rename
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteSession?.(session.id); setShowMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export function Sidebar({ 
    isOpen, onClose, sessions = [], currentSessionId, 
    onSelectSession, onNewChat, onNavigate, onRenameSession, onDeleteSession,
    userProfile, clerkUser
}: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Resolve display name: prefer onboarding full_name → Clerk name → fallback
  const displayName = userProfile?.display_name 
    || userProfile?.full_name 
    || clerkUser?.fullName 
    || clerkUser?.firstName 
    || 'Business Owner';

  return (
    <div 
      className={clsx(
        "fixed md:relative z-20 h-full bg-[#0D0D0D] border-r border-white/5 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0",
        isOpen ? "w-[240px] opacity-100" : "w-0 opacity-0 -translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full p-4 relative">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Brand showText={false} />
          </Link>
          <div className="flex items-center gap-2">
            <SidebarCloseButton onClick={onClose} />
          </div>
        </div>

        <button
            onClick={() => {
                onNewChat?.();
                onNavigate?.('chat');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 mb-2 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl transition-all duration-200 group active:scale-95 text-white"
        >
            <SquarePen size={16} className="text-white group-hover:text-primary transition-colors" />
            <span className="text-[13px] font-medium text-white">New chat</span>
        </button>

        <button
            onClick={() => onNavigate?.('dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2 mb-3 hover:bg-white/[0.04] rounded-xl transition-all duration-200 group text-text-secondary hover:text-white"
        >
            <BarChart2 size={15} className="group-hover:text-primary transition-colors" />
            <span className="text-[13px]">Impact Dashboard</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-2">
          <div className="text-[11px] font-semibold text-white uppercase tracking-wider mb-2 mt-4 px-2">Recents</div>
          {sessions.length === 0 ? (
              <div className="text-xs text-white/50 italic px-2">No recent chats</div>
          ) : (
              sessions.map((session) => (
                  <SidebarSessionItem 
                      key={session.id}
                      session={session}
                      currentSessionId={currentSessionId}
                      onSelectSession={(id) => {
                          onSelectSession?.(id);
                          onNavigate?.('chat');
                      }}
                      onRenameSession={onRenameSession}
                      onDeleteSession={onDeleteSession}
                  />
              ))
          )}
        </div>
        
        {/* User menu popover */}
        {isMenuOpen && (
          <div className="absolute bottom-16 left-4 right-4 bg-[#141414] border border-white/10 rounded-[14px] p-2 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-200">
             <button className="w-full flex items-center gap-3 p-2.5 text-[13px] text-white hover:bg-white/5 rounded-lg transition-colors group">
                <Sparkles size={15} className="text-text-secondary group-hover:text-primary transition-colors" />
                <span>Upgrade plan</span>
             </button>
             <button className="w-full flex items-center gap-3 p-2.5 text-[13px] text-white hover:bg-white/5 rounded-lg transition-colors group">
                <HelpCircle size={15} className="text-text-secondary group-hover:text-white transition-colors" />
                <span>About Us</span>
             </button>
             <button className="w-full flex items-center gap-3 p-2.5 text-[13px] text-white hover:bg-white/5 rounded-lg transition-colors group">
                <span className="text-text-secondary w-[15px] flex justify-center text-[13px] font-medium group-hover:text-white transition-colors">अ/A</span>
                <span>Language</span>
             </button>
             <button className="w-full flex items-center gap-3 p-2.5 text-[13px] text-white hover:bg-white/5 rounded-lg transition-colors group">
                <MoreHorizontal size={15} className="text-text-secondary group-hover:text-white transition-colors" />
                <span>User Feedback</span>
             </button>
             <button 
                onClick={() => {
                    setIsMenuOpen(false);
                    onNavigate?.('settings');
                }}
                className="w-full flex items-center gap-3 p-2.5 text-[13px] text-white hover:bg-white/5 rounded-lg transition-colors group"
             >
                <Settings size={15} className="text-text-secondary group-hover:text-white transition-colors" />
                <span>Settings</span>
             </button>
          </div>
        )}

        {/* Minimal User avatar + name trigger */}
        <div className="mt-auto px-1 pb-2 pt-3 border-t border-white/[0.05]">
           <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={clsx(
              "flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all duration-200 active:scale-95 group",
              isMenuOpen ? "bg-[#1A1A1A] shadow-inner" : "hover:bg-white/[0.04]"
            )}
           >
              {/* Clerk UserButton as avatar */}
              <div className="pointer-events-none">
                  <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-6 h-6",
                          userButtonPopoverCard: "hidden",
                        }
                      }}
                  />
              </div>
              <div className="text-[13px] flex-1 min-w-0">
                  <div className="text-text-primary font-medium truncate group-hover:text-white transition-colors">{displayName}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
