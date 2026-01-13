import api from '../api/axios';

export interface Scheme {
    id: number;
    name: string;
    description: string;
    benefits: string;
    category: string;
    link: string;
}

export interface ChatResponse {
    response: string;
    agent: string;
    session_id?: string;
}

export const chatService = {
    searchSchemes: async (message: string): Promise<Scheme[]> => {
        try {
            const response = await api.post<Scheme[]>('/api/chat/schemes', { message });
            return response.data;
        } catch (error) {
            console.error("Error searching schemes:", error);
            throw error;
        }
    },
    
    testAi: async (message: string) => {
         try {
            const response = await api.post('/api/test-ai', { message });
            return response.data;
        } catch (error) {
            console.error("Error testing AI:", error);
            throw error;
        }
    },

    chatAgent: async (message: string, session_id?: string): Promise<ChatResponse> => {
        try {
            const response = await api.post<ChatResponse>('/api/chat/agent', { message, session_id });
            return response.data;
        } catch (error) {
            console.error("Error in agent chat:", error);
            throw error;
        }
    },

    getSessions: async (): Promise<string[]> => {
        try {
            const response = await api.get<{ sessions: string[] }>('/api/history/sessions');
            return response.data.sessions;
        } catch (error) {
            console.error("Error fetching sessions:", error);
            throw error;
        }
    },

    getSessionHistory: async (session_id: string) => {
        try {
            const response = await api.get(`/api/history/${session_id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching history:", error);
            throw error;
        }
    }
};
