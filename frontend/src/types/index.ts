import { Scheme } from '../components/SchemeCard';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'scheme-list';
  schemes?: Scheme[];
}
