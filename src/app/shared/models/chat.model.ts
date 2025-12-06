export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

