import api from '../api/axios';
import { supabase } from '../lib/supabase';
import type { AuthProfile, ChatSessionSummary } from '../types';

// 1. Updated Scheme Interface (Matches your Neon DB + AI Analyst)
export interface Scheme {
    id: string | number;
    name: string;
    description: string;
    benefits: string[]; // Updated to Array for your dynamic lists
    category: string;
    link: string;
    relevance_score?: number; // Added for AI ranking
    explanation?: string;     // Added for AI reasoning
    key_benefit?: string;     // Added for the 'Key Benefit' UI section
    tags?: string[];          // Added for the tag badges
}

// 2. Updated ChatResponse (Fixes the 'schemes' property error)
export interface ChatResponse {
    response: string;
    agent: string;
    session_id: string;
    schemes: Scheme[]; // <--- CRITICAL FIX: TypeScript now knows about schemes
}

type StreamEvent =
    | { type: 'session'; session_id: string }
    | { type: 'meta'; agent: string }
    | { type: 'delta'; content: string }
    | { type: 'done'; response: string; agent: string; session_id: string; schemes: Scheme[] }
    | { type: 'error'; message: string };

export const chatService = {
    getProfile: async (): Promise<AuthProfile> => {
        try {
            const response = await api.get<AuthProfile>('/me');
            return response.data;
        } catch (error) {
            console.error("Error fetching profile:", error);
            throw error;
        }
    },

    // Agent Chat - The primary endpoint for MAYA Multi-Agent system
    chatAgent: async (message: string, session_id?: string, attachments?: string[], signal?: AbortSignal): Promise<ChatResponse> => {
        try {
            // Backend expects attachments as a list of strings
            const response = await api.post<ChatResponse>('/api/chat/agent', { 
                message, 
                session_id,
                attachments 
            },{ signal });
            return response.data;
        } catch (error) {
            console.error("Error in MAYA Agent chat:", error);
            throw error;
        }
    },

    streamChatAgent: async (
        message: string,
        options: {
            session_id?: string;
            signal?: AbortSignal;
            onSession?: (sessionId: string) => void;
            onMeta?: (agent: string) => void;
            onChunk?: (chunk: string) => void;
            onDone?: (payload: ChatResponse) => void;
            onError?: (message: string) => void;
        } = {}
    ): Promise<void> => {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            throw error;
        }

        const token = data.session?.access_token;
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat/agent/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                message,
                session_id: options.session_id,
            }),
            signal: options.signal,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to stream chat response.');
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Streaming response body is not available.');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        const handleEvent = (event: StreamEvent) => {
            if (event.type === 'session') {
                options.onSession?.(event.session_id);
                return;
            }

            if (event.type === 'meta') {
                options.onMeta?.(event.agent);
                return;
            }

            if (event.type === 'delta') {
                options.onChunk?.(event.content);
                return;
            }

            if (event.type === 'done') {
                options.onDone?.({
                    response: event.response,
                    agent: event.agent,
                    session_id: event.session_id,
                    schemes: event.schemes || [],
                });
                return;
            }

            options.onError?.(event.message);
        };

        while (true) {
            const { value, done } = await reader.read();
            buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) {
                    continue;
                }
                handleEvent(JSON.parse(trimmed) as StreamEvent);
            }

            if (done) {
                break;
            }
        }

        const finalLine = buffer.trim();
        if (finalLine) {
            handleEvent(JSON.parse(finalLine) as StreamEvent);
        }
    },

    // Search Schemes - Direct vector search (optional fallback)
    searchSchemes: async (message: string): Promise<Scheme[]> => {
        try {
            const response = await api.post<Scheme[]>('/api/chat/schemes', { message });
            return response.data;
        } catch (error) {
            console.error("Error searching schemes:", error);
            throw error;
        }
    },
    
    // Sessions Management
    getSessions: async (): Promise<ChatSessionSummary[]> => {
        try {
            const response = await api.get<{ sessions: ChatSessionSummary[] }>('/api/history/sessions');
            return response.data.sessions;
        } catch (error) {
            console.error("Error fetching sessions:", error);
            throw error;
        }
    },

    searchSessions: async (query: string): Promise<ChatSessionSummary[]> => {
        try {
            const response = await api.get<{ sessions: ChatSessionSummary[] }>('/api/history/search', {
                params: { q: query },
            });
            return response.data.sessions;
        } catch (error) {
            console.error("Error searching sessions:", error);
            throw error;
        }
    },

    updateSessionMeta: async (session_id: string, payload: { title?: string; pinned?: boolean }) => {
        try {
            const response = await api.patch<ChatSessionSummary>(`/api/history/${session_id}/meta`, payload);
            return response.data;
        } catch (error) {
            console.error("Error updating session metadata:", error);
            throw error;
        }
    },

    deleteSession: async (session_id: string) => {
        try {
            await api.delete(`/api/history/${session_id}`);
        } catch (error) {
            console.error("Error deleting session:", error);
            throw error;
        }
    },

    // History for a specific chat
    getSessionHistory: async (session_id: string) => {
        try {
            const response = await api.get(`/api/history/${session_id}`);
            return response.data.history || response.data; // Handles both list and object formats
        } catch (error) {
            console.error("Error fetching history:", error);
            throw error;
        }
    },

    // Simple AI Test (Mimo Service)
    testAi: async (message: string) => {
         try {
            const response = await api.post('/api/test-ai', { message });
            return response.data;
        } catch (error) {
            console.error("Error testing AI:", error);
            throw error;
        }
    }
};
