import api from '../api/axios';

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

export const chatService = {
    // Agent Chat - The primary endpoint for MAYA Multi-Agent system
    chatAgent: async (message: string, session_id?: string, signal?: AbortSignal): Promise<ChatResponse> => {
        try {
            // Humne Backend mein User Profile default rakha hai, par aap yahan se bhej bhi sakte hain
            const response = await api.post<ChatResponse>('/api/chat/agent', { 
                message, 
                session_id 
            },{ signal });
            return response.data;
        } catch (error) {
            console.error("Error in MAYA Agent chat:", error);
            throw error;
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
    getSessions: async (): Promise<string[]> => {
        try {
            const response = await api.get<{ sessions: string[] }>('/api/history/sessions');
            return response.data.sessions;
        } catch (error) {
            console.error("Error fetching sessions:", error);
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