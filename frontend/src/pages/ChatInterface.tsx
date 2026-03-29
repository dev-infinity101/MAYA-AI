import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Copy, Menu, Mic, PlusCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Message as MessageComponent } from '../components/Message';
import { Attachments, Attachment, AttachmentPreview, AttachmentRemove } from '../components/ai-elements/attachments';
import { Conversation, ConversationContent, ConversationScrollButton } from '../components/ai-elements/conversation';
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '../components/ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../components/ai-elements/reasoning';
import { supabase } from '../lib/supabase';
import { chatService } from '../services/api';
import type { AuthProfile, ChatSessionSummary, Message } from '../types';

export function ChatInterface() {
  const navigate = useNavigate();
  const isPublicChatDemo = import.meta.env.VITE_PUBLIC_CHAT_DEMO === 'true';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [attachments, setAttachments] = useState<{ id: string; url: string; name: string; type: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingSessions, setIsSearchingSessions] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadSessions();
    void loadCurrentUser();
  }, []);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    const timer = window.setTimeout(async () => {
      if (!normalizedQuery) {
        setIsSearchingSessions(false);
        await loadSessions();
        return;
      }

      try {
        setIsSearchingSessions(true);
        const results = await chatService.searchSessions(normalizedQuery);
        setSessions(results);
      } catch (error) {
        console.error('Failed to search sessions', error);
      } finally {
        setIsSearchingSessions(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const loadCurrentUser = async () => {
    try {
      setIsUserLoading(true);
      const profile = await chatService.getProfile();
      setCurrentUser(profile);
    } catch (error: any) {
      console.error('Failed to load current user', error);
      setCurrentUser(null);

      if (!isPublicChatDemo && error?.response?.status === 401) {
        navigate('/login', { replace: true });
      }
    } finally {
      setIsUserLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const sessionSummaries = await chatService.getSessions();
      setSessions(sessionSummaries);
    } catch (error) {
      console.error('Failed to load sessions', error);
      setSessions([]);
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
        schemes: msg.schemes || [],
      }));
      setMessages(formattedMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Failed to load history', error);
      if (!isPublicChatDemo) {
        setMessages([]);
      }
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleNewChat = () => {
    handleStop();
    setMessages([]);
    setCurrentSessionId(null);
    setInput('');
    setAttachments([]);
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await chatService.deleteSession(id);
      if (currentSessionId === id) {
        handleNewChat();
      }
      void loadSessions();
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  };

  const handleLogout = async () => {
    handleStop();
    await supabase.auth.signOut();
    navigate(isPublicChatDemo ? '/' : '/login', { replace: true });
  };

  const handleRenameSession = (id: string) => {
    const currentTitle = sessions.find((session) => session.id === id)?.title || '';
    const nextTitle = window.prompt('Rename this conversation', currentTitle)?.trim();

    if (!nextTitle) {
      return;
    }

    void chatService.updateSessionMeta(id, { title: nextTitle }).then((updatedSession) => {
      setSessions((prev) =>
        prev.map((session) => (session.id === id ? updatedSession : session))
      );
    });
  };

  const handleTogglePinSession = (id: string) => {
    const currentPinned = sessions.find((session) => session.id === id)?.pinned || false;
    void chatService.updateSessionMeta(id, { pinned: !currentPinned }).then((updatedSession) => {
      setSessions((prev) =>
        prev.map((session) => (session.id === id ? updatedSession : session))
      );
    });
  };

  const currentSessionTitle =
    sessions.find((session) => session.id === currentSessionId)?.title || 'New conversation';
  const lastUserPrompt = [...messages].reverse().find((message) => message.role === 'user')?.content;

  const handleCopyTranscript = async () => {
    const transcript = messages
      .map((message) => `${message.role === 'user' ? 'You' : message.agent || 'MAYA'}: ${message.content}`)
      .join('\n\n');

    if (!transcript) {
      return;
    }

    await navigator.clipboard.writeText(transcript);
  };

  const handleRegenerate = async () => {
    if (!lastUserPrompt || isLoading) {
      return;
    }

    await handleSend(lastUserPrompt);
  };

  const handleEditAndResend = async (_messageId: string, content: string) => {
    handleStop();
    await handleSend(content, { resetSession: true });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachments((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          url: reader.result as string,
          name: file.name,
          type: file.type,
        },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

  const handleSend = async (forcedInput?: string, options?: { resetSession?: boolean }) => {
    const textToSend = forcedInput || input;
    if (!textToSend.trim() || isLoading) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      type: 'text',
    };

    const assistantMessageId = `${Date.now()}-assistant`;
    const streamingPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'text',
      isStreaming: true,
    };

    const base64Images = options?.resetSession ? [] : attachments.map((attachment) => attachment.url);
    const useStreaming = base64Images.length === 0;

    if (options?.resetSession) {
      setMessages(useStreaming ? [userMsg, streamingPlaceholder] : [userMsg]);
      setCurrentSessionId(null);
    } else {
      setMessages((prev) => (useStreaming ? [...prev, userMsg, streamingPlaceholder] : [...prev, userMsg]));
    }

    setInput('');
    setIsLoading(true);
    setAttachments([]);

    try {
      if (useStreaming) {
        await chatService.streamChatAgent(textToSend, {
          session_id: options?.resetSession ? undefined : currentSessionId || undefined,
          signal: controller.signal,
          onSession: (sessionId) => {
            setCurrentSessionId(sessionId);
          },
          onMeta: (agent) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, agent }
                  : msg
              )
            );
          },
          onChunk: (chunk) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: `${msg.content}${chunk}`, isStreaming: true }
                  : msg
              )
            );
          },
          onDone: (data) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: data.response,
                      agent: data.agent,
                      schemes: data.schemes || [],
                      type: data.schemes && data.schemes.length > 0 ? 'scheme-list' : 'text',
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setCurrentSessionId(data.session_id);
            void loadSessions();
          },
          onError: (message) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: message,
                      type: 'text',
                      isStreaming: false,
                    }
                  : msg
              )
            );
          },
        });
        return;
      }

      const data = await chatService.chatAgent(
        textToSend,
        options?.resetSession ? undefined : currentSessionId || undefined,
        base64Images,
        controller.signal
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        type: data.schemes && data.schemes.length > 0 ? 'scheme-list' : 'text',
        schemes: data.schemes || [],
        agent: data.agent,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (data.session_id) {
        setCurrentSessionId(data.session_id);
        void loadSessions();
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('MAYA: Generation stopped by user');
        setMessages((prev) => prev.filter((msg) => !(msg.id === assistantMessageId && !msg.content)));
      } else {
        console.error('Agent Error:', error);

        if (useStreaming) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: "Sorry, I'm having trouble connecting to my agents. Please try again.",
                    type: 'text',
                    isStreaming: false,
                  }
                : msg
            )
          );
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: "Sorry, I'm having trouble connecting to my agents. Please try again.",
              timestamp: new Date(),
              type: 'text',
            },
          ]);
        }
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSessionHistory}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        isSearching={isSearchingSessions}
        user={currentUser}
        isUserLoading={isUserLoading}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col relative w-full h-full border-l border-white/5">
        <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 bg-black/85 z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-text-secondary hover:text-white transition-colors">
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 transition-all hover:bg-white/[0.05]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-white/95">{currentSessionTitle}</div>
                <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                  <span>MAYA 1.0</span>
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  <span>Streaming mode</span>
                </div>
              </div>
              <ChevronDown size={14} className="text-text-secondary transition-colors group-hover:text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleRegenerate}
              disabled={!lastUserPrompt || isLoading}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={13} />
              <span>Regenerate</span>
            </button>
            <button
              onClick={handleCopyTranscript}
              disabled={messages.length === 0}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Copy size={13} />
              <span>Copy chat</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-text-secondary">
              <Sparkles size={12} className="text-primary" />
              <span>STREAMING ORCHESTRATOR</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>
                {isUserLoading
                  ? 'Checking account...'
                  : currentUser?.email
                    ? `Signed in as ${currentUser.email}`
                    : isPublicChatDemo
                      ? 'Public demo mode'
                      : 'No user loaded'}
              </span>
            </div>
          </div>
        </div>

        <Conversation className="min-h-0">
          <ConversationContent ref={scrollRef} className="pb-6 md:pb-8">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center min-h-[60vh]">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 animate-in zoom-in duration-500">
                  <Sparkles size={32} className="text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3 animate-in fade-in slide-in-from-bottom-3 duration-700">How can I help you grow?</h1>
                <p className="text-text-secondary max-w-md mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  Ask about market trends, schemes, or business ideas in India.
                </p>

                <div className="grid grid-cols-1 gap-3 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                  {[
                    {
                      label: 'Funding & Grants',
                      prompts: ['Show me Startup Schemes', 'Loan for Textile Machinery'],
                    },
                    {
                      label: 'Strategy & Growth',
                      prompts: ['Business Plan for a Cafe', 'Market Trends in AI'],
                    },
                  ].map((group) => (
                    <div key={group.label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-left">
                      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-primary/70">{group.label}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.prompts.map((hint) => (
                          <button
                            key={hint}
                            onClick={() => handleSend(hint)}
                            className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm hover:border-primary/40 transition-all hover:bg-white/[0.05] group"
                          >
                            <span className="block text-white/90">{hint}</span>
                            <span className="mt-2 block text-xs text-text-secondary group-hover:text-white/70">
                              Launch this as your first prompt
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-full w-full items-end">
                <div className="max-w-[850px] mx-auto w-full space-y-8 pt-4">
                {messages.map((msg) => (
                  <MessageComponent key={msg.id} message={msg} onEditAndResend={handleEditAndResend} />
                ))}
                {isLoading && (
                  <Reasoning isStreaming={isLoading}>
                    <ReasoningTrigger />
                    <ReasoningContent>{'Analyzing your query and coordinating the best response path...'}</ReasoningContent>
                  </Reasoning>
                )}
                <div ref={messagesEndRef} className="h-10" />
                </div>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton containerRef={scrollRef} />

          <div className="shrink-0 border-t border-white/5 bg-black px-4 pb-5 pt-4">
            <div className="mx-auto max-w-[800px]">
              <PromptInput
                onSubmit={(text) => handleSend(text)}
                isLoading={isLoading}
                className="relative rounded-[30px] border border-white/12 bg-[#2b2b2f] shadow-[0_10px_28px_rgba(0,0,0,0.24)] transition-colors duration-200 focus-within:border-white/20"
              >
                <div className="absolute bottom-3 left-3 z-10 flex items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/8 hover:text-white"
                    title="Attach file"
                  >
                    <PlusCircle size={21} strokeWidth={2.2} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="flex flex-col w-full min-h-[60px]">
                  {attachments.length > 0 && (
                    <div className="px-3 pb-1 pt-3 sm:pl-14 sm:pr-28">
                      <Attachments>
                        {attachments.map((att) => (
                          <Attachment
                            key={att.id}
                            data={{ id: att.id, url: att.url, filename: att.name, mediaType: att.type, type: 'file' }}
                            onRemove={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                          >
                            <AttachmentPreview />
                            <AttachmentRemove />
                          </Attachment>
                        ))}
                      </Attachments>
                    </div>
                  )}

                  <PromptInputTextarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onSubmit={(text) => handleSend(text)}
                    isLoading={isLoading}
                    placeholder="Message MAYA..."
                    className={
                      attachments.length > 0
                        ? 'min-h-[58px] border-0 rounded-t-none bg-transparent pb-4 pl-14 pr-28 pt-2 text-[16px] placeholder:text-white/45'
                        : 'min-h-[58px] border-0 bg-transparent pb-4 pl-14 pr-28 text-[16px] placeholder:text-white/45'
                    }
                  />
                </div>

                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
                  <button
                    type="button"
                    className="rounded-full p-2 text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                    title="Voice input"
                  >
                    <Mic size={20} strokeWidth={2.1} />
                  </button>
                  <PromptInputSubmit
                    status={isLoading ? 'streaming' : 'idle'}
                    onStop={handleStop}
                    disabled={!input.trim() && !isLoading}
                    className={
                      isLoading
                        ? 'h-11 w-11 rounded-full border border-white/10 bg-white/12 text-white hover:bg-white/18'
                        : 'h-11 w-11 rounded-full bg-[#198CFF] text-white hover:bg-[#3399ff]'
                    }
                  />
                </div>
              </PromptInput>
            </div>
          </div>
        </Conversation>
      </div>
    </div>
  );
}
