import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, PanelLeftOpen, Square, Paperclip, ArrowUp, Megaphone, LineChart, Landmark, Briefcase } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Message } from '../types';
import { Message as MessageComponent } from '../components/Message';
import { Sidebar } from '../components/Sidebar';
import { chatService, chatStream } from '../services/api';
import { ThinkingWithText, ThinkingMode } from '../components/ThinkingIndicator';
import { OnboardingModal } from '../components/OnboardingModal';
import styles from './ChatInterface.module.css';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: (forcedInput?: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  handleStop: () => void;
  isCentered?: boolean;
  onNewChat?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Detects whether the query is a scheme/government search */
function isSchemeQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('scheme') ||
    lower.includes('loan') ||
    lower.includes('subsidy') ||
    lower.includes('government') ||
    lower.includes('yojana') ||
    lower.includes('mudra') ||
    lower.includes('msme scheme') ||
    lower.includes('eligib')
  );
}

/** Detect which text agent to use */
function detectTextAgent(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('market') || lower.includes('trend') || lower.includes('competitor') || lower.includes('industry')) return 'market';
  if (lower.includes('brand') || lower.includes('logo') || lower.includes('name') || lower.includes('slogan')) return 'brand';
  if (lower.includes('finance') || lower.includes('tax') || lower.includes('cost') || lower.includes('loan')) return 'finance';
  if (lower.includes('marketing') || lower.includes('adverti') || lower.includes('social media') || lower.includes('seo')) return 'marketing';
  return 'general';
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT INPUT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ChatInputBox = ({
  input,
  setInput,
  handleSend,
  handleKeyDown,
  isLoading,
  handleStop,
  isCentered = false,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAgentMenu, setShowAgentMenu] = useState(false);

  // Auto-resize logic whenever input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'; // Reset to base height to calculate correctly
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would handle uploading or attaching the file here
      console.log('File attached:', file.name);
    }
  };

  const selectAgent = (agentPrompt: string) => {
    setInput(agentPrompt);
    setShowAgentMenu(false);
    textareaRef.current?.focus();
  };

  return (
    <div className={`w-full max-w-3xl relative group animate-in fade-in duration-500 flex flex-col ${isCentered ? 'slide-in-from-bottom-6' : ''}`}>
      {/* Hidden file input supporting common documents and images, explicitly excluding video */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".txt,.doc,.docx,.xls,.xlsx,.csv,.pdf,.eml,image/jpeg,image/png,image/gif,image/webp" 
      />

      {/* Glow Animation */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/40 rounded-[28px] blur transition duration-500 ${isCentered ? 'opacity-10 group-focus-within:opacity-30' : 'opacity-0 group-focus-within:opacity-40'}`} />

      <div className="relative bg-[#1A1A1A] rounded-[24px] border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col transition-all hover:bg-[#1A1A1A] focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10">
        {/* Top Row: Input */}
        <div className="flex items-start px-3 pt-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isCentered ? "Ask anything" : "Message MAYA..."}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-text-secondary/50 px-2 py-2 resize-none max-h-[200px] custom-scrollbar text-[15px] leading-relaxed block overflow-hidden"
            rows={1}
            style={{ height: '40px' }}
          />
        </div>

        {/* Bottom Row: Agent + Model + Send */}
        <div className="flex items-center justify-between px-3 pb-3 pt-2">
          {/* Left side actions */}
          <div className="flex items-center gap-2 pl-1 relative">
            <button
              onClick={handleAttachmentClick}
              className="p-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5 active:scale-95 flex-shrink-0"
              title="Upload attachment (Docs, Images, Text)"
            >
              <Paperclip size={20} strokeWidth={2} className="-rotate-30" />
            </button>
            <button 
              onClick={() => setShowAgentMenu(!showAgentMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.05] hover:bg-white/[0.03] hover:border-white/[0.1] transition-colors text-text-secondary hover:text-white text-[13px] font-medium"
            >
              <span className="text-lg leading-none mb-0.5">+</span> Agent
            </button>

            {/* Agent Dropdown Menu */}
            {showAgentMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowAgentMenu(false)}
                />
                <div className="absolute top-12 left-10 w-56 bg-[#1A1A1A] border border-white/[0.08] shadow-2xl rounded-2xl p-1.5 py-2 z-50 flex flex-col gap-1 min-w-max animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => selectAgent("Analyze the marketing strategy for...")} className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-white/5 rounded-xl transition-colors text-[13px] text-text-secondary hover:text-white group">
                    <Megaphone size={16} className="text-primary/70 group-hover:text-primary transition-colors" />
                    Marketing Agent
                  </button>
                  <button onClick={() => selectAgent("Research the market trend for...")} className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-white/5 rounded-xl transition-colors text-[13px] text-text-secondary hover:text-white group">
                    <LineChart size={16} className="text-blue-400/70 group-hover:text-blue-400 transition-colors" />
                    Market Research Agent
                  </button>
                  <button onClick={() => selectAgent("Assess the financial viability of...")} className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-white/5 rounded-xl transition-colors text-[13px] text-text-secondary hover:text-white group">
                    <Landmark size={16} className="text-amber-400/70 group-hover:text-amber-400 transition-colors" />
                    Finance Agent
                  </button>
                  <button onClick={() => selectAgent("Create a branding identity for...")} className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-white/5 rounded-xl transition-colors text-[13px] text-text-secondary hover:text-white group">
                    <Briefcase size={16} className="text-purple-400/70 group-hover:text-purple-400 transition-colors" />
                    Branding Agent
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Model Selector Dropdown Trigger */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-transparent hover:bg-white/[0.03] hover:text-white cursor-pointer transition-colors text-text-secondary text-[13px] font-medium">
              MAYA v2 Flash
              <ChevronDown size={14} />
            </div>

            {/* Send Button */}
            {isLoading ? (
              <button
                onClick={handleStop}
                className="p-2 rounded-full bg-white text-black hover:scale-95 transition-all flex items-center justify-center transform active:scale-90"
              >
                <Square size={16} fill="black" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center transform active:scale-90 ${
                  input.trim()
                    ? 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                <ArrowUp size={18} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  // thinkingMode drives the ThinkingWithText indicator.
  // null = hidden. A ThinkingMode value = visible with that mode.
  const [thinkingMode, setThinkingMode] = useState<ThinkingMode | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<Record<string, any> | null>(null);

  const { userId, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => { loadSessions(); }, []);
  
  // Wait until Clerk loads the userId before checking onboarding
  useEffect(() => {
    if (userId) checkOnboarding();
  }, [userId]);
  
  useEffect(() => { scrollToBottom(); }, [messages, isLoading, isStreaming, thinkingMode]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const checkOnboarding = async () => {
    try {
      const token = await getToken();
      if (!token) return; // Clerk not ready yet — skip silently
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return; // Don't show modal on network errors
      const data = await res.json();
      setUserProfile(data); // Cache profile data for sidebar
      if (!data.onboarding_complete) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error('Failed to check onboarding status', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const fetchedSessions = await chatService.getSessions();
      setSessions(fetchedSessions);
      
      // Auto-load most recent chat history on mount if no active conversation is set
      setConversationId((prevConvId) => {
        if (!prevConvId && fetchedSessions.length > 0) {
          // Instantly trigger history retrieval on the newest session
          loadSessionHistory(fetchedSessions[0].id);
          return fetchedSessions[0].id;
        }
        return prevConvId;
      });
    } catch (error) {
      console.error('Failed to load sessions', error);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
      setIsHistoryLoading(true);
      const history = await chatService.getSessionHistory(sessionId);

      // V2: history items have content_type + content (JSONB)
      const formattedMessages: Message[] = history.map((msg: any) => {
        const contentType = msg.content_type || 'text';
        const content = msg.content || {};

        // Reconstruct scheme cards from stored JSONB
        if (contentType === 'scheme_results') {
          return {
            id: msg.id.toString(),
            role: msg.role,
            content: content.summary || '',
            content_type: 'scheme_results',
            timestamp: new Date(msg.timestamp),
            type: 'scheme-list',
            schemes: content.schemes || [],
            agent: msg.agent_used || 'scheme',
          };
        }

        // Text or agent_response
        const textContent =
          typeof content === 'string' ? content :
          content.text || content.summary || JSON.stringify(content);

        return {
          id: msg.id.toString(),
          role: msg.role,
          content: textContent,
          content_type: contentType,
          timestamp: new Date(msg.timestamp),
          type: 'text',
          schemes: [],
          agent: msg.agent_used,
        };
      });

      setMessages(formattedMessages);
      setConversationId(sessionId);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleNewChat = () => {
    handleStop();
    setMessages([]);
    setConversationId(null);
    setInput('');
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsStreaming(false);
      setThinkingMode(null);
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 && m.isStreaming
          ? { ...m, isStreaming: false }
          : m
      ));
    }
  };

  // ── updateLastMessage — appends streamed chunk to last message ─────────────
  const updateLastMessage = useCallback((updater: (prev: string) => string) => {
    setMessages(prev => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.isStreaming) {
        const currentText = typeof last.content === 'string' ? last.content : '';
        next[next.length - 1] = {
          ...last,
          content: updater(currentText),
        };
      }
      return next;
    });
  }, []);

  // ── markLastMessageDone — removes streaming cursor ─────────────────────────
  const markLastMessageDone = useCallback(() => {
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 && m.isStreaming
        ? { ...m, isStreaming: false }
        : m
    ));
  }, []);

  // ── MAIN SEND HANDLER ──────────────────────────────────────────────────────

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input;
    if (!textToSend.trim() || isLoading || isStreaming) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add user message to UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      content_type: 'text',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    // Show 'thinking' the moment user hits send
    setThinkingMode('thinking');

    try {
      if (isSchemeQuery(textToSend)) {
        // ── SCHEME PATH: JSON, renders cards ─────────────────────────────
        // Switch to db-search mode while vector DB query runs
        setThinkingMode('db-search');

        const token = await getToken().catch(() => null);
        const data = await chatService.chatAgent(
          textToSend,
          conversationId,
          controller.signal,
          token,
        );

        // Response arrived — hide indicator before rendering card
        setThinkingMode(null);

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          content_type: data.schemes?.length > 0 ? 'scheme_results' : 'text',
          timestamp: new Date(),
          type: data.schemes?.length > 0 ? 'scheme-list' : 'text',
          schemes: data.schemes || [],
          agent: data.agent,
        };
        setMessages(prev => [...prev, aiMsg]);

        const newConvId = data.conversation_id || data.session_id;
        if (newConvId && newConvId !== conversationId) {
          setConversationId(newConvId);
          loadSessions();
        }

      } else {
        // ── STREAMING PATH: SSE, text streams word by word ────────────────
        const detectedAgent = detectTextAgent(textToSend);

        // Switch mode based on agent type immediately (before API call)
        if (detectedAgent === 'market') {
          setThinkingMode('web-search');
        } else {
          setThinkingMode('agent-active');
        }

        let firstChunkReceived = false;

        // Add empty placeholder — ThinkingWithText shows until first chunk
        const streamingMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          content_type: 'agent_response',
          timestamp: new Date(),
          type: 'text',
          isStreaming: true,
          agent: detectedAgent,
        };
        setMessages(prev => [...prev, streamingMsg]);
        setIsStreaming(true);
        setIsLoading(false);

        const streamToken = await getToken().catch(() => null);
        await chatStream(
          {
            message: textToSend,
            agent: detectedAgent,
            conversation_id: conversationId,
            clerk_user_id: userId,
          },
          // onChunk — hide thinking on first chunk, then append text
          (chunk: string) => {
            if (!firstChunkReceived) {
              firstChunkReceived = true;
              setThinkingMode(null);
            }
            updateLastMessage(prev => prev + chunk);
          },
          // onInit — store conversation_id
          (convId: string) => {
            if (!conversationId) {
              setConversationId(convId);
              loadSessions();
            }
          },
          // onDone
          () => {
            setIsStreaming(false);
            setThinkingMode(null);
            markLastMessageDone();
          },
          // onError
          (err: string) => {
            setIsStreaming(false);
            setThinkingMode(null);
            markLastMessageDone();
            console.error('Stream error:', err);
          },
          controller.signal,
          streamToken,
        );
      }

    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('🛑 MAYA: Generation stopped by user');
      } else {
        console.error('Error sending message:', error);
        let errorMessage = 'Sorry, I encountered an error while processing your request.';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
          content_type: 'text',
          timestamp: new Date(),
          type: 'text',
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setThinkingMode(null); // always clear on exit
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRenameSession = async (id: string, newTitle: string) => {
    const success = await chatService.renameSession(id, newTitle);
    if (success) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    }
  };

  const handleDeleteSession = async (id: string) => {
    const success = await chatService.deleteSession(id);
    if (success) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (conversationId === id) {
        handleNewChat();
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-text-primary">
      {/* Onboarding Modal overlays everything */}
      {showOnboarding && <OnboardingModal onComplete={() => {
        setShowOnboarding(false);
        // Refresh profile data so sidebar shows updated name immediately
        checkOnboarding();
      }} />}
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={conversationId}
        onSelectSession={loadSessionHistory}
        onNewChat={handleNewChat}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        userProfile={userProfile}
        clerkUser={clerkUser}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative w-full h-full bg-background ${styles.sidebarBorder}`}>
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md z-10 border-b border-white/[0.02]">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                title="Open sidebar"
                className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 group"
              >
                <PanelLeftOpen size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-text-secondary">
              <span className={`text-lg font-small text-grey truncate max-w-[200px] md:max-w-[400px] ${styles.heading}`}>
                {conversationId ? sessions.find(s => s.id === conversationId)?.title || "Chat" : "New Chat"}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar ${styles.scrollArea}`}>
          {isHistoryLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            /* Welcome Screen (New Chat) */
            <div className="flex flex-col items-center justify-center h-full px-4">
              <h1 className={`text-center animate-in slide-in-from-bottom-4 duration-700 tracking-tight font text-white mb-8 ${styles.welcomeTitle}`}>
                How can I help you grow?
              </h1>

              {/* Centered Search Input */}
              <ChatInputBox
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                isLoading={isLoading || isStreaming}
                handleStop={handleStop}
                isCentered={true}
              />
            </div>
          ) : (
            /* Chat Messages List */
            <div className="flex flex-col min-h-full pb-48 pt-6">
              <div className={`flex-1 w-full max-w-[800px] mx-auto flex flex-col gap-6 ${styles.messageList}`}>
                {messages.map((msg) => (
                  <div key={msg.id} className="w-full">
                    <MessageComponent message={msg} />
                    {/* Streaming cursor removed — ThinkingWithText handles pre-chunk state */}
                  </div>
                ))}
                {/* ThinkingWithText — visible only while thinkingMode is non-null
                    and NOT while streaming text is already showing */}
                {thinkingMode && !messages.some(m => m.isStreaming && (m.content as string)?.length > 0) && (
                  <div className="w-full pl-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ThinkingWithText
                      mode={thinkingMode}
                      text={
                        thinkingMode === 'thinking' ? 'Thinking...' :
                        thinkingMode === 'db-search' ? 'Searching schemes' :
                        thinkingMode === 'web-search' ? 'Searching web' :
                        'Agent working'
                      }
                    />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Floating Input Bar (Ongoing Chat) */}
        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-32 pb-8 px-4 z-10 pointer-events-none">
            <div className="max-w-[800px] mx-auto flex justify-center pointer-events-auto">
              <ChatInputBox
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                isLoading={isLoading || isStreaming}
                handleStop={handleStop}
                isCentered={false}
              />
            </div>
            <p className="text-center text-[11px] text-text-secondary mt-3">
              MAYA can make mistakes. Consider checking important information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}