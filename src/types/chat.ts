export type UserStatus = "online" | "away" | "offline";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  lastSeen: Date;
  phone?: string;
  dob?: string;
  bio?: string;
}

export interface Message {
  _id: string;
  fileSize: number;
  content: string;
  sender: {
    name: string;
    avatar: string;
    email: string;
  };
  senderId: string;
  timestamp: Date;
  read: boolean;
  type?: "text" | "image" | "video" | "audio" | "file";
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface Chat {
  id: string;
  type: "direct" | "group";
  name?: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
}

export interface Notification {
  id: string;
  type: "message" | "mention" | "group-invite";
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  chatId?: string;
}
