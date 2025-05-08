// types.ts

export interface Message {
  _id: string;
  content: string;
  sender: string;
  timestamp: string | Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Conversation {
  _id: string;
  name:string;
  participants: string[];  // Array of user IDs (e.g., [currentUserId, otherUserId])
  messages: Message[];      // List of messages in the conversation
}
