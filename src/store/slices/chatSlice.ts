import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "@/types/chat";

interface TypingStatus {
  hashId: string;
  isTyping: boolean;
}

interface LastMessage {
  timestamp: string | null;
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
  lastMessage: LastMessage | null;
  typingStatus: TypingStatus | null;
  userStatus: UserStatus | null;
}

const initialState: ChatState = {
  chats: [],
  users: [],
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
  addMessage,
  setLastMessage,
  setMessages,
  updateMessageStatus,
  updateTypingStatus,
  updateUserStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
