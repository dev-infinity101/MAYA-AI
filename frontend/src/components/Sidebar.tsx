import { memo, useState } from 'react';
import { X, Settings, HelpCircle, Sparkles, Zap, PanelLeftClose, SquarePen, MoreHorizontal, Edit2, Trash2, Check, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton, useClerk } from '@clerk/clerk-react';
import { Brand } from './Brand';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions?: { id: string; title: string }[];
  currentSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
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
                    "w-full text-left py-2 px-3 rounded-lg text-[14px] transition-colors flex items-center justify-between",
                    isCurrent || showMenu
                        ? "bg-white/10 text-white font-medium shadow-sm border border-white/5" 
                        : "text-[#a3a3a3] hover:bg-white/5 hover:text-white border border-transparent"
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
    onSelectSession, onNewChat, onRenameSession, onDeleteSession,
    userProfile, clerkUser
}: SidebarProps) {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Resolve display name: prefer onboarding full_name → Clerk name → fallback
  const displayName = userProfile?.display_name 
    || userProfile?.full_name 
    || clerkUser?.fullName 
    || clerkUser?.firstName 
    || 'Business Owner';

  const email = userProfile?.email 
    || clerkUser?.primaryEmailAddress?.emailAddress 
    || '';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div 
      className={clsx(
        "fixed md:relative z-20 h-full bg-black/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 -translate-x-full md:translate-x-0"
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
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 group"
        >
            <div className="flex items-center gap-2.5 text-white">
                <SquarePen size={18} className="text-text-secondary group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">New chat</span>
            </div>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-2">
          <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-4 px-2">Recents</div>
          {sessions.length === 0 ? (
              <div className="text-xs text-text-secondary/50 italic px-2">No recent chats</div>
          ) : (
              sessions.map((session) => (
                  <SidebarSessionItem 
                      key={session.id}
                      session={session}
                      currentSessionId={currentSessionId}
                      onSelectSession={onSelectSession}
                      onRenameSession={onRenameSession}
                      onDeleteSession={onDeleteSession}
                  />
              ))
          )}
        </div>
        
        {/* User menu popover */}
        {isMenuOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
             <div className="p-2 border-b border-white/5 mb-1">
                <div className="flex items-center gap-3">
                  {/* Clerk UserButton — handles avatar, account management */}
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      }
                    }}
                  />
                  <div>
                    <div className="text-sm text-white font-medium">{displayName}</div>
                    <div className="text-[10px] text-text-secondary truncate max-w-[160px]">{email}</div>
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
             <Link 
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors"
             >
                <Settings size={16} />
                <span>Settings</span>
             </Link>
             <div className="h-px bg-white/5 my-1" />
             <button className="w-full flex items-center justify-between p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} />
                  <span>Help</span>
                </div>
                <X size={14} className="rotate-45 text-text-secondary" />
             </button>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
             >
                <LogOut size={16} />
                <span>Log out</span>
             </button>
          </div>
        )}

        {/* User avatar + name trigger */}
        <div className="mt-auto pt-4 border-t border-white/10">
           <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={clsx(
              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
              isMenuOpen ? "bg-white/10" : "hover:bg-white/5"
            )}
           >
              {/* Clerk UserButton as avatar */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    // Hide the default dropdown — we use our own menu
                    userButtonPopoverCard: "hidden",
                  }
                }}
              />
              <div className="text-sm flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{displayName}</div>
                  <div className="text-text-secondary text-xs">Free Plan</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
