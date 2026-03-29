import { memo, useState } from 'react';
import { Plus, MessageSquare, X, Settings, HelpCircle, LogOut, Sparkles, Zap, PanelLeftClose, Trash2, Search, Pin, Pencil } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Brand } from './Brand';
import type { AuthProfile, ChatSessionSummary } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions?: ChatSessionSummary[];
  currentSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteSession?: (id: string) => void;
  onRenameSession?: (id: string) => void;
  onTogglePinSession?: (id: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  isSearching?: boolean;
  user?: AuthProfile | null;
  isUserLoading?: boolean;
  onLogout?: () => void;
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

function formatSessionTime(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function Sidebar({
  isOpen,
  onClose,
  sessions = [],
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  searchQuery = '',
  onSearchQueryChange,
  isSearching = false,
  user,
  isUserLoading = false,
  onLogout,
}: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName = user?.metadata?.full_name || user?.email?.split('@')[0] || 'Signed-in user';
  const displaySubtext = isUserLoading
    ? 'Checking session...'
    : user?.email || 'No account loaded';
  const sortedSessions = [...sessions].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div 
      className={clsx(
        "fixed md:relative z-20 h-full bg-black/92 border-r border-white/10 transition-all duration-300 ease-in-out overflow-hidden",
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

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <div className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2">
            <Search size={14} className="text-text-secondary" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange?.(e.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent text-sm text-white placeholder:text-text-secondary/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <span>History</span>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px]">
              {sortedSessions.length}
            </span>
          </div>
          {isSearching ? (
              <div className="px-2 py-3 text-xs italic text-text-secondary/60">Searching conversations...</div>
          ) : sortedSessions.length === 0 ? (
              <div className="text-xs text-text-secondary/50 italic px-2">
                {searchQuery.trim() ? 'No matching chats found' : 'No recent chats'}
              </div>
          ) : (
              sortedSessions.map((session) => (
                <div 
                    key={session.id} 
                    className={clsx(
                        "w-full rounded-2xl text-sm transition-colors flex items-stretch justify-between group border",
                        currentSessionId === session.id 
                            ? "bg-primary/10 text-white border-primary/20" 
                            : "hover:bg-white/5 text-text-secondary hover:text-white border-transparent"
                    )}
                >
                  <button 
                      onClick={() => onSelectSession?.(session.id)}
                      className="flex-1 text-left p-3 flex items-start gap-3 overflow-hidden"
                  >
                    <MessageSquare size={14} className={clsx(
                        "transition-colors shrink-0 mt-0.5",
                        currentSessionId === session.id ? "text-primary" : "group-hover:text-primary"
                    )} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{session.title}</span>
                        {session.updated_at && (
                          <span className="shrink-0 text-[10px] uppercase tracking-wide text-white/35">
                            {formatSessionTime(session.updated_at)}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-white/40 mt-1">
                        {session.preview || 'No messages yet'}
                      </div>
                    </div>
                  </button>
                  <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteSession?.(session.id); }}
                      className="p-3 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all shrink-0 self-center"
                      title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                      onClick={(e) => { e.stopPropagation(); onRenameSession?.(session.id); }}
                      className="p-3 opacity-0 group-hover:opacity-100 hover:text-white transition-all shrink-0 self-center"
                      title="Rename chat"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                      onClick={(e) => { e.stopPropagation(); onTogglePinSession?.(session.id); }}
                      className={clsx(
                        "p-3 transition-all shrink-0 self-center",
                        session.pinned ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 hover:text-primary"
                      )}
                      title={session.pinned ? "Unpin chat" : "Pin chat"}
                  >
                    <Pin size={14} fill={session.pinned ? "currentColor" : "none"} />
                  </button>
                </div>
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
                    <div className="text-sm text-white font-medium">{displayName}</div>
                    <div className="text-[10px] text-text-secondary">{displaySubtext}</div>
                  </div>
                </div>
             </div>
             
             <button className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors">
                <Sparkles size={16} className="text-primary" />
                <span>Workspace upgrades</span>
             </button>
             <button className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors">
                <Zap size={16} />
                <span>Response style</span>
             </button>
             <Link
                to="/account/password"
                className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
             >
                <Settings size={16} />
                <span>Change password</span>
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
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors"
             >
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
                  <div className="text-white font-medium truncate">{displayName}</div>
                  <div className="text-text-secondary text-xs truncate">{displaySubtext}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
