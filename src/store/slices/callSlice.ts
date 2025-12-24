import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CallState {
  isIncomingCall: boolean;
  isCallActive: boolean;
  offer: any | null; // WebRTC offer
  remoteUser: {
    _id: string;
    name: string;
    image?: string;
  } | null;
  callType: 'audio' | 'video';
}

const initialState: CallState = {
  isIncomingCall: false,
  isCallActive: false,
  offer: null,
  remoteUser: null,
  callType: 'video', // Default
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setIncomingCall: (state, action: PayloadAction<{ offer: any; fromUser: any }>) => {
      state.isIncomingCall = true;
      state.offer = action.payload.offer;
      state.remoteUser = action.payload.fromUser;
    },
    startCall: (state, action: PayloadAction<{ user: any; type: 'audio' | 'video' }>) => {
      state.isCallActive = true;
      state.isIncomingCall = false;
      state.remoteUser = action.payload.user;
      state.callType = action.payload.type;
    },
    callAccepted: (state) => {
      state.isIncomingCall = false;
      state.isCallActive = true;
    },
    acceptIncomingCall: (state) => {
      state.isIncomingCall = false;
      state.isCallActive = true;
    },
    endCallSession: (state) => {
      state.isIncomingCall = false;
      state.isCallActive = false;
      state.offer = null;
      state.remoteUser = null;
    },
  },
});

export const { setIncomingCall, startCall, acceptIncomingCall, endCallSession, callAccepted } = callSlice.actions;
export default callSlice.reducer;
