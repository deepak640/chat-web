import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  users: [],
  activeChat: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
  },
});

export const { setChats, setUsers, setActiveChat } = chatSlice.actions;
export default chatSlice.reducer;
