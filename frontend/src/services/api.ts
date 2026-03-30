import api from '../api/axios';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Scheme {
    id: string | number;
    name: string;
    description: string;
    benefits: string[];
    category: string;
    link: string;
    relevance_score?: number;
    explanation?: string;
    key_benefit?: string;
    tags?: string[];
    required_documents?: string[];
    application_mode?: string;
    eligibility_criteria?: Record<string, any>;
}

/** V2: full conversation response from /api/chat/agent */
export interface ChatResponse {
    response: string;
    agent: string;
    session_id: string;         // kept for backwards compat
    conversation_id?: string;   // V2: prefer this
    schemes: Scheme[];
}

export interface ChatPayload {
    message: string;
    conversation_id?: string | null;
    clerk_user_id?: string | null;
    session_id?: string | null;   // legacy compat
    agent?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING: chatAgent — scheme queries + legacy text (JSON, non-streaming)
// ─────────────────────────────────────────────────────────────────────────────

export const chatService = {
    /** Agent Chat — primary endpoint for scheme queries */
    chatAgent: async (
        message: string,
        conversation_id?: string | null,
        signal?: AbortSignal
    ): Promise<ChatResponse> => {
        try {
            const response = await api.post<ChatResponse>(
                '/api/chat/agent',
                {
                    message,
                    conversation_id: conversation_id || null,
                    session_id: conversation_id || null,  // legacy compat
                },
                { signal }
            );
            return response.data;
        } catch (error) {
            console.error('Error in MAYA Agent chat:', error);
            throw error;
        }
    },

    /** Direct vector scheme search (optional fallback) */
    searchSchemes: async (message: string): Promise<Scheme[]> => {
        try {
            const response = await api.post<Scheme[]>('/api/chat/schemes', { message });
            return response.data;
        } catch (error) {
            console.error('Error searching schemes:', error);
            throw error;
        }
    },

    /** Returns list of conversations (most recent first) */
    getSessions: async (): Promise<{ id: string; title: string }[]> => {
        try {
            const response = await api.get<{ sessions: { id: string; title: string }[] }>(
                '/api/history/sessions'
            );
            return response.data.sessions || [];
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
    },

    getSessionHistory: async (conversation_id: string) => {
        try {
            const response = await api.get(`/api/history/${conversation_id}`);
            return response.data.history || response.data;
        } catch (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
    },

    /** Renames a session title */
    renameSession: async (conversation_id: string, newTitle: string): Promise<boolean> => {
        try {
            await api.put(`/api/history/${conversation_id}`, { title: newTitle });
            return true;
        } catch (error) {
            console.error('Error renaming session:', error);
            return false;
        }
    },

    /** Deletes a session and all its messages */
    deleteSession: async (conversation_id: string): Promise<boolean> => {
        try {
            await api.delete(`/api/history/${conversation_id}`);
            return true;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    },

    /** Simple AI Test (Mimo Service) */
    testAi: async (message: string) => {
        try {
            const response = await api.post('/api/test-ai', { message });
            return response.data;
        } catch (error) {
            console.error('Error testing AI:', error);
            throw error;
        }
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW: chatStream — text agents via SSE (Step 3.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * chatStream — uses browser-native fetch() + ReadableStream for SSE.
 * Axios cannot read SSE chunks natively, so we drop down to fetch here.
 *
 * Event types from server:
 *   init  { type: 'init',  conversation_id: string }
 *   chunk { type: 'chunk', text: string }
 *   done  { type: 'done' }
 *   error { type: 'error', message: string }
 *
 * @param payload        - Request body
 * @param onChunk        - Called for each text chunk
 * @param onInit         - Called once with the conversation_id
 * @param onDone         - Called when stream is complete
 * @param onError        - Called if stream encounters an error
 */
export const chatStream = async (
    payload: ChatPayload,
    onChunk: (text: string) => void,
    onInit: (conversationId: string) => void,
    onDone: () => void,
    onError: (msg: string) => void,
    signal?: AbortSignal
): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE}/api/chat/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal,
        });

        if (!response.ok) {
            onError(`Server error: ${response.status}`);
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        // ── KEY FIX: buffer accumulates raw text across multiple read() calls.
        // A single read() can deliver a partial SSE frame, or multiple frames
        // glued together. We only parse when we see a complete "\n\n" boundary.
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Append new bytes to buffer (keep stream:true for multi-byte chars)
            buffer += decoder.decode(value, { stream: true });

            // Split on the SSE double-newline boundary
            const parts = buffer.split('\n\n');

            // Last element may be an incomplete frame — keep it in the buffer
            buffer = parts.pop() ?? '';

            for (const part of parts) {
                const line = part.trim();
                if (!line.startsWith('data: ')) continue;
                try {
                    const event = JSON.parse(line.slice(6)); // remove "data: "
                    if (event.type === 'ping')  continue;           // ignore keepalive
                    if (event.type === 'init')  onInit(event.conversation_id);
                    if (event.type === 'chunk') onChunk(event.text);
                    if (event.type === 'done')  onDone();
                    if (event.type === 'error') onError(event.message);
                } catch {
                    /* malformed frame — skip silently */
                }
            }
        }
    } catch (err: any) {
        if (err?.name === 'AbortError') return;   // user cancelled — not an error
        console.error('chatStream error:', err);
        onError('Connection error. Please try again.');
    }
};