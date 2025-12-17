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

export interface ActiveChat {
  _id: string;
  participants: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v?: number;
  type: "direct" | "group" | string;
  lastMessage?: LastMessage;
  unreadCount?: number;
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
  unreadCounts: { [conversationId: string]: number }; // Changed from unreadCount
  lastMessage: LastMessage | null;
  typingStatus: TypingStatus | null;
  userStatuses: {
    [userId: string]: UserStatus;
  };
}

const initialState: ChatState = {
  chats: [],
  users: [],
  unreadCounts: {}, // Changed from unreadCount
  lastMessage: null,
  activeChat: null,
  messages: [],
  typingStatus: null,
  userStatuses: {},
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
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((userId) => {
        state.userStatuses[userId] = {
          userId,
          status: true,
        };
      });
    },
    updateTypingStatus: (state, action: PayloadAction<TypingStatus>) => {
      state.typingStatus = action.payload;
    },
    setLastMessage: (state, action: PayloadAction<LastMessage>) => {
      state.lastMessage = action.payload;
    },
    setInitialUnreadCounts: (
      state,
      action: PayloadAction<{ [conversationId: string]: number }>
    ) => {
      state.unreadCounts = action.payload;
    },
    setUnreadCount: (
      state,
      action: PayloadAction<{
        conversationId: string;
        unreadCount: number;
      }>
    ) => {
      state.unreadCounts[action.payload.conversationId] =
        action.payload.unreadCount;
    },
    updateUnreadCount: (
      state,
      action: PayloadAction<{
        conversationId: string;
        delta?: number;
        unreadCount?: number;
      }>
    ) => {
      const { conversationId, delta, unreadCount } = action.payload;

      if (typeof unreadCount === "number") {
        // absolute set (used when opening chat)
        state.unreadCounts[conversationId] = unreadCount;
      } else if (typeof delta === "number") {
        // increment (used when receiving message)
        state.unreadCounts[conversationId] =
          (state.unreadCounts[conversationId] || 0) + delta;
      }
    },
    updateUserStatus: (state, action: PayloadAction<UserStatus>) => {
      const { userId } = action.payload;
      state.userStatuses[userId] = action.payload;
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageIds: string[];
        status: boolean;
        conversationId: string;
      }>
    ) => {
      const { messageIds, status, conversationId } = action.payload;

      // ❗ FIX: Only update when the user is viewing THIS conversation
      if (!state.activeChat || state.activeChat._id !== conversationId) {
        return; // ignore update for other conversations
      }
      console.log(
        state.messages.map((msg) => msg._id),
        messageIds
      );
      // state.messages = state.messages.map((msg) => ({ ...msg, read: status }));
      state.messages = state.messages.map((msg) => {
        if (messageIds.includes(msg._id)) {
          return { ...msg, read: status };
        }
        return msg;
      });
    },
  },
});

export const {
  setChats,
  setUsers,
  setActiveChat,
  setInitialUnreadCounts,
  updateUnreadCount,
  setUnreadCount,
  addMessage,
  setOnlineUsers,
  setLastMessage,
  setMessages,
  updateMessageStatus,
  updateTypingStatus,
  updateUserStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
