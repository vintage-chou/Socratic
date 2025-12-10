export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string for user uploaded images
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isSessionActive: boolean;
}

export enum StepType {
  UPLOAD = 'UPLOAD',
  CHAT = 'CHAT'
}