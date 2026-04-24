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
        signal?: AbortSignal,
        token?: string | null,
    ): Promise<ChatResponse> => {
        try {
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await api.post<ChatResponse>(
                '/api/chat/agent',
                {
                    message,
                    conversation_id: conversation_id || null,
                    session_id: conversation_id || null,  // legacy compat
                },
                { signal, headers }
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

    /** Returns list of conversations for the authenticated user (most recent first) */
    getSessions: async (token?: string | null): Promise<{ id: string; title: string }[]> => {
        try {
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await api.get<{ sessions: { id: string; title: string }[] }>(
                '/api/history/sessions',
                { headers }
            );
            return response.data.sessions || [];
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
    },

    getSessionHistory: async (conversation_id: string, token?: string | null) => {
        try {
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await api.get(`/api/history/${conversation_id}`, { headers });
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
// checkEligibility — rule-based, no LLM, fast
// ─────────────────────────────────────────────────────────────────────────────

export interface EligibilityResult {
    is_eligible: boolean;
    match_score: number;
    max_benefit: string;
    reasons: string[];
    missing_criteria: string[];
}

export async function checkEligibility(
    schemeName: string,
    token: string | null | undefined,
): Promise<EligibilityResult> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const encoded = encodeURIComponent(schemeName);
    const res = await fetch(`${API_BASE}/api/draft/eligibility/${encoded}`, { headers });
    if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.detail || `Server error ${res.status}`);
    }
    return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// reportStream — 5-agent business report via SSE (/api/chat/report)
// Events: init | progress {stage, message} | report {content, business_context} | done | error
// ─────────────────────────────────────────────────────────────────────────────

export const reportStream = async (
    payload: ChatPayload,
    onProgress: (stage: string, message: string) => void,
    onInit: (conversationId: string) => void,
    onReport: (content: string, businessContext: Record<string, any>) => void,
    onDone: () => void,
    onError: (msg: string) => void,
    signal?: AbortSignal,
    token?: string | null,
): Promise<void> => {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE}/api/chat/report`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal,
        });

        if (!response.ok) {
            onError(`Server error: ${response.status}`);
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() ?? '';

            for (const part of parts) {
                const line = part.trim();
                if (!line.startsWith('data: ')) continue;
                try {
                    const event = JSON.parse(line.slice(6));
                    if (event.type === 'init')     onInit(event.conversation_id);
                    if (event.type === 'progress') onProgress(event.stage, event.message);
                    if (event.type === 'report')   onReport(event.content, event.business_context || {});
                    if (event.type === 'done')     onDone();
                    if (event.type === 'error')    onError(event.message);
                } catch { /* malformed frame */ }
            }
        }
    } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('reportStream error:', err);
        onError('Connection error. Please try again.');
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Collection views — Reports, Schemes, Applications
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportItem {
    id: string;
    conversation_id: string;
    title: string;
    created_at: string;
    report: string;
    business_context: Record<string, any>;
}

export interface SchemeResultItem {
    id: string;
    conversation_id: string;
    title: string;
    created_at: string;
    summary: string;
    schemes: Scheme[];
}

export interface ApplicationItem {
    id: string;
    scheme_id: number;
    scheme_name: string;
    scheme_category: string;
    scheme_description: string;
    scheme_link: string;
    application_status: string;
    updated_at: string;
}

export const getReports = async (token?: string | null): Promise<{ reports: ReportItem[] }> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${API_BASE}/api/history/reports`, { headers });
        if (!res.ok) return { reports: [] };
        return res.json();
    } catch { return { reports: [] }; }
};

export const getSchemeResults = async (token?: string | null): Promise<{ scheme_results: SchemeResultItem[] }> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${API_BASE}/api/history/scheme-results`, { headers });
        if (!res.ok) return { scheme_results: [] };
        return res.json();
    } catch { return { scheme_results: [] }; }
};

export const getApplications = async (token?: string | null): Promise<{ applications: ApplicationItem[] }> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${API_BASE}/api/user/applications`, { headers });
        if (!res.ok) return { applications: [] };
        return res.json();
    } catch { return { applications: [] }; }
};

// ─────────────────────────────────────────────────────────────────────────────
// chatStream — text agents via SSE (Step 3.3)
// Now accepts an optional Clerk JWT token to pass as Authorization header.
// ─────────────────────────────────────────────────────────────────────────────

export const chatStream = async (
    payload: ChatPayload,
    onChunk: (text: string) => void,
    onInit: (conversationId: string) => void,
    onDone: () => void,
    onError: (msg: string) => void,
    signal?: AbortSignal,
    token?: string | null,
): Promise<void> => {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE}/api/chat/stream`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal,
        });

        if (!response.ok) {
            onError(`Server error: ${response.status}`);
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() ?? '';

            for (const part of parts) {
                const line = part.trim();
                if (!line.startsWith('data: ')) continue;
                try {
                    const event = JSON.parse(line.slice(6));
                    if (event.type === 'ping')  continue;
                    if (event.type === 'init')  onInit(event.conversation_id);
                    if (event.type === 'chunk') onChunk(event.text);
                    if (event.type === 'done')  onDone();
                    if (event.type === 'error') onError(event.message);
                } catch {
                    /* malformed frame — skip */
                }
            }
        }
    } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('chatStream error:', err);
        onError('Connection error. Please try again.');
    }
};