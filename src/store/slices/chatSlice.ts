import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "@/types/chat";

interface TypingStatus {
  hashId: string;
  isTyping: boolean;
}

interface Sender {
  name: string;
  avatar: string;
  email: string;
  [key: string]: any;
}

interface LastMessage {
  conversationId: string;
  content: string;
  senderId: string;
  sender: Sender;
  timestamp: string; // ISO date string
  [key: string]: any;
}

interface ActiveChat {
  _id: string;
  participants: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v?: number;
  type: "direct" | "group" | string;
  lastMessage?: LastMessage;
  // reducer accesses `.messages`, include it if active chat can carry messages
  messages?: Message[];
}

interface UserStatus {
  userId: string;
  status: boolean;
  lastActive?: Date;
}
interface ChatState {
  chats: any[]; // Define a proper type for chats
  users: any[]; // Define a proper type for users
  activeChat: ActiveChat | null; // Define a proper type for activeChat
  messages: Message[];
  unreadCount: {
    conversationId: string;
    unreadCount: number;
    currentUserId: string;
  } | null;
  lastMessage: LastMessage | null;
  typingStatus: TypingStatus | null;
  userStatus: UserStatus | null;
}

const initialState: ChatState = {
  chats: [],
  users: [],
  unreadCount: null,
  lastMessage: null,
  activeChat: null,
  messages: [],
  typingStatus: null,
  userStatus: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<any[]>) => {
      state.chats = action.payload;
    },
    setUsers: (state, action: PayloadAction<any[]>) => {
      state.users = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<any | null>) => {
      state.activeChat = action.payload;
      state.messages = action.payload?.messages || [];
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateTypingStatus: (state, action: PayloadAction<TypingStatus>) => {
      state.typingStatus = action.payload;
    },
    setLastMessage: (state, action: PayloadAction<LastMessage>) => {
      state.lastMessage = action.payload;
    },
    setUnreadCount: (
      state,
      action: PayloadAction<
        { conversationId: string; unreadCount: number; currentUserId: string } | null
      >
    ) => {
      state.unreadCount = action.payload;
    },
    updateUserStatus: (state, action: PayloadAction<UserStatus>) => {
      state.userStatus = action.payload;
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ messageId: string; status: boolean }>
    ) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find((msg) => msg._id === messageId);
      if (message) {
        message.read = status;
      }
    },
  },
});

export const {
  setChats,
  setUsers,
  setActiveChat,
  setUnreadCount,
  addMessage,
  setLastMessage,
  setMessages,
  updateMessageStatus,
  updateTypingStatus,
  updateUserStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
