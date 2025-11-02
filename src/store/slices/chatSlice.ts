import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "@/types/chat";

interface TypingStatus {
  hashId: string;
  isTyping: boolean;
}
interface UserStatus {
  userId: string;
  status: boolean;
  lastActive?: Date;
}
interface ChatState {
  chats: any[]; // Define a proper type for chats
  users: any[]; // Define a proper type for users
  activeChat: any | null; // Define a proper type for activeChat
  messages: Message[];
  typingStatus: TypingStatus | null;
  userStatus: UserStatus | null;
}

const initialState: ChatState = {
  chats: [],
  users: [],
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
    updateUserStatus: (state, action: PayloadAction<UserStatus>) => {
      state.userStatus = action.payload;
    },
  },
});

export const {
  setChats,
  setUsers,
  setActiveChat,
  addMessage,
  setMessages,
  updateTypingStatus,
  updateUserStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
